const express = require("express");
const cors = require("cors");
const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");
const path = require("path");
const crypto = require("crypto");
const { MerkleTree } = require("fixed-merkle-tree");
const createKeccakHash = require("keccak");
const { validator, isAddress } = require("web3-validator");

const initWeb3 = require("./config/web3.js");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-proof", async (req, res) => {
  try {
    const { fullName, dateOfBirth, country, idNumber } = req.body;

    const poseidon = await circomlibjs.buildPoseidon();

    const name = stringToBigInt(fullName);
    const nameHash = poseidon.F.toString(poseidon([name]));

    const date = stringToBigInt(removeDashes(dateOfBirth));
    const dateHash = poseidon.F.toString(poseidon([date]));

    const _country = stringToBigInt(country);
    const countryHash = poseidon.F.toString(poseidon([_country]));

    const id = stringToBigInt(idNumber);
    const idHash = poseidon.F.toString(poseidon([id]));

    const expectedHash = poseidon.F.toString(
      poseidon([nameHash, dateHash, countryHash, idHash])
    );

    const input = {
      name: name,
      dateOfBirth: date,
      country: _country,
      idNumber: id,
      expectedHash: expectedHash,
    };

    console.log(input);

    // Chemins des fichiers
    const wasmPath = path.join(
      process.cwd(),
      "../zkkyc-ui/truffle/build/circuits/kyc_verifier_js/kyc_verifier.wasm"
    );
    const zkeyPath = path.join(
      process.cwd(),
      "../zkkyc-ui/truffle/build/circuits/kyc_verifier_final.zkey"
    );

    // Génération de la preuve
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    // Format pour le contrat
    const proofForContract = [
      [proof.pi_a[0], proof.pi_a[1]],
      [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      [proof.pi_c[0], proof.pi_c[1]],
    ];

    res.json({
      success: true,
      proof: proofForContract,
      publicSignals,
      expectedHash,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/create-deposit", async (req, res) => {
  try {
    const { poolAmount, selectedPool } = req.body;

    console.log("Pool amount :" + poolAmount);

    const _nullifier = "0x" + crypto.randomBytes(31).toString("hex");
    const _secret = "0x" + crypto.randomBytes(31).toString("hex");

    const { commitmentHash } = await build(_nullifier, _secret, poolAmount);

    console.log({
      nullifier: _nullifier,
      secret: _secret,
      commitmentHash: commitmentHash,
      amount: poolAmount,
    });

    const response = bigIntToString({
      success: true,
      nullifier: _nullifier,
      secret: _secret,
      commitmentHash,
      amount: poolAmount,
      selectedPool,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/create-withdrawal", async (req, res) => {
  try {
    const mimcsponge = await circomlibjs.buildMimcSponge();

    const { note, withdrawalAddress, poolAmount, networkId } = req.body;
    const { web3, mixer } = initWeb3(networkId);

    if (!isAddress(withdrawalAddress)) {
      throw new Error("Invalid withdrawal address");
    }

    const { amount, nullifier, secret } = parseNote(note);
    const { commitmentHash } = await build(nullifier, secret, amount);

    const _nullifierHash = mimcsponge.multiHash([nullifier], 0);
    const nullifierHash = mimcsponge.F.toString(_nullifierHash);

    // Get pasts events from contract

    const pastEvents = await mixer.getPastEvents("Deposit", {
      fromBlock: 0,
      toBlock: "latest",
    });

    const leaves = pastEvents
      .sort((a, b) =>
        String(a.returnValues.leafIndex).localeCompare(
          String(b.returnValues.leafIndex)
        )
      )
      .map((e) => e.returnValues.commitment.toString());

    console.log(leaves);

    const tree = new MerkleTree(20, leaves, {
      hashFunction: (left, right) => {
        const input = Buffer.concat([
          Buffer.from(BigInt(left).toString(16).padStart(64, "0"), "hex"),
          Buffer.from(BigInt(right).toString(16).padStart(64, "0"), "hex"),
        ]);

        const hash = createKeccakHash("keccak256").update(input).digest("hex");

        return BigInt("0x" + hash).toString();
      },
      zeroElement: 0,
    });

    const currentDepositEvent = pastEvents.find(
      (e) => e.returnValues.commitment === BigInt(commitmentHash)
    );

    if (!currentDepositEvent) {
      throw new Error("Deposit not found for this note");
    }

    const depositIndex = currentDepositEvent.returnValues.leafIndex;
    const root = tree.root;

    const isValidRoot = await mixer.methods.isKnownRoot(root).call();
    const isSpent = await mixer.methods.isSpent(nullifierHash).call();

    if (!isValidRoot) {
      throw new Error("Deposit not found for this note !");
    }

    // Re build the tree with mimcsponge to send inputs to the circuit

    const mimcsTree = new MerkleTree(20, leaves, {
      hashFunction: (left, right) => {
        let leftBigInt = BigInt(left);
        let rightBigInt = BigInt(right);

        const hash = mimcsponge.multiHash([leftBigInt, rightBigInt], 0);
        return mimcsponge.F.toString(hash);
      },
      zeroElement: 0,
    });

    if (isSpent) {
      throw new Error("Note has already been spent");
    }

    const { pathElements, pathIndices } = mimcsTree.path(Number(depositIndex));

    // Prepare circuit for circom to generate zk proof

    // Proofs paths
    const wasmPath = path.join(
      process.cwd(),
      "../mixer-ui/truffle/build/circuits/withdraw_js/withdraw.wasm"
    );
    const zkeyPath = path.join(
      process.cwd(),
      "../mixer-ui/truffle/build/circuits/withdraw_final.zkey"
    );

    const input = {
      root: mimcsTree.root,
      amount: BigInt(amount).toString(),
      nullifier: BigInt(nullifier).toString(),
      nullifierHash: BigInt(nullifierHash).toString(),
      secret: BigInt(secret).toString(),
      pathElements: pathElements,
      pathIndices: pathIndices,
    };

    console.log(
      "############################################ INPUT FOR THE CIRCUIT\n"
    );

    console.log("Root Keccak : " + root);
    console.log("Root Mimcs : " + mimcsTree.root);

    console.log(
      "############################################ INPUT FOR THE CIRCUIT\n"
    );

    console.log(input);

    // Génération de la preuve
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    const proofForContract = [
      [proof.pi_a[0], proof.pi_a[1]],
      [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      [proof.pi_c[0], proof.pi_c[1]],
    ];

    const response = {
      success: true,
      proof: proofForContract,
      publicSignals: publicSignals,
      root: root,
      nullifierHash: nullifierHash,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

function removeDashes(dateString) {
  return dateString.replace(/-/g, "");
}

const bigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

async function build(_nullifier, _secret, _amount) {
  try {
    const n = BigInt(_nullifier);
    const s = BigInt(_secret);
    const a = BigInt(_amount);

    if (_nullifier <= 0n || _secret <= 0n || _amount <= 0n) {
      throw new Error("Invalid input values: must be positive");
    }

    const mimcsponge = await circomlibjs.buildMimcSponge();
    const commitment = mimcsponge.multiHash([n, s, a], 0);
    const commitmentHash = mimcsponge.F.toString(commitment);

    return {
      nullifier: n.toString(),
      secret: s.toString(),
      commitmentHash: commitmentHash,
    };
  } catch (error) {
    console.error("Error building commitment:", error);
    throw error;
  }
}

function parseNote(note) {
  const [prefix, amount, nullifier, secret] = note.split(".");

  if (prefix !== "phantom-eth" || !amount || !nullifier || !secret) {
    throw new Error("Invalid note format");
  }

  return {
    amount: parseFloat(amount),
    nullifier: nullifier,
    secret: secret,
  };
}

function stringToBigInt(str) {
  return BigInt(
    "0x" +
      str
        .replace(/\s+/g, "")
        .split("")
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
  ).toString();
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proof server running on port ${PORT}`);
});
