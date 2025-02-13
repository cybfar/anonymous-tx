const { MerkleTree, ProofPath } = require("fixed-merkle-tree");
const { buildPoseidon } = require("circomlibjs");
const createKeccakHash = require("keccak");
const { ethers } = require("ethers");

async function testMerkleTree() {
  try {
    const poseidon = await buildPoseidon();
    const HEIGHT = 3;
    const ZERO_VALUE = "0";

    const values = ["5", "10", "15", "20", "25", "30"];

    const tree = new MerkleTree(20, leaves, {
      hashFunction: (left, right) => {
        if (BigInt(left) > BigInt(right)) {
          [left, right] = [right, left];
        }

        const input = Buffer.concat([
          Buffer.from(BigInt(left).toString(16).padStart(64, "0"), "hex"),
          Buffer.from(BigInt(right).toString(16).padStart(64, "0"), "hex"),
        ]);

        const hash = createKeccakHash("keccak256").update(input).digest("hex");

        return BigInt("0x" + hash).toString();
      },
      zeroElement: 0,
    });

    const path = tree.proof("5");

    const proof = tree.serialize(path);

    console.log(proof);

    // // Vérifier la preuve
    // const isValid = tree.verifyProof(path.pathElements, 3, 42, tree.root);
    console.log("\nVérification de la preuve:", tree.root);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

testMerkleTree().catch(console.error);
