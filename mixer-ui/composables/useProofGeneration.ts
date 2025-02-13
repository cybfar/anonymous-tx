export const useProofGeneration = () => {
  const generateProof = async (formData) => {
    if (!process.client) return;

    // Import dynamique pour le côté client uniquement
    const { buildPoseidon } = await import("circomlibjs");
    const snarkjs = await import("snarkjs");
    const poseidon = await buildPoseidon();

    const input = {
      name: Array(32)
        .fill(0)
        .map((_, i) => formData.personalInfo.firstName.charCodeAt(i) || 0),
      dateOfBirth: formData.personalInfo.dateOfBirth.split("").map(Number),
      country: [
        formData.location.country.charCodeAt(0),
        formData.location.country.charCodeAt(1),
      ],
      idNumber: Array(16)
        .fill(0)
        .map((_, i) => formData.identity.idNumber.charCodeAt(i) || 0),
    };

    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "/truffle/build/circuits/kyc_verifier_js/kyc_verifier.wasm",
        "/truffle/build/circuits/kyc_verifier_final.zkey"
      );

      return { proof, publicSignals };
    } catch (error) {
      console.error("Proof generation failed:", error);
      throw error;
    }
  };

  return { generateProof };
};
