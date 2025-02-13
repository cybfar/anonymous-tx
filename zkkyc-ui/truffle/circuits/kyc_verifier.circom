pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template KYCVerifier() {
    signal input name;           
    signal input dateOfBirth;     
    signal input country;         
    signal input idNumber;       

    signal input expectedHash;

    signal output isValid;

    component nameHasher = Poseidon(1);
    component dateHasher = Poseidon(1);
    component countryHasher = Poseidon(1);
    component idHasher = Poseidon(1);

    nameHasher.inputs[0] <== name;
    dateHasher.inputs[0] <== dateOfBirth;
    countryHasher.inputs[0] <== country;
    idHasher.inputs[0] <== idNumber;

    component finalHasher = Poseidon(4);
    finalHasher.inputs[0] <== nameHasher.out;
    finalHasher.inputs[1] <== dateHasher.out;
    finalHasher.inputs[2] <== countryHasher.out;
    finalHasher.inputs[3] <== idHasher.out;

    component areEqual = IsEqual();
    areEqual.in[0] <== finalHasher.out;
    areEqual.in[1] <== expectedHash;
    isValid <== areEqual.out;
}

component main = KYCVerifier();