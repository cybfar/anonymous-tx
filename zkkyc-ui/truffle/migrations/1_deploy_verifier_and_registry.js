const KYCVerifier = artifacts.require("Groth16Verifier");
const KYCRegistry = artifacts.require("KYCRegistry");

module.exports = function (deployer) {
  // On déploie KYCVerifier premièrement
  deployer.deploy(KYCVerifier).then(() => {
    // Ensuite KYCRegistry avec l'address de KYCVerifier
    return deployer.deploy(KYCRegistry, KYCVerifier.address);
  });
};
