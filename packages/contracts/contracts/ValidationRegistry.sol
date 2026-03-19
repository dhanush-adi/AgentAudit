// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IAgentRegistry {
    function ownerOf(uint256 agentId) external view returns (address);
    function getApproved(uint256 agentId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/// @title ValidationRegistry
/// @notice On-chain validation workflow for AI agents in the AgentAudit protocol.
/// @dev Agent owners request validation from designated validators who respond with
///      scores and tags. Prevents duplicate responses and enforces authorization.
contract ValidationRegistry {
    address private immutable _identityRegistry;

    /// @notice Default validation request expiry (24 hours)
    uint256 public constant DEFAULT_VALIDATION_EXPIRY = 24 hours;

    struct ValidationData {
        address validatorAddress;
        uint256 agentId;
        uint8 response; // 0-100
        bytes32 responseHash;
        string tag;
        uint256 lastUpdate;
        uint256 expiresAt;
        bool exists;
        bool hasResponded;
    }

    mapping(bytes32 => ValidationData) private _validations;
    mapping(uint256 => bytes32[]) private _agentValidations;
    mapping(address => bytes32[]) private _validatorRequests;

    /// @notice Emitted when a validation request is created
    /// @param validatorAddress The designated validator
    /// @param agentId The agent to validate
    /// @param requestURI URI to the validation request content
    /// @param requestHash Unique hash identifying this request
    event ValidationRequest(
        address indexed validatorAddress,
        uint256 indexed agentId,
        string requestURI,
        bytes32 requestHash
    );

    /// @notice Emitted when a validator responds to a request
    /// @param requestHash The request being responded to
    /// @param response The score (0-100)
    /// @param responseURI URI to the response content
    /// @param responseHash Hash of the response content
    /// @param tag Validation category tag
    event ValidationResponse(
        bytes32 indexed requestHash,
        uint8 response,
        string responseURI,
        bytes32 responseHash,
        string tag
    );

    /// @notice Emitted when an expired validation is reclaimed by the agent owner
    /// @param requestHash The expired request hash
    /// @param agentId The agent that was being validated
    event ValidationExpired(bytes32 indexed requestHash, uint256 indexed agentId);

    /// @param identityRegistry_ Address of the AgentRegistry contract
    constructor(address identityRegistry_) {
        _identityRegistry = identityRegistry_;
    }

    /// @notice Request validation for an agent from a designated validator
    /// @param validatorAddress The address of the validator to assign
    /// @param agentId The agent to validate
    /// @param requestURI URI to the validation request content
    /// @param requestHash Unique hash for this request (must not already exist)
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external {
        IAgentRegistry registry = IAgentRegistry(_identityRegistry);
        address owner = registry.ownerOf(agentId);
        require(
            owner == msg.sender || 
            registry.getApproved(agentId) == msg.sender || 
            registry.isApprovedForAll(owner, msg.sender),
            "Not owner or operator"
        );
        require(!_validations[requestHash].exists, "Hash already used");

        _validations[requestHash] = ValidationData({
            validatorAddress: validatorAddress,
            agentId: agentId,
            response: 0,
            responseHash: bytes32(0),
            tag: "",
            lastUpdate: block.timestamp,
            expiresAt: block.timestamp + DEFAULT_VALIDATION_EXPIRY,
            exists: true,
            hasResponded: false
        });

        _agentValidations[agentId].push(requestHash);
        _validatorRequests[validatorAddress].push(requestHash);

        emit ValidationRequest(validatorAddress, agentId, requestURI, requestHash);
    }

    /// @notice Respond to a validation request (only callable by the designated validator)
    /// @param requestHash The request to respond to
    /// @param response Score from 0-100
    /// @param responseURI URI to the response content
    /// @param responseHash Hash of the response content
    /// @param tag Validation category tag
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external {
        require(response <= 100, "Response must be 0-100");
        ValidationData storage data = _validations[requestHash];
        require(data.exists, "Request does not exist");
        require(!data.hasResponded, "Already responded");
        require(data.validatorAddress == msg.sender, "Not authorized validator");
        require(block.timestamp <= data.expiresAt, "Validation request expired");

        data.response = response;
        data.responseHash = responseHash;
        data.tag = tag;
        data.lastUpdate = block.timestamp;
        data.hasResponded = true;

        emit ValidationResponse(requestHash, response, responseURI, responseHash, tag);
    }

    /// @notice Reclaim an expired validation request (only callable by agent owner)
    /// @param requestHash The expired request hash
    function reclaimExpired(bytes32 requestHash) external {
        ValidationData storage data = _validations[requestHash];
        require(data.exists, "Request does not exist");
        require(!data.hasResponded, "Already responded");
        require(block.timestamp > data.expiresAt, "Not yet expired");

        IAgentRegistry registry = IAgentRegistry(_identityRegistry);
        require(registry.ownerOf(data.agentId) == msg.sender, "Not agent owner");

        data.exists = false;
        emit ValidationExpired(requestHash, data.agentId);
    }

    /// @notice Get the status of a validation request
    /// @param requestHash The request to query
    function getValidationStatus(bytes32 requestHash) external view returns (
        address validatorAddress,
        uint256 agentId,
        uint8 response,
        bytes32 responseHash,
        string memory tag,
        uint256 lastUpdate
    ) {
        ValidationData storage data = _validations[requestHash];
        require(data.exists, "Request does not exist");
        
        return (
            data.validatorAddress,
            data.agentId,
            data.response,
            data.responseHash,
            data.tag,
            data.lastUpdate
        );
    }

    /// @notice Compute an aggregated summary of validations for an agent
    /// @param agentId The agent to summarize
    /// @param validatorAddresses Array of validator addresses to include
    /// @param tag Filter by tag (empty string = no filter)
    /// @return count Number of matching responded validations
    /// @return averageResponse Average score (0-100)
    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 averageResponse) {
        uint256 total = 0;
        uint64 validCount = 0;

        for (uint256 i = 0; i < validatorAddresses.length; i++) {
            address validator = validatorAddresses[i];
            bytes32[] storage hashes = _validatorRequests[validator];
            for (uint256 j = 0; j < hashes.length; j++) {
                ValidationData storage data = _validations[hashes[j]];
                if (data.agentId != agentId) continue;
                if (!data.hasResponded) continue;
                if (bytes(tag).length > 0 && keccak256(bytes(data.tag)) != keccak256(bytes(tag))) continue;

                total += data.response;
                validCount++;
            }
        }

        if (validCount > 0) {
            averageResponse = uint8(total / validCount);
        } else {
            averageResponse = 0;
        }

        return (validCount, averageResponse);
    }

    /// @notice Get all validation request hashes for an agent
    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory) {
        return _agentValidations[agentId];
    }

    /// @notice Get all validation request hashes assigned to a validator
    function getValidatorRequests(address validatorAddress) external view returns (bytes32[] memory) {
        return _validatorRequests[validatorAddress];
    }
}
