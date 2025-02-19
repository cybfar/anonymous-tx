// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MerkleTreeWithHistory.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVerifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals
    ) external view returns (bool);
}

interface IKYCRegistry {
    function isWhitelisted(address _address) external view returns (bool);
}

contract Mixer is MerkleTreeWithHistory, ReentrancyGuard {
    // Montant fixe que chaque utilisateur doit déposer
    uint256 public immutable denomination;

    // Verifier pour les preuves zk-SNARK
    IVerifier public immutable verifier;
    // Verifier les withlisted address
    IKYCRegistry public immutable kycRegistry;

    // Pour empêcher les doubles dépenses
    mapping(uint256 => bool) public nullifierHashes;

    mapping(uint256 => uint256) public denominationAnonymitySet;

    // Events
    event Deposit(
        uint256 indexed commitment,
        uint32 leafIndex,
        uint256 timestamp
    );
    event Withdrawal(address to,address from, uint256 fee);
    event DebugDeposit(uint256 sentValue, uint256 requiredValue);
    event AnonymitySetChanged(uint256 denomination, uint256 newSize);

    /**
     * @param _verifier Adresse du contrat vérificateur
     * @param _kycRegistryAddress Adresse du contrat vérificateur des whitelists
     * @param _denomination Montant fixe pour chaque dépôt
     */
    constructor(address _verifier, address _kycRegistryAddress , uint256 _denomination) {
        require(_denomination > 0, "denomination should be greater than 0");
        require(_verifier != address(0), "verifier address cannot be 0");
        require(_kycRegistryAddress != address(0), "KYC Registry address cannot be 0");

        denomination = _denomination;
        verifier = IVerifier(_verifier);
        kycRegistry = IKYCRegistry(_kycRegistryAddress);
    }

    function deposit(uint256 _commitment) external payable nonReentrant {
        emit DebugDeposit(msg.value, denomination);
        require(kycRegistry.isWhitelisted(msg.sender), "Your address is not whitelisted. Please complete KYC first.");
        require(msg.value == denomination, "Wrong amount");
        require(_commitment != 0, "Commitment cannot be 0");
        uint32 insertedIndex = insert(_commitment);

        emit Deposit(_commitment, insertedIndex, block.timestamp);
        
        denominationAnonymitySet[denomination]++;
        emit AnonymitySetChanged(denomination, denominationAnonymitySet[denomination]);
    }

    function withdraw(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals,
        uint256 root,
        uint256 nullifierHash,
        address payable recipient,
        address payable relayer,
        uint256 fee
    ) external nonReentrant {
        require(kycRegistry.isWhitelisted(recipient), "The withdrawal address is not whitelisted. Please complete KYC to withelist this address.");
        require(fee <= denomination, "Fee exceeds transfer value");
        require(!nullifierHashes[nullifierHash], "The note has been already spent");
        require(isKnownRoot(root), "Cannot find your merkle root");
        require(recipient != address(0), "Invalid withdraw address");
    
        require(
            verifier.verifyProof(_pA, _pB, _pC, _pubSignals),
            "Invalid withdraw proof !"
        );

        nullifierHashes[nullifierHash] = true;

        uint256 amount = denomination - fee;

         // Envoyer les fonds au destinataire
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer to recipient failed");

        if (fee > 0) {
            require(
                recipient != relayer,
                "Recipient and relayer cannot be the same"
            );

            (bool relayerSuccess, ) = relayer.call{value: fee}("");
            require(relayerSuccess, "Fee transfer failed");
        }

        emit Withdrawal(recipient, relayer, fee);

        denominationAnonymitySet[denomination]--;
        emit AnonymitySetChanged(denomination, denominationAnonymitySet[denomination]);
    }

    function isSpent(uint256 _nullifierHash) public view returns (bool) {
        return nullifierHashes[_nullifierHash];
    }

    function getAnonymitySetSize(uint256 _denomination) public view returns (uint256) {
        return denominationAnonymitySet[_denomination];
    }

    // Les fonctions à implémenter:
    // - withdraw
}
