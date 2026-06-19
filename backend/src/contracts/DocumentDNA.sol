// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DocumentDNA {
    struct Document {
        string hash;
        string cid;
        address owner;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Document) private documents;

    event DocumentRegistered(string indexed documentHash, string cid, address indexed owner, uint256 timestamp);
    event DocumentVerified(string indexed documentHash, bool exists, address indexed owner, uint256 timestamp);

    function registerDocument(
        string calldata documentHash,
        string calldata ipfsCID,
        address ownerWallet
    ) external returns (bool) {
        require(bytes(documentHash).length > 0, "hash required");
        require(bytes(ipfsCID).length > 0, "cid required");
        require(ownerWallet != address(0), "owner required");
        require(!documents[documentHash].exists, "document already exists");

        documents[documentHash] = Document({
            hash: documentHash,
            cid: ipfsCID,
            owner: ownerWallet,
            timestamp: block.timestamp,
            exists: true
        });

        emit DocumentRegistered(documentHash, ipfsCID, ownerWallet, block.timestamp);
        return true;
    }

    function verifyDocument(string calldata documentHash) external returns (bool) {
        Document memory document = documents[documentHash];
        emit DocumentVerified(documentHash, document.exists, document.owner, document.timestamp);
        return document.exists;
    }

    function getDocument(
        string calldata documentHash
    ) external view returns (string memory hash, string memory cid, address owner, uint256 timestamp, bool exists) {
        Document memory document = documents[documentHash];
        return (document.hash, document.cid, document.owner, document.timestamp, document.exists);
    }
}
