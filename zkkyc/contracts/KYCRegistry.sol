// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// Définition de l'interface pour notre vérificateur de preuves
interface IKYCVerifier {
    function verifyProof(bytes calldata proof, bytes32 kycDataHash) external view returns (bool);
}

contract KYCRegistry is Ownable {
    // Structure pour stocker les données KYC
    struct KYCInput {
        string name;
        uint256 dateOfBirth;
        string country;
        string idNumber;
    }

    // Le vérificateur de preuves ZK
    IKYCVerifier public verifier;
    
    // Mapping pour les adresses whitelistées
    mapping(address => bool) public whitelistedAddresses;
    
    // Mapping pour suivre quels hash KYC ont été vérifiés
    mapping(bytes32 => bool) public kycVerified;
    
    // Mapping pour stocker les adresses associées à un hash KYC
    mapping(bytes32 => address[]) public kycAddresses;
    
    // Événements pour tracer les actions importantes
    event KYCVerified(bytes32 indexed kycDataHash, address indexed firstAddress);
    event AddressWhitelisted(address indexed userAddress, bytes32 indexed kycDataHash);

    // Le constructeur doit appeler le constructeur de Ownable avec super()
    constructor(address _verifierAddress) Ownable(msg.sender) {
        require(_verifierAddress != address(0), "Invalid verifier address");
        verifier = IKYCVerifier(_verifierAddress);
    }

    // Fonction pour hasher les données KYC
    function hashKYCData(KYCInput memory input) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            input.name,
            input.dateOfBirth,
            input.country,
            input.idNumber
        ));
    }

    // Première vérification KYC avec une adresse initiale
    function verifyKYC(
        bytes calldata zkProof,      // Preuve générée par le circuit
        bytes32 kycDataHash,         // Hash des données KYC
        address userAddress          // Adresse à whitelister
    ) external {
        // Vérifications de base
        require(!kycVerified[kycDataHash], "KYC already verified");
        require(userAddress != address(0), "Invalid address");
        require(!whitelistedAddresses[userAddress], "Address already whitelisted");

        // Vérification de la preuve ZK
        require(verifier.verifyProof(zkProof, kycDataHash), "Invalid KYC proof");

        // Enregistrer le KYC comme vérifié
        kycVerified[kycDataHash] = true;
        
        // Whitelister l'adresse
        whitelistedAddresses[userAddress] = true;
        
        // Ajouter l'adresse à la liste des adresses pour ce KYC
        kycAddresses[kycDataHash].push(userAddress);

        // Émettre les événements
        emit KYCVerified(kycDataHash, userAddress);
        emit AddressWhitelisted(userAddress, kycDataHash);
    }

    // Ajouter une nouvelle adresse pour un KYC déjà vérifié
    function addWhitelistedAddress(bytes32 kycDataHash, address newAddress) external {
        // Vérifications
        require(kycVerified[kycDataHash], "KYC not verified");
        require(newAddress != address(0), "Invalid address");
        require(!whitelistedAddresses[newAddress], "Address already whitelisted");
        
        // Vérifier que l'appelant a une adresse associée à ce KYC
        bool isAuthorized = false;
        address[] memory addresses = kycAddresses[kycDataHash];
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == msg.sender) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized, "Not authorized to add addresses for this KYC");

        // Whitelister la nouvelle adresse
        whitelistedAddresses[newAddress] = true;
        kycAddresses[kycDataHash].push(newAddress);

        emit AddressWhitelisted(newAddress, kycDataHash);
    }

    // Vérifier si une adresse est whitelistée
    function isWhitelisted(address _address) external view returns (bool) {
        return whitelistedAddresses[_address];
    }

    // Obtenir toutes les adresses associées à un KYC
    function getKYCAddresses(bytes32 kycDataHash) external view returns (address[] memory) {
        return kycAddresses[kycDataHash];
    }

    // Fonction pour mettre à jour l'adresse du vérificateur (seulement par le owner)
    function updateVerifier(address newVerifier) external onlyOwner {
        require(newVerifier != address(0), "Invalid verifier address");
        verifier = IKYCVerifier(newVerifier);
    }
}