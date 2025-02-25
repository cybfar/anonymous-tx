- __zkkyc\-ui__
   - [README.md](README.md)
   - [app.vue](app.vue)
   - __assets__
     - __css__
       - [main.css](assets/css/main.css)
   - __components__
     - [Button.vue](components/Button.vue)
     - [ConnectWallet.vue](components/ConnectWallet.vue)
     - [Header.vue](components/Header.vue)
     - [Hero.vue](components/Hero.vue)
     - [HomeContent..vue](components/HomeContent..vue)
     - __Icons__
       - [Ethereum.vue](components/Icons/Ethereum.vue)
       - [Github.vue](components/Icons/Github.vue)
       - [Identity.vue](components/Icons/Identity.vue)
       - [Info.vue](components/Icons/Info.vue)
       - [Metamask.vue](components/Icons/Metamask.vue)
     - [Notification.vue](components/Notification.vue)
     - [Spinner.vue](components/Spinner.vue)
     - [TopHeader.vue](components/TopHeader.vue)
   - __composables__
     - [useProofGeneration.ts](composables/useProofGeneration.ts)
     - [useWeb3.ts](composables/useWeb3.ts)
   - [eslint.config.mjs](eslint.config.mjs)
   - __layouts__
   - [list.md](list.md)
   - __middleware__
     - [auth.ts](middleware/auth.ts)
   - [node\_modules](node_modules)
   - [nuxt.config.ts](nuxt.config.ts)
   - [package.json](package.json)
   - __pages__
     - [compliance.vue](pages/compliance.vue)
     - [index.vue](pages/index.vue)
     - [kyc.vue](pages/kyc.vue)
     - [test.vue](pages/test.vue)
     - [verify\-proof.vue](pages/verify-proof.vue)
     - [whitelist.vue](pages/whitelist.vue)
   - __plugins__
     - [web3.client.ts](plugins/web3.client.ts)
   - [pnpm\-lock.yaml](pnpm-lock.yaml)
   - __public__
     - [favicon.ico](public/favicon.ico)
     - [robots.txt](public/robots.txt)
   - __server__
     - __api__
       - [generate\-proof.ts](server/api/generate-proof.ts)
       - [proof.post.ts](server/api/proof.post.ts)
     - [tsconfig.json](server/tsconfig.json)
     - __utils__
       - [proofWorker.js](server/utils/proofWorker.js)
   - __stores__
     - [web3.js](stores/web3.js)
   - [tailwind.config.js](tailwind.config.js)
   - __truffle__
     - __build__
       - __circuits__
         - [kyc\_verifier.r1cs](truffle/build/circuits/kyc_verifier.r1cs)
         - [kyc\_verifier.sym](truffle/build/circuits/kyc_verifier.sym)
         - [kyc\_verifier\_0000.zkey](truffle/build/circuits/kyc_verifier_0000.zkey)
         - [kyc\_verifier\_constraints.json](truffle/build/circuits/kyc_verifier_constraints.json)
         - __kyc\_verifier\_cpp__
           - [Makefile](truffle/build/circuits/kyc_verifier_cpp/Makefile)
           - [calcwit.cpp](truffle/build/circuits/kyc_verifier_cpp/calcwit.cpp)
           - [calcwit.hpp](truffle/build/circuits/kyc_verifier_cpp/calcwit.hpp)
           - [circom.hpp](truffle/build/circuits/kyc_verifier_cpp/circom.hpp)
           - [fr.asm](truffle/build/circuits/kyc_verifier_cpp/fr.asm)
           - [fr.cpp](truffle/build/circuits/kyc_verifier_cpp/fr.cpp)
           - [fr.hpp](truffle/build/circuits/kyc_verifier_cpp/fr.hpp)
           - [kyc\_verifier.cpp](truffle/build/circuits/kyc_verifier_cpp/kyc_verifier.cpp)
           - [kyc\_verifier.dat](truffle/build/circuits/kyc_verifier_cpp/kyc_verifier.dat)
           - [main.cpp](truffle/build/circuits/kyc_verifier_cpp/main.cpp)
         - [kyc\_verifier\_final.zkey](truffle/build/circuits/kyc_verifier_final.zkey)
         - __kyc\_verifier\_js__
           - [generate\_witness.js](truffle/build/circuits/kyc_verifier_js/generate_witness.js)
           - [kyc\_verifier.wasm](truffle/build/circuits/kyc_verifier_js/kyc_verifier.wasm)
           - [witness\_calculator.js](truffle/build/circuits/kyc_verifier_js/witness_calculator.js)
         - [pot16\_0000.ptau](truffle/build/circuits/pot16_0000.ptau)
         - [pot16\_0001.ptau](truffle/build/circuits/pot16_0001.ptau)
         - [pot16\_final.ptau](truffle/build/circuits/pot16_final.ptau)
         - [verification\_key.json](truffle/build/circuits/verification_key.json)
       - __contracts__
         - [Context.json](truffle/build/contracts/Context.json)
         - [Groth16Verifier.json](truffle/build/contracts/Groth16Verifier.json)
         - [IKYCVerifier.json](truffle/build/contracts/IKYCVerifier.json)
         - [KYCRegistry.json](truffle/build/contracts/KYCRegistry.json)
         - [KYCVerifier.json](truffle/build/contracts/KYCVerifier.json)
         - [Ownable.json](truffle/build/contracts/Ownable.json)
     - __circuits__
       - [kyc\_verifier.circom](truffle/circuits/kyc_verifier.circom)
     - [compile\_circuit.sh](truffle/compile_circuit.sh)
     - __contracts__
       - [KYCRegistry.sol](truffle/contracts/KYCRegistry.sol)
       - [KYCVerifier.sol](truffle/contracts/KYCVerifier.sol)
     - __migrations__
       - [1\_deploy\_verifier\_and\_registry.js](truffle/migrations/1_deploy_verifier_and_registry.js)
     - [node\_modules](truffle/node_modules)
     - [package.json](truffle/package.json)
     - [pnpm\-lock.yaml](truffle/pnpm-lock.yaml)
     - [simulate\_proof.js](truffle/simulate_proof.js)
     - __test__
       - [MerkleTreeWithHistory.test.js](truffle/test/MerkleTreeWithHistory.test.js)
       - [test\_interaction.js](truffle/test/test_interaction.js)
     - [test.js](truffle/test.js)
     - [truffle\-config.js](truffle/truffle-config.js)
     - __zk__
   - [tsconfig.json](tsconfig.json)

