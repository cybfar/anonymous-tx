// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MerkleTreeWithHistory.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) external view returns (bool);
}

contract Mixer is MerkleTreeWithHistory, ReentrancyGuard {
    // Montant fixe que chaque utilisateur doit déposer
    uint256 public immutable denomination;

    // Verifier pour les preuves zk-SNARK
    IVerifier public immutable verifier;

    // Pour empêcher les doubles dépenses
    mapping(uint256 => bool) public nullifierHashes;

    // Events
    event Deposit(
        uint256 indexed commitment,
        uint32 leafIndex,
        uint256 timestamp
    );
    event Withdrawal(address to, uint256 nullifierHash);
    event DebugDeposit(uint256 sentValue, uint256 requiredValue);
    /**
     * @param _verifier Adresse du contrat vérificateur
     * @param _denomination Montant fixe pour chaque dépôt
     */
    constructor(address _verifier, uint256 _denomination) {
        require(_denomination > 0, "denomination should be greater than 0");
        require(_verifier != address(0), "verifier address cannot be 0");

        denomination = _denomination;
        verifier = IVerifier(_verifier);
    }

    function deposit(uint256 _commitment) external payable nonReentrant {
        emit DebugDeposit(msg.value, denomination);
        require(msg.value == denomination, "Wrong amount");
        require(_commitment != 0, "Commitment cannot be 0");
        uint32 insertedIndex = insert(_commitment);
        emit Deposit(_commitment, insertedIndex, block.timestamp);
    }

    function isSpent(uint256 _nullifierHash) public view returns (bool) {
        return nullifierHashes[_nullifierHash];
    }

    // Les fonctions à implémenter:
    // - withdraw
}
