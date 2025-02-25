const WithdrawVerifier = artifacts.require("Groth16Verifier");
const Mixer = artifacts.require("Mixer");

module.exports = function (deployer) {
  // On déploie WithdrawVerifier premièrement
  deployer.deploy(WithdrawVerifier).then(() => {
    // Ensuite Mixer avec l'address de WithdrawVerifier
    return deployer.deploy(
      Mixer,
      WithdrawVerifier.address,
      "0x7327419Cd4f8c53eb36C8325c3dc059064E0f226",
      BigInt(10000000000000000000)
    );
  });
};
