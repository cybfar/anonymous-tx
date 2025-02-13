import { defineStore } from "pinia";
import Web3 from "web3";
import { useCookie } from "#app";
import MixerABI from "../truffle/build/contracts/Mixer.json";
import VerifierABI from "../truffle/build/contracts/Groth16Verifier.json";
import { MerkleTree } from "fixed-merkle-tree";
import { Buffer } from "buffer";
import createKeccakHash from "keccak";

export const useWeb3Store = defineStore("web3", {
  state: () => ({
    web3: null,
    address: useCookie("address").value || "",
    mixerAddress: null,
    networkId: null,
    isConnected: useCookie("isConnected").value === "true",
    mixer: null,
    withdrawVerifier: null,
    notification: {
      show: false,
      type: "",
      message: "",
    },
    isProcessing: false,
    depositEvent: null,
    withdrawEvent: null,
  }),

  actions: {
    async init() {
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        this.web3.eth.handleRevert = true;
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            this.address = accounts[0];
            this.isConnected = true;
            this.persistState();
          }

          window.ethereum.on("accountsChanged", this.handleAccountsChanged);
          window.ethereum.on("chainChanged", () => window.location.reload());
        } catch (error) {
          console.error("Init error:", error);
        }
      }
    },

    async initContracts() {
      try {
        const networkId = await this.web3.eth.net.getId();
        this.networkId = await networkId;
        this.mixer = new this.web3.eth.Contract(
          MixerABI.abi,
          MixerABI.networks[networkId].address
        );

        this.mixerAddress = MixerABI.networks[networkId].address;

        this.withdrawVerifier = new this.web3.eth.Contract(
          VerifierABI.abi,
          VerifierABI.networks[networkId].address
        );

        this.depositEvent = this.mixer.events.Deposit();
        this.withdrawEvent = this.mixer.events.Withdrawal();
      } catch (error) {
        console.error("Contract init error:", error);
      }
    },

    async connect() {
      try {
        if (window.ethereum) {
          this.web3 = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          this.address = accounts[0];
          this.isConnected = true;
          this.persistState();

          window.ethereum.on("accountsChanged", this.handleAccountsChanged);
          window.ethereum.on("chainChanged", () => window.location.reload());
        }
      } catch (error) {
        console.error("Connection error:", error);
      }
    },

    handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.address = accounts[0];
        this.isConnected = true;
        this.persistState();
      }
    },

    showNotification(type, message) {
      this.notification = {
        show: true,
        type,
        message,
      };

      setTimeout(() => {
        this.clearNotification();
      }, 5000);
    },

    clearNotification() {
      this.notification = {
        show: false,
        type: "",
        message: "",
      };
    },

    async disconnect() {
      this.clearNotification();
      this.isProcessing = false;
      this.isConnected = false;
      this.web3.currentProvider.disconnect();
      this.web3 = null;
      (this.mixer = null),
        (this.withdrawVerifier = null),
        (this.depositEvent = null),
        (this.withdrawEvent = null),
        this.clearCookies();
    },

    async deposit(_amount, _commitmentHash) {
      const depositAmount = this.web3.utils.toWei(_amount, "ether");
      console.log(depositAmount);

      if (!this.mixer) await this.initContracts();

      this.depositEvent.on("data", (event) => {
        console.log("Mixer Event:", event);
        this.isProcessing = false;

        this.showNotification(
          "success",
          "Deposit successful! Make sure to save your note - you'll need it to withdraw your funds later."
        );
      });

      try {
        const receipt = await this.mixer.methods.deposit(_commitmentHash).send({
          from: this.address,
          value: depositAmount,
          gas: 300000,
        });

        this.isProcessing = false;
        return {
          success: true,
          receipt,
          message:
            "Deposit successful! Make sure to save your note - you'll need it to withdraw your funds later.",
        };
      } catch (error) {
        this.isProcessing = false;
        this.showNotification("error", error.message);
        return {
          success: false,
          error: error.message,
        };
      } finally {
        this.isProcessing = false;
      }
    },

    async withdraw(_amount, _pool, _note, _address) {
      const withdrawAmount = this.web3.utils.toWei(_amount, "ether");

      if (!this.mixer) await this.initContracts();

      this.withdrawEvent.on("data", (event) => {
        console.log("Mixer Event:", event);
        this.isProcessing = false;

        this.showNotification("success", "Withdraw successful !.");
      });

      const data = await fetch("http://192.168.56.2:3001/create-withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poolAmount: _amount,
          selectedPool: _pool,
          note: _note,
          networkId: this.networkId.toString(),
        }),
      });

      const deposit = await data.json();

      if (!deposit.success) {
        throw new Error("Error creating withdrawal request");
      }

      // const pastEvents = await this.mixer.getPastEvents("Deposit", {
      //   fromBlock: 0,
      //   toBlock: "latest",
      // });

      // const leaves = pastEvents
      //   .sort((a, b) =>
      //     String(a.returnValues.leafIndex).localeCompare(
      //       String(b.returnValues.leafIndex)
      //     )
      //   )
      //   .map((e) => e.returnValues.commitment.toString());

      // // console.log(leaves);

      // const req = await fetch("http://192.168.56.2:3001/generate-merkle-tree", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     leaves: leaves,
      //   }),
      // });

      // const tree = await req.json();

      // if (tree.success) {
      //   // this.generateMerkleProof(deposit);
      //   console.log(tree);
      // }

      // try {
      //   const receipt = await this.mixer.methods.deposit(_commitmentHash).send({
      //     from: this.address,
      //     value: depositAmount,
      //     gas: 3000000,
      //   });

      //   this.isProcessing = false;
      //   return {
      //     success: true,
      //     receipt,
      //     message:
      //       "Deposit successful! Make sure to save your note - you'll need it to withdraw your funds later.",
      //   };
      // } catch (error) {
      //   this.isProcessing = false;
      //   this.showNotification("error", error.message);
      //   return {
      //     success: false,
      //     error: error.message,
      //   };
      // } finally {
      //   this.isProcessing = false;
      // }
    },
    async verifyAndWhitelist(_proof) {
      this.isProcessing = true;
      this.clearNotification();

      const { proof, publicSignals, expectedHash } = _proof;

      const _pA = proof[0];
      const _pB = proof[1];
      const _pC = proof[2];
      const _expectedHash = expectedHash;
      const _pubSignals = publicSignals;

      if (!this.mixer) await this.initContracts();

      this.depositEvent.on("data", (event) => {
        console.log("Mixer Event:", event);
        this.isProcessing = false;

        this.showNotification(
          "success",
          "Your KYC proof is valid and your current address " +
            event.returnValues.firstAddress +
            " is whitelisted"
        );
      });

      try {
        await this.mixer.methods
          .verifyKYC(_pA, _pB, _pC, _pubSignals, _expectedHash, this.address)
          .call()
          .catch((revertReason) => {
            if (revertReason.data.message.includes("KYC already verified")) {
              throw new Error("This KYC has already been verified");
            } else if (revertReason.data.message.includes("Invalid address")) {
              throw new Error("Invalid wallet address provided");
            } else if (
              revertReason.data.message.includes("Address already whitelisted")
            ) {
              throw new Error("This address is already whitelisted");
            } else if (
              revertReason.data.message.includes("Invalid KYC proof")
            ) {
              throw new Error("The provided KYC proof is invalid");
            } else if (
              revertReason.data.message.includes("Invalid proof result")
            ) {
              throw new Error("The proof verification failed");
            } else {
              throw new Error("Transaction would fail");
            }
          });

        await this.mixer.methods
          .verifyKYC(_pA, _pB, _pC, _pubSignals, _expectedHash, this.address)
          .send({ from: this.address })
          .on("receipt", function (receipt) {
            this.isProcessing = false;
            return {
              data: receipt,
              success: true,
            };
          });
      } catch (error) {
        this.showNotification("error", error);
        this.isProcessing = false;
      } finally {
        this.isProcessing = false;
      }
    },

    async addWhitelistedAddress(_hash, _address) {
      this.isProcessing = true;
      this.clearNotification();

      if (!this.mixer) await this.initContracts();

      try {
        // Vérification préalable
        try {
          await this.mixer.methods
            .addWhitelistedAddress(_hash, _address)
            .call({ from: this.address });
        } catch (error) {
          console.log("Call error:", error);
          const revertMessage = error.data.message;

          if (revertMessage?.includes("KYC not verified")) {
            throw new Error("KYC not verified for your current address");
          } else if (revertMessage?.includes("Invalid address")) {
            throw new Error("Invalid wallet address provided");
          } else if (revertMessage?.includes("Address already whitelisted")) {
            throw new Error("Address already whitelisted");
          } else if (revertMessage?.includes("Not authorized")) {
            throw new Error(
              "You are not authorized to add addresses for this KYC"
            );
          } else {
            throw new Error(revertMessage || "Transaction would fail");
          }
        }

        // Envoyer la transaction
        const receipt = await this.mixer.methods
          .addWhitelistedAddress(_hash, _address)
          .send({ from: this.address });

        if (receipt.status) {
          this.showNotification(
            "success",
            `Address ${_address} has been whitelisted successfully`
          );
          return {
            data: receipt,
            success: true,
          };
        }
      } catch (error) {
        this.showNotification("error", error.message || "Transaction failed");
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },

    async checkWhitelistStatus(address) {
      if (!this.mixer) await this.initContracts();

      try {
        const isWhitelisted = await this.mixer.methods
          .isWhitelisted(address)
          .call();
        return isWhitelisted;
      } catch (error) {
        this.showNotification("error", "Failed to check whitelist status");
        throw error;
      }
    },

    async getBalance() {
      if (!this.mixer) await this.initContracts();

      try {
        const balance = await this.web3.eth.getBalance(this.mixerAddress);

        return this.web3.utils.fromWei(balance, "ether") + " ETH";
      } catch (error) {
        this.showNotification("error", "Failed to check balance");
        console.log(error);

        throw error;
      }
    },

    async getKYCAddresses(expectedHash) {
      if (!this.mixer) await this.initContracts();

      try {
        const addresses = await this.mixer.methods
          .getKYCAddresses(expectedHash)
          .call();
        return addresses;
      } catch (error) {
        this.showNotification("error", "Failed to fetch KYC addresses");
        throw error;
      }
    },

    async updateVerifier(newVerifier) {
      try {
        const owner = await this.mixer.methods.owner().call();
        if (owner.toLowerCase() !== this.address.toLowerCase()) {
          throw new Error("Only the contract owner can update the verifier");
        }

        const result = await this.mixer.methods
          .updateVerifier(newVerifier)
          .send({ from: this.address });

        this.showNotification("success", "Verifier updated successfully");
        return result;
      } catch (error) {
        this.showNotification("error", error.message);
        throw error;
      }
    },

    async getPastEvents() {
      if (!this.mixer) await this.initContracts();

      try {
        const pastEvents = await this.mixer.getPastEvents("Deposit", {
          fromBlock: 0,
          toBlock: "latest",
        });

        const events = pastEvents.map((event) => {
          const sanitizedEvent = Object.fromEntries(
            Object.entries(event.returnValues).map(([key, value]) => [
              key,
              typeof value === "bigint" ? value.toString() : value,
            ])
          );
          return sanitizedEvent;
        });

        const jsonEvents = JSON.stringify(events);
        console.log(jsonEvents);

        return jsonEvents;
      } catch (error) {
        this.showNotification("error", "Failed to load past events");
        console.error(error);
      }
    },

    async generateMerkleProof(deposit) {
      if (!this.mixer) await this.initContracts();

      const pastEvents = await this.mixer.getPastEvents("Deposit", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const leaves = pastEvents
        .sort((a, b) =>
          String(a.returnValues.leafIndex).localeCompare(
            String(b.returnValues.leafIndex)
          )
        )
        .map((e) => e.returnValues.commitment);

      const tree = new MerkleTree(20, leaves, {
        hashFunction: (left, right) => {
          if (BigInt(left) > BigInt(right)) {
            [left, right] = [right, left];
          }

          const input = Buffer.concat([
            Buffer.from(BigInt(left).toString(16).padStart(64, "0"), "hex"),
            Buffer.from(BigInt(right).toString(16).padStart(64, "0"), "hex"),
          ]);

          const hash = createKeccakHash("keccak256")
            .update(input)
            .digest("hex");

          return BigInt("0x" + hash).toString();
        },
      });

      const currentDepositEvent = pastEvents.find(
        (e) => e.returnValues.commitment === BigInt(deposit.commitmentHash)
      );

      if (!currentDepositEvent) {
        throw new Error("Deposit not found");
      }

      const depositIndex = currentDepositEvent.returnValues.leafIndex;
      const root = tree.root;

      const isValidRoot = await this.mixer.methods.isKnownRoot(root).call();
      const isSpent = await this.mixer.methods
        .isSpent(deposit.nullifierHash)
        .call();

      const mixerRoot = await this.mixer.methods.roots(0).call();

      console.log(root, mixerRoot);
    },

    persistState() {
      useCookie("address").value = this.address;
      useCookie("isConnected").value = this.isConnected.toString();
    },

    clearCookies() {
      useCookie("address").value = null;
      useCookie("isConnected").value = null;
    },
  },
});
