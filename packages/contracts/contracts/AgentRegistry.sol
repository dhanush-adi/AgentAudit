// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract AgentRegistry is ERC721URIStorage, EIP712 {
    uint256 private _nextTokenId;

    struct MetadataEntry {
        string key;
        bytes value;
    }

    mapping(uint256 => mapping(string => bytes)) private _metadata;

    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);
    event MetadataSet(uint256 indexed agentId, string indexed indexedMetadataKey, string metadataKey, bytes metadataValue);

    bytes32 private constant SET_AGENT_WALLET_TYPEHASH = keccak256("SetAgentWallet(uint256 agentId,address newWallet,uint256 deadline)");

    constructor() ERC721("AgentRegistry", "AGENT") EIP712("AgentRegistry", "1") {}

    function register(string memory agentURI, MetadataEntry[] memory metadata) public returns (uint256 agentId) {
        agentId = _nextTokenId++;
        _mint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);
        
        _setMetadata(agentId, "agentWallet", abi.encode(msg.sender));
        
        for (uint256 i = 0; i < metadata.length; i++) {
            require(keccak256(bytes(metadata[i].key)) != keccak256(bytes("agentWallet")), "Cannot set agentWallet via metadata");
            _setMetadata(agentId, metadata[i].key, metadata[i].value);
        }
        
        emit Registered(agentId, agentURI, msg.sender);
    }

    function register(string memory agentURI) public returns (uint256 agentId) {
        return register(agentURI, new MetadataEntry[](0));
    }

    function register() public returns (uint256 agentId) {
        return register("", new MetadataEntry[](0));
    }

    function setAgentURI(uint256 agentId, string memory newURI) public {
        address _owner = ownerOf(agentId);
        require(_owner == msg.sender || getApproved(agentId) == msg.sender || isApprovedForAll(_owner, msg.sender), "Not owner or operator");
        _setTokenURI(agentId, newURI);
        emit URIUpdated(agentId, newURI, msg.sender);
    }

    function setMetadata(uint256 agentId, string memory metadataKey, bytes memory metadataValue) public {
        require(ownerOf(agentId) == msg.sender, "Not owner");
        require(keccak256(bytes(metadataKey)) != keccak256(bytes("agentWallet")), "Reserved key");
        _setMetadata(agentId, metadataKey, metadataValue);
    }

    function getMetadata(uint256 agentId, string memory metadataKey) public view returns (bytes memory) {
        ownerOf(agentId); // Reverts if not minted
        return _metadata[agentId][metadataKey];
    }

    function _setMetadata(uint256 agentId, string memory metadataKey, bytes memory metadataValue) internal {
        _metadata[agentId][metadataKey] = metadataValue;
        emit MetadataSet(agentId, metadataKey, metadataKey, metadataValue);
    }

    function getAgentWallet(uint256 agentId) public view returns (address) {
        address _owner = ownerOf(agentId);
        bytes memory walletBytes = _metadata[agentId]["agentWallet"];
        if (walletBytes.length == 32) {
            return abi.decode(walletBytes, (address));
        }
        return _owner;
    }

    function unsetAgentWallet(uint256 agentId) public {
        require(ownerOf(agentId) == msg.sender, "Not owner");
        delete _metadata[agentId]["agentWallet"];
        emit MetadataSet(agentId, "agentWallet", "agentWallet", "");
    }

    function setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes memory signature) public {
        require(ownerOf(agentId) == msg.sender, "Not owner");
        require(block.timestamp <= deadline, "Signature expired");

        bytes32 structHash = keccak256(abi.encode(SET_AGENT_WALLET_TYPEHASH, agentId, newWallet, deadline));
        bytes32 hash = _hashTypedDataV4(structHash);
        
        address signer = ECDSA.recover(hash, signature);
        require(signer == newWallet, "Invalid signature");

        _setMetadata(agentId, "agentWallet", abi.encode(newWallet));
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            delete _metadata[tokenId]["agentWallet"];
            emit MetadataSet(tokenId, "agentWallet", "agentWallet", "");
        }
        return from;
    }
}
