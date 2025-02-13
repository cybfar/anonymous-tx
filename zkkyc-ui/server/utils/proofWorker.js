// server/workers/proofWorker.js
import { Worker, parentPort } from "worker_threads";
import { buildPoseidon } from "circomlibjs";
import * as snarkjs from "snarkjs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateProof(formData) {
  try {
    const { fullName, dateOfBirth, country, idNumber } = formData;

    // Initialiser Poseidon
    const poseidon = await buildPoseidon();

    // Préparation des données
    const nameArray1 = Array(16)
      .fill(0)
      .map((_, i) => fullName.charCodeAt(i) || 0);
    const nameArray2 = Array(16)
      .fill(0)
      .map((_, i) => fullName.charCodeAt(i + 16) || 0);
    const dateArray = dateOfBirth.split("").map(Number);
    const countryArray = [country.charCodeAt(0), country.charCodeAt(1)];
    const idArray1 = Array(8)
      .fill(0)
      .map((_, i) => idNumber.charCodeAt(i) || 0);
    const idArray2 = Array(8)
      .fill(0)
      .map((_, i) => idNumber.charCodeAt(i + 8) || 0);

    // Calcul des hashes
    const nameHash1 = poseidon.F.toString(poseidon(nameArray1));
    const nameHash2 = poseidon.F.toString(poseidon(nameArray2));
    const nameFinalHash = poseidon.F.toString(poseidon([nameHash1, nameHash2]));
    const dateHash = poseidon.F.toString(poseidon(dateArray));
    const countryHash = poseidon.F.toString(poseidon(countryArray));
    const idHash1 = poseidon.F.toString(poseidon(idArray1));
    const idHash2 = poseidon.F.toString(poseidon(idArray2));
    const idFinalHash = poseidon.F.toString(poseidon([idHash1, idHash2]));

    const expectedHash = poseidon.F.toString(
      poseidon([nameFinalHash, dateHash, countryHash, idFinalHash])
    );

    // Préparation des inputs pour le circuit
    const input = {
      name: [...nameArray1, ...nameArray2],
      dateOfBirth: dateArray,
      country: countryArray,
      idNumber: [...idArray1, ...idArray2],
      expectedHash: expectedHash,
    };

    // Chemins des fichiers
    const wasmPath = join(
      process.cwd(),
      "truffle/build/circuits/kyc_verifier_js/kyc_verifier.wasm"
    );
    const zkeyPath = join(
      process.cwd(),
      "truffle/build/circuits/kyc_verifier_final.zkey"
    );

    // Génération de la preuve
    const { proof, publicSignals } = await groth16.fullProve(
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

    parentPort.postMessage({
      success: true,
      proof: proofForContract,
      publicSignals,
      expectedHash,
    });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message,
    });
  }
}

parentPort.on("message", generateProof);
