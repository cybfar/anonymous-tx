// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MerkleTreeWithHistory is ReentrancyGuard {
    // constant : valeur immuable, économise du gas
    uint256 public constant TREE_HEIGHT = 20;  
    uint256 public constant ZERO_VALUE = 0;

    // Variables d'état : stockées de façon permanente dans la blockchain
    uint256[] public filledSubtrees;  // tableau dynamique public 
    uint256[] public zeros;
    uint32 public currentRootIndex;    // uint32 plus économique que uint256
    uint32 public nextIndex;
    // mapping : structure de type clé-valeur
    mapping(uint32 => uint256) public roots;  

    // Events pour suivre les insertions
    event LeafInsertion(uint256 indexed leaf, uint32 indexed index);

    // constructor : exécuté une seule fois à la création du contrat
    constructor() {
        // new : allocation dynamique de mémoire
        zeros = new uint256[](TREE_HEIGHT);
        filledSubtrees = new uint256[](TREE_HEIGHT);
        
        // Initialisation de l'arbre
        zeros[0] = ZERO_VALUE;
        // uint32 i : plus économique que uint256 pour les boucles
        for(uint32 i = 1; i < TREE_HEIGHT; i++) {
            zeros[i] = hashPair(zeros[i-1], zeros[i-1]);
            filledSubtrees[i] = zeros[i];
        }
        roots[0] = hashPair(zeros[TREE_HEIGHT-1], zeros[TREE_HEIGHT-1]);
    }

    function hashPair(uint256 left, uint256 right) public pure returns (uint256) {
    if (left > right) {
        (left, right) = (right, left);
    }
    return uint256(keccak256(abi.encodePacked(left, right)));
}
    
    // Insère une nouvelle feuille dans l'arbre
    function insert(uint256 _leaf) public nonReentrant returns (uint32) {
        require(nextIndex < 2**TREE_HEIGHT, "Tree is full");
        
        uint32 currentIndex = nextIndex;
        uint32 currentLevelHash = currentIndex;
        uint256 currentLevelValue = _leaf;
        uint256 left;
        uint256 right;

        // On remonte l'arbre en calculant les hashes
        for (uint32 i = 0; i < TREE_HEIGHT; i++) {
            if (currentLevelHash % 2 == 0) {
                left = currentLevelValue;
                right = zeros[i];
                filledSubtrees[i] = currentLevelValue;
            } else {
                left = filledSubtrees[i];
                right = currentLevelValue;
            }
            currentLevelValue = hashPair(left, right);
            currentLevelHash = currentLevelHash / 2;
        }

        currentRootIndex = (currentRootIndex + 1) % 100;
        roots[currentRootIndex] = currentLevelValue;
        nextIndex++;

        emit LeafInsertion(_leaf, currentIndex);
        return currentIndex;
    }

    // Vérifie si une racine existe
    function isKnownRoot(uint256 _root) public view returns (bool) {
        if (_root == 0) return false;
        uint32 i = currentRootIndex;
        do {
            if (_root == roots[i]) return true;
            if (i == 0) i = 100;
            i--;
        } while (i != currentRootIndex);
        return false;
    }

}