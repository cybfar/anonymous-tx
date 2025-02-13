// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MerkleTreeWithHistory {
    uint256 public constant TREE_HEIGHT = 20;
    uint256 public constant ZERO_VALUE = 0;

    uint256[] public filledSubtrees;
    uint256[] public zeros;
    uint32 public currentRootIndex;
    uint32 public nextIndex;
    mapping(uint32 => uint256) public roots;

    // Events pour suivre les insertions
    event LeafInsertion(uint256 indexed leaf, uint32 indexed index);

    constructor() {
        zeros = new uint256[](TREE_HEIGHT);
        filledSubtrees = new uint256[](TREE_HEIGHT);

        zeros[0] = ZERO_VALUE;

        for (uint32 i = 1; i < TREE_HEIGHT; i++) {
            zeros[i] = hashPair(zeros[i - 1], zeros[i - 1]);
            filledSubtrees[i] = zeros[i];
        }
        roots[0] = hashPair(zeros[TREE_HEIGHT - 1], zeros[TREE_HEIGHT - 1]);
    }

    function hashPair(
        uint256 left,
        uint256 right
    ) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(left, right)));
    }

    // Insère une nouvelle feuille dans l'arbre
    function insert(uint256 _leaf) public returns (uint32) {
        require(nextIndex < 2 ** TREE_HEIGHT, "Tree is full");

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
