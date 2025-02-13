  pragma circom 2.0.0;

include "./merkle_tree.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";

  template CommitmentHasher() {
    signal input nullifier;
    signal input secret;
    signal input amount;

    signal output commitment;
    signal output nullifierHash;

    component commitmentHasher = MiMCSponge(3, 220, 1);
   
    commitmentHasher.ins[0] <== nullifier;
    commitmentHasher.ins[1] <== secret;
    commitmentHasher.ins[2] <== amount;
    commitmentHasher.k <== 0;
    commitment <== commitmentHasher.outs[0];
    

    component nullifierHasher = MiMCSponge(1, 220, 1);

    nullifierHasher.ins[0] <== nullifier;
    nullifierHasher.k <== 0;
    nullifierHash <== nullifierHasher.outs[0];
}

  template Withdraw(levels) {
    signal input root;
    signal input nullifierHash;
    signal input amount;
    
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    signal output calculatedNullifierHash;

    component hasher = CommitmentHasher();
    hasher.nullifier <== nullifier;
    hasher.secret <== secret;
    hasher.amount <== amount;

    hasher.nullifierHash === nullifierHash;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== hasher.commitment;
    tree.root <== root;

    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

      calculatedNullifierHash <== hasher.nullifierHash;
      
  }

  component main {public [root ,amount, nullifierHash]} = Withdraw(20);