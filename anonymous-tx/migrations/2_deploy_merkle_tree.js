const MerkleTreeWithHistory = artifacts.require("MerkleTreeWithHistory");

module.exports = function(deployer) {
  deployer.deploy(MerkleTreeWithHistory);
};