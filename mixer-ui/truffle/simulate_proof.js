const snarkjs = require("snarkjs");
const circomlibjs = require("circomlibjs");
const merkleTree = require("fixed-merkle-tree");

async function generateProof() {
  const poseidon = await circomlibjs.buildPoseidon();

  const userData = {
    name: "John Doe",
    dateOfBirth: "19900101",
    country: "FR",
    idNumber: "123456789",
  };

  const nameArray = stringToArray(userData.name, 16);
  const dateArray = stringToArray(userData.dateOfBirth, 8);
  const countryArray = stringToArray(userData.country, 2);
  const idArray = stringToArray(userData.idNumber, 16);

  // Hachage hiérarchique
  // const nameHash = poseidon.F.toString(poseidon(nameArray));
  // const dateHash = poseidon.F.toString(poseidon(dateArray));
  // const countryHash = poseidon.F.toString(poseidon(countryArray));
  // const idHash = poseidon.F.toString(poseidon(idArray));

  // const expectedHash = poseidon.F.toString(poseidon([nameHash, dateHash, countryHash, idHash]));

  const input = {
    name: [...nameArray, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    dateOfBirth: dateArray,
    country: countryArray,
    idNumber: idArray,
    expectedHash: 0,
  };

  return await snarkjs.groth16.fullProve(
    input,
    "build/circuits/withdraw_js/withdraw.wasm",
    "build/circuits/withdraw_final.zkey"
  );
}

function stringToArray(str, length) {
  const array = [];
  for (let i = 0; i < length; i++) {
    array.push(i < str.length ? str.charCodeAt(i) : 0); // Remplir avec des zéros si nécessaire
  }
  return array;
}

generateProof()
  .then(({ proof, publicSignals }) => {
    console.log("Proof:", proof);
    console.log("Public Signals:", publicSignals);
  })
  .catch(console.error);
