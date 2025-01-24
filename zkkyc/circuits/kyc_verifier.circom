pragma circom 2.0.0;

include "comparators.circom";
include "poseidon.circom";

template KYCVerifier() {
    // Entrées privées (les informations KYC réelles)
    signal input name[32];           // Nom en ascii, padding avec des zéros
    signal input dateOfBirth[8];     // Date au format YYYYMMDD
    signal input country[2];         // Code pays ISO
    signal input idNumber[16];       // Numéro d'identité padded

    // Entrée publique (le hash que nous vérifierons sur la blockchain)
    signal input expectedHash;

    // Signal de sortie (1 si valide, 0 sinon)
    signal output isValid;

    // Composants pour les vérifications
    component nameHasher = Poseidon(32);
    component dateHasher = Poseidon(8);
    component countryHasher = Poseidon(2);
    component idHasher = Poseidon(16);
    component finalHasher = Poseidon(4);

    // Hasher le nom
    for (var i = 0; i < 32; i++) {
        nameHasher.inputs[i] <== name[i];
    }

    // Hasher la date de naissance
    for (var i = 0; i < 8; i++) {
        dateHasher.inputs[i] <== dateOfBirth[i];
    }

    // Hasher le pays
    for (var i = 0; i < 2; i++) {
        countryHasher.inputs[i] <== country[i];
    }

    // Hasher le numéro d'identité
    for (var i = 0; i < 16; i++) {
        idHasher.inputs[i] <== idNumber[i];
    }

    // Combiner tous les hashes
    finalHasher.inputs[0] <== nameHasher.out;
    finalHasher.inputs[1] <== dateHasher.out;
    finalHasher.inputs[2] <== countryHasher.out;
    finalHasher.inputs[3] <== idHasher.out;

    // Vérifier que le hash final correspond à celui attendu
    isValid <== IsEqual()([finalHasher.out, expectedHash]);
}

component main = KYCVerifier();