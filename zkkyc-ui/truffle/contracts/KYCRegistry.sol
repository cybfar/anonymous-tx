// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// Définition de l'interface pour notre vérificateur de preuves
interface IKYCVerifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals
    ) external view returns (bool);
}

contract KYCRegistry is Ownable {
    // Le vérificateur de preuves ZK
    IKYCVerifier public verifier;

    // Mapping pour les adresses whitelistées
    mapping(address => bool) public whitelistedAddresses;

    mapping(uint256 => mapping(address => bool)) public isAuthorizedForKYC;

    // Mapping pour suivre quels hash KYC ont été vérifiés
    mapping(uint256 => bool) public kycVerified;

    // Mapping pour stocker les adresses associées à un hash KYC
    mapping(uint256 => address[]) public kycAddresses;

    // Événements pour tracer les actions importantes
    event KYCVerified(
        uint256 indexed expectedHash,
        address indexed firstAddress
    );
    event AddressWhitelisted(
        address indexed userAddress,
        uint256 indexed expectedHash
    );

    // Le constructeur doit appeler le constructeur de Ownable avec super()
    constructor(address _verifierAddress) Ownable(msg.sender) {
        require(_verifierAddress != address(0), "Invalid verifier address");
        verifier = IKYCVerifier(_verifierAddress);
    }

    function verifyKYC(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals,
        uint256 expectedHash,
        address userAddress
    ) external {
        require(!kycVerified[expectedHash], "KYC already verified");
        require(userAddress != address(0), "Invalid address");
        require(
            !whitelistedAddresses[userAddress],
            "Address already whitelisted"
        );

        require(
            verifier.verifyProof(_pA, _pB, _pC, _pubSignals),
            "Invalid KYC proof"
        );
        require(_pubSignals[0] == 1, "Invalid proof result");

        kycVerified[expectedHash] = true;
        whitelistedAddresses[userAddress] = true;
        kycAddresses[expectedHash].push(userAddress);

        // Émettre les événements
        emit KYCVerified(expectedHash, userAddress);
        emit AddressWhitelisted(userAddress, expectedHash);
    }

    // Ajouter une nouvelle adresse pour un KYC déjà vérifié
    function addWhitelistedAddress(
        uint256 expectedHash,
        address newAddress
    ) external {
        // Vérifications
        require(kycVerified[expectedHash], "KYC not verified");
        require(newAddress != address(0), "Invalid address");
        require(
            !whitelistedAddresses[newAddress],
            "Address already whitelisted"
        );

        // Vérifier que l'appelant a une adresse associée à ce KYC
        bool isAuthorized = false;
        address[] memory addresses = kycAddresses[expectedHash];
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == msg.sender) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized, "Not authorized to add addresses for this KYC");

        // Whitelister la nouvelle adresse
        whitelistedAddresses[newAddress] = true;
        kycAddresses[expectedHash].push(newAddress);

        emit AddressWhitelisted(newAddress, expectedHash);
    }

    // Vérifier si une adresse est whitelistée
    function isWhitelisted(address _address) external view returns (bool) {
        return whitelistedAddresses[_address];
    }

    // Obtenir toutes les adresses associées à un KYC
    function getKYCAddresses(
        uint256 expectedHash
    ) external view returns (address[] memory) {
        return kycAddresses[expectedHash];
    }

    // Fonction pour mettre à jour l'adresse du vérificateur (seulement par le owner)
    function updateVerifier(address newVerifier) external onlyOwner {
        require(newVerifier != address(0), "Invalid verifier address");
        verifier = IKYCVerifier(newVerifier);
    }
}
