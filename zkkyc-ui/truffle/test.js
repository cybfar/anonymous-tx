function stringToBigInt(str) {
  return BigInt(
    "0x" +
      str
        .replace(/\s+/g, "") // Enlève les espaces
        .split("") // Divise en caractères
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0")) // Convertit en hex
        .join("") // Concatène
  ).toString();
}

// Test
const test = stringToBigInt("Hello World!");
console.log(test);

// 48656c6c6f576f726c64 en hex
// 87521618088882533492324 en décimal

// const circomlibjs = require("circomlibjs");

// class KYCDataConverter {
//   // Convertit une chaîne en tableau d'entiers de taille fixe
//   static stringToIntArray(str, length) {
//     return Array(length)
//       .fill(0)
//       .map((_, i) => str.charCodeAt(i) || 0);
//   }

//   // Convertit une date en tableau d'entiers
//   static dateToIntArray(dateStr) {
//     return dateStr.replace(/-/g, "").split("").map(Number);
//   }

//   // Convertit un code pays en tableau d'entiers
//   static countryToIntArray(countryCode) {
//     return [countryCode.charCodeAt(0), countryCode.charCodeAt(1)];
//   }
// }

// class KYCHasher {
//   constructor(poseidon) {
//     this.poseidon = poseidon;
//   }

//   // Hash un tableau d'entiers
//   hashIntArray(array) {
//     const hash = this.poseidon(array);
//     return this.poseidon.F.toString(hash);
//   }

//   // Hash deux valeurs ensemble
//   hashPair(a, b) {
//     const hash = this.poseidon([a, b]);
//     return this.poseidon.F.toString(hash);
//   }

//   // Hash les données complètes
//   generateHash(data) {
//     // Hash du nom (en deux parties)
//     const nameHash1 = this.hashIntArray(data.nameArray1);
//     const nameHash2 = this.hashIntArray(data.nameArray2);
//     const nameFinalHash = this.hashPair(nameHash1, nameHash2);

//     // Hash des autres champs
//     const dateHash = this.hashIntArray(data.dateArray);
//     const countryHash = this.hashIntArray(data.countryArray);

//     // Hash de l'ID (en deux parties)
//     const idHash1 = this.hashIntArray(data.idArray1);
//     const idHash2 = this.hashIntArray(data.idArray2);
//     const idFinalHash = this.hashPair(idHash1, idHash2);

//     // Hash final
//     return this.hashIntArray([
//       nameFinalHash,
//       dateHash,
//       countryHash,
//       idFinalHash,
//     ]);
//   }
// }

// // Fonction principale de traitement
// async function processKYCData(fullName, dateOfBirth, country, idNumber) {
//   const poseidon = await circomlibjs.buildPoseidon();
//   const converter = KYCDataConverter;
//   const hasher = new KYCHasher(poseidon);

//   // Conversion des données
//   const data = {
//     nameArray1: converter.stringToIntArray(fullName, 16),
//     nameArray2: converter.stringToIntArray(fullName.slice(16), 16),
//     dateArray: converter.dateToIntArray(dateOfBirth),
//     countryArray: converter.countryToIntArray(country),
//     idArray1: converter.stringToIntArray(idNumber, 8),
//     idArray2: converter.stringToIntArray(idNumber.slice(8), 8),
//   };

//   // Génération du hash
//   const finalHash = hasher.generateHash(data);

//   // Préparation des inputs pour le circuit
//   return {
//     input: {
//       name: [...data.nameArray1, ...data.nameArray2],
//       dateOfBirth: data.dateArray,
//       country: data.countryArray,
//       idNumber: [...data.idArray1, ...data.idArray2],
//       expectedHash: finalHash,
//     },
//     hash: finalHash,
//   };
// }

// // Exemple d'utilisation
// async function test() {
//   const result = await processKYCData(
//     "John Doe",
//     "1990-01-01",
//     "US",
//     "AB123456789"
//   );
//   console.log("Circuit Input:", result.input);
//   console.log("Final Hash:", result.hash);
// }

// test();

// import { buildPoseidon } from "circomlibjs";

// import * as snarkjs from "snarkjs";

// async function generateProof() {
//   const poseidon = await buildPoseidon();

//   const userData = {
//     name: "John Doe",
//     dateOfBirth: "19900101",
//     country: "FR",
//     idNumber: "123456789",
//   };

//   const nameArray1 = Array(16)
//     .fill(0)
//     .map((_, i) => userData.name.charCodeAt(i) || 0);
//   const nameArray2 = Array(16)
//     .fill(0)
//     .map((_, i) => userData.name.charCodeAt(i + 16) || 0);
//   const dateArray = userData.dateOfBirth.split("").map(Number);
//   const countryArray = [
//     userData.country.charCodeAt(0),
//     userData.country.charCodeAt(1),
//   ];
//   const idArray1 = Array(8)
//     .fill(0)
//     .map((_, i) => userData.idNumber.charCodeAt(i) || 0);
//   const idArray2 = Array(8)
//     .fill(0)
//     .map((_, i) => userData.idNumber.charCodeAt(i + 8) || 0);

//   const nameHash1 = poseidon.F.toString(poseidon(nameArray1));
//   const nameHash2 = poseidon.F.toString(poseidon(nameArray2));
//   const nameFinalHash = poseidon.F.toString(poseidon([nameHash1, nameHash2]));
//   const dateHash = poseidon.F.toString(poseidon(dateArray));
//   const countryHash = poseidon.F.toString(poseidon(countryArray));
//   const idHash1 = poseidon.F.toString(poseidon(idArray1));
//   const idHash2 = poseidon.F.toString(poseidon(idArray2));
//   const idFinalHash = poseidon.F.toString(poseidon([idHash1, idHash2]));

//   const expectedHash = poseidon.F.toString(
//     poseidon([nameFinalHash, dateHash, countryHash, idFinalHash])
//   );

//   // Préparation des inputs pour le circuit
//   const input = {
//     name: [...nameArray1, ...nameArray2],
//     dateOfBirth: dateArray,
//     country: countryArray,
//     idNumber: [...idArray1, ...idArray2],
//     expectedHash: expectedHash,
//   };

//   // Génération de la preuve
//   const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//     input,
//     "./truffle/build/circuits/kyc_verifier_js/kyc_verifier.wasm",
//     "./truffle/build/circuits/kyc_verifier_final.zkey"
//   );

//   // Formatage pour le contrat
//   const proofForContract = [
//     [proof.pi_a[0], proof.pi_a[1]],
//     [
//       [proof.pi_b[0][1], proof.pi_b[0][0]],
//       [proof.pi_b[1][1], proof.pi_b[1][0]],
//     ],
//     [proof.pi_c[0], proof.pi_c[1]],
//   ];

//   console.log("Proof for contract:", proofForContract);
//   console.log("Public signals:", publicSignals);
//   console.log("Expected hash:", expectedHash);

//   return { proofForContract, publicSignals, expectedHash };
// }

// generateProof().catch(console.error);
