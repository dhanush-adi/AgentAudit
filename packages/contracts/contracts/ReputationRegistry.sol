// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IAgentRegistry {
    function ownerOf(uint256 agentId) external view returns (address);
    function getApproved(uint256 agentId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/// @title ReputationRegistry
/// @notice On-chain reputation and feedback system for AI agents in the AgentAudit protocol.
/// @dev Clients submit scored feedback with tags. Owners cannot review their own agents.
///      Feedback can be revoked. Responses can be appended to any feedback entry.
contract ReputationRegistry {
    address private immutable _identityRegistry;

    /// @notice Maximum feedback entries a single client can submit per agent (prevents storage bloat)
    uint256 public constant MAX_FEEDBACK_PER_CLIENT = 100;

    struct FeedbackData {
        int128 value;
        uint8 valueDecimals;
        string tag1;
        string tag2;
        bool isRevoked;
    }

    // agentId => clientAddress => feedbacks
    mapping(uint256 => mapping(address => FeedbackData[])) private _feedbacks;
    // agentId => clients array
    mapping(uint256 => address[]) private _clients;
    // agentId => clientAddress => hasClient
    mapping(uint256 => mapping(address => bool)) private _hasClient;

    /// @notice Emitted when new feedback is submitted
    /// @param agentId The agent receiving feedback
    /// @param clientAddress The address that submitted the feedback
    /// @param feedbackIndex 1-based index of the feedback within the client's array
    /// @param value The score value
    /// @param valueDecimals Decimal precision of the value
    /// @param tag1 The primary category tag (indexed for filtering)
    /// @param tag2 The secondary tag
    /// @param endpoint The API endpoint this feedback relates to
    /// @param feedbackURI Optional URI to detailed feedback metadata
    /// @param feedbackHash Hash of the feedback content for integrity
    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string indexed indexedTag1,
        string tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );

    /// @notice Emitted when feedback is revoked by the original submitter
    event FeedbackRevoked(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex);

    /// @notice Emitted when a response is appended to a feedback entry
    event ResponseAppended(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        address indexed responder,
        string responseURI,
        bytes32 responseHash
    );

    /// @param identityRegistry_ Address of the AgentRegistry contract
    constructor(address identityRegistry_) {
        _identityRegistry = identityRegistry_;
    }

    /// @notice Returns the address of the identity registry this contract references
    function getIdentityRegistry() external view returns (address) {
        return _identityRegistry;
    }

    /// @notice Submit feedback for an agent
    /// @param agentId The agent to review
    /// @param value The score value (can be negative)
    /// @param valueDecimals Number of decimal places for the value (0-18)
    /// @param tag1 Primary category tag
    /// @param tag2 Secondary tag
    /// @param endpoint The API endpoint being reviewed
    /// @param feedbackURI Optional URI to detailed feedback
    /// @param feedbackHash Hash of the feedback content
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external {
        require(valueDecimals <= 18, "Decimals must be 0-18");
        
        IAgentRegistry registry = IAgentRegistry(_identityRegistry);
        address owner = registry.ownerOf(agentId);
        
        require(
            msg.sender != owner && 
            registry.getApproved(agentId) != msg.sender && 
            !registry.isApprovedForAll(owner, msg.sender),
            "Cannot feedback own agent"
        );

        FeedbackData[] storage fbs = _feedbacks[agentId][msg.sender];
        require(fbs.length < MAX_FEEDBACK_PER_CLIENT, "Max feedback per client reached");

        fbs.push(FeedbackData({
            value: value,
            valueDecimals: valueDecimals,
            tag1: tag1,
            tag2: tag2,
            isRevoked: false
        }));
        
        uint64 feedbackIndex = uint64(fbs.length); // 1-indexed

        if (!_hasClient[agentId][msg.sender]) {
            _clients[agentId].push(msg.sender);
            _hasClient[agentId][msg.sender] = true;
        }

        emit NewFeedback(
            agentId,
            msg.sender,
            feedbackIndex,
            value,
            valueDecimals,
            tag1,
            tag1,
            tag2,
            endpoint,
            feedbackURI,
            feedbackHash
        );
    }

    /// @notice Revoke a previously submitted feedback entry
    /// @param agentId The agent the feedback was for
    /// @param feedbackIndex 1-based index of the feedback to revoke
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external {
        require(feedbackIndex > 0 && feedbackIndex <= _feedbacks[agentId][msg.sender].length, "Invalid index");
        FeedbackData storage data = _feedbacks[agentId][msg.sender][feedbackIndex - 1];
        require(!data.isRevoked, "Already revoked");
        
        data.isRevoked = true;
        emit FeedbackRevoked(agentId, msg.sender, feedbackIndex);
    }

    /// @notice Append a response to a feedback entry (open to anyone)
    /// @param agentId The agent the feedback is for
    /// @param clientAddress The address that submitted the original feedback
    /// @param feedbackIndex 1-based index of the feedback
    /// @param responseURI URI to the response content
    /// @param responseHash Hash of the response content
    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseURI,
        bytes32 responseHash
    ) external {
        require(feedbackIndex > 0 && feedbackIndex <= _feedbacks[agentId][clientAddress].length, "Invalid index");
        emit ResponseAppended(agentId, clientAddress, feedbackIndex, msg.sender, responseURI, responseHash);
    }

    /// @notice Compute an aggregated summary of feedback for an agent
    /// @param agentId The agent to summarize
    /// @param clientAddresses Array of client addresses to include
    /// @param tag1 Filter by primary tag (empty string = no filter)
    /// @param tag2 Filter by secondary tag (empty string = no filter)
    /// @return count Number of matching non-revoked feedback entries
    /// @return summaryValue The average value (with decimal normalization)
    /// @return summaryValueDecimals The decimal precision of the summary value
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals) {
        require(clientAddresses.length > 0, "Clients array required");
        int256 totalValue = 0;
        uint64 validCount = 0;
        uint8 maxDecimals = 0;

        // Single pass: find maxDecimals while counting
        for (uint256 i = 0; i < clientAddresses.length; i++) {
            FeedbackData[] storage fbs = _feedbacks[agentId][clientAddresses[i]];
            for (uint256 j = 0; j < fbs.length; j++) {
                if (fbs[j].isRevoked) continue;
                
                if (bytes(tag1).length > 0 && keccak256(bytes(fbs[j].tag1)) != keccak256(bytes(tag1))) continue;
                if (bytes(tag2).length > 0 && keccak256(bytes(fbs[j].tag2)) != keccak256(bytes(tag2))) continue;
                
                if (fbs[j].valueDecimals > maxDecimals) maxDecimals = fbs[j].valueDecimals;
            }
        }
        
        // Second pass: accumulate normalized values
        for (uint256 i = 0; i < clientAddresses.length; i++) {
            FeedbackData[] storage fbs = _feedbacks[agentId][clientAddresses[i]];
            for (uint256 j = 0; j < fbs.length; j++) {
                if (fbs[j].isRevoked) continue;
                
                if (bytes(tag1).length > 0 && keccak256(bytes(fbs[j].tag1)) != keccak256(bytes(tag1))) continue;
                if (bytes(tag2).length > 0 && keccak256(bytes(fbs[j].tag2)) != keccak256(bytes(tag2))) continue;
                
                int256 val = int256(fbs[j].value);
                if (fbs[j].valueDecimals < maxDecimals) {
                    val = val * int256(10 ** (maxDecimals - fbs[j].valueDecimals));
                }
                totalValue += val;
                validCount++;
            }
        }

        if (validCount > 0) {
            summaryValue = int128(totalValue / int256(uint256(validCount)));
        } else {
            summaryValue = 0;
        }
        
        return (validCount, summaryValue, maxDecimals);
    }

    /// @notice Read a single feedback entry
    /// @param agentId The agent
    /// @param clientAddress The client who submitted the feedback
    /// @param feedbackIndex 1-based index
    /// @return value The score value
    /// @return valueDecimals Decimal precision
    /// @return tag1 Primary tag
    /// @return tag2 Secondary tag
    /// @return isRevoked Whether the feedback has been revoked
    function readFeedback(uint256 agentId, address clientAddress, uint64 feedbackIndex) external view returns (
        int128 value,
        uint8 valueDecimals,
        string memory tag1,
        string memory tag2,
        bool isRevoked
    ) {
        require(feedbackIndex > 0 && feedbackIndex <= _feedbacks[agentId][clientAddress].length, "Invalid index");
        FeedbackData storage data = _feedbacks[agentId][clientAddress][feedbackIndex - 1];
        return (data.value, data.valueDecimals, data.tag1, data.tag2, data.isRevoked);
    }

    /// @notice Read all matching feedback entries across multiple clients
    /// @param agentId The agent to query
    /// @param clientAddresses Array of client addresses to include
    /// @param tag1 Filter by primary tag (empty = no filter)
    /// @param tag2 Filter by secondary tag (empty = no filter)
    /// @param includeRevoked Whether to include revoked feedback
    function readAllFeedback(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2,
        bool includeRevoked
    ) external view returns (
        address[] memory clients,
        uint64[] memory feedbackIndexes,
        int128[] memory values,
        uint8[] memory valueDecimals,
        string[] memory tag1s,
        string[] memory tag2s,
        bool[] memory revokedStatuses
    ) {
        uint256 matchCount = 0;
        for (uint256 i = 0; i < clientAddresses.length; i++) {
            FeedbackData[] storage fbs = _feedbacks[agentId][clientAddresses[i]];
            for (uint256 j = 0; j < fbs.length; j++) {
                if (!includeRevoked && fbs[j].isRevoked) continue;
                if (bytes(tag1).length > 0 && keccak256(bytes(fbs[j].tag1)) != keccak256(bytes(tag1))) continue;
                if (bytes(tag2).length > 0 && keccak256(bytes(fbs[j].tag2)) != keccak256(bytes(tag2))) continue;
                matchCount++;
            }
        }

        clients = new address[](matchCount);
        feedbackIndexes = new uint64[](matchCount);
        values = new int128[](matchCount);
        valueDecimals = new uint8[](matchCount);
        tag1s = new string[](matchCount);
        tag2s = new string[](matchCount);
        revokedStatuses = new bool[](matchCount);

        uint256 idx = 0;
        for (uint256 i = 0; i < clientAddresses.length; i++) {
            address client = clientAddresses[i];
            FeedbackData[] storage fbs = _feedbacks[agentId][client];
            for (uint256 j = 0; j < fbs.length; j++) {
                if (!includeRevoked && fbs[j].isRevoked) continue;
                if (bytes(tag1).length > 0 && keccak256(bytes(fbs[j].tag1)) != keccak256(bytes(tag1))) continue;
                if (bytes(tag2).length > 0 && keccak256(bytes(fbs[j].tag2)) != keccak256(bytes(tag2))) continue;
                
                clients[idx] = client;
                feedbackIndexes[idx] = uint64(j + 1);
                values[idx] = fbs[j].value;
                valueDecimals[idx] = fbs[j].valueDecimals;
                tag1s[idx] = fbs[j].tag1;
                tag2s[idx] = fbs[j].tag2;
                revokedStatuses[idx] = fbs[j].isRevoked;
                idx++;
            }
        }
    }

    /// @notice Get all client addresses that have submitted feedback for an agent
    function getClients(uint256 agentId) external view returns (address[] memory) {
        return _clients[agentId];
    }

    /// @notice Get the number of feedback entries a client has submitted for an agent
    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64) {
        return uint64(_feedbacks[agentId][clientAddress].length);
    }
}
