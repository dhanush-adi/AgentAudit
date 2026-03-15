// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IAgentRegistry {
    function ownerOf(uint256 agentId) external view returns (address);
    function getApproved(uint256 agentId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

contract ValidationRegistry {
    address private immutable _identityRegistry;

    struct ValidationData {
        address validatorAddress;
        uint256 agentId;
        uint8 response; // 0-100
        bytes32 responseHash;
        string tag;
        uint256 lastUpdate;
        bool exists;
        bool hasResponded;
    }

    mapping(bytes32 => ValidationData) private _validations;
    mapping(uint256 => bytes32[]) private _agentValidations;
    mapping(address => bytes32[]) private _validatorRequests;

    event ValidationRequest(
        address indexed validatorAddress,
        uint256 indexed agentId,
        string requestURI,
        bytes32 requestHash
    );

    event ValidationResponse(
        bytes32 indexed requestHash,
        uint8 response,
        string responseURI,
        bytes32 responseHash,
        string tag
    );

    constructor(address identityRegistry_) {
        _identityRegistry = identityRegistry_;
    }

    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external {
        IAgentRegistry registry = IAgentRegistry(_identityRegistry);
        address owner = registry.ownerOf(agentId); // Reverts if not minted
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
            exists: true,
            hasResponded: false
        });

        _agentValidations[agentId].push(requestHash);
        _validatorRequests[validatorAddress].push(requestHash);

        emit ValidationRequest(validatorAddress, agentId, requestURI, requestHash);
    }

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
        require(data.validatorAddress == msg.sender, "Not authorized validator");

        data.response = response;
        data.responseHash = responseHash;
        data.tag = tag;
        data.lastUpdate = block.timestamp;
        data.hasResponded = true;

        emit ValidationResponse(requestHash, response, responseURI, responseHash, tag);
    }

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

    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory) {
        return _agentValidations[agentId];
    }

    function getValidatorRequests(address validatorAddress) external view returns (bytes32[] memory) {
        return _validatorRequests[validatorAddress];
    }
}
