import { defineStore } from "pinia";
import Web3 from "web3";
import { useCookie } from "#app";
import MixerABI from "../truffle/build/contracts/Mixer.json";
import VerifierABI from "../truffle/build/contracts/Groth16Verifier.json";
import { MerkleTree } from "fixed-merkle-tree";
import { Buffer } from "buffer";
import createKeccakHash from "keccak";
import { saveAs } from "file-saver";

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
        this.web3.handleRevert = true;
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

    async deposit(_amount, selectedPool) {
      const depositAmount = this.web3.utils.toWei(_amount, "ether");

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
        const response = await fetch(
          "http://192.168.56.2:3001/create-deposit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              poolAmount: _amount,
              selectedPool: selectedPool,
            }),
          }
        );

        const data = await response.json();
        if (!data.success) {
          throw new Error(
            "An error occured during the deposit, please try again later !"
          );
        }

        const { nullifier, secret, commitmentHash } = data;
        const commitment = commitmentHash;
        const note = "phantom-eth." + _amount + "." + nullifier + "." + secret;

        const receipt = await this.mixer.methods.deposit(commitment).send({
          from: this.address,
          value: depositAmount,
          gas: 500000,
        });

        this.isProcessing = false;

        return {
          success: true,
          receipt,
          note: note,
          message:
            "Deposit successful! Make sure to save your note - you'll need it to withdraw your funds later.",
        };
      } catch (error) {
        this.isProcessing = false;
        const errorMessage = ref(null);

        if (
          error.data &&
          error.data.message.includes(
            "Your address is not whitelisted. Please complete KYC first."
          )
        ) {
          errorMessage.value =
            "Your address is not whitelisted. Please complete a KYC first to whitelist your address.";
        } else if (error.data && error.data.message.includes("Wrong amount")) {
          errorMessage.value = "Wrong deposit amount for this pool.";
        } else if (
          error.data &&
          error.data.message.includes("Commitment cannot be 0")
        ) {
          errorMessage.value = "Invalid commitment";
        } else {
          errorMessage.value =
            error.message ?? "An error occured, please try again later";
        }

        this.showNotification("error", errorMessage.value);
        return {
          success: false,
          error: errorMessage.value ?? error.message,
        };
      } finally {
        this.isProcessing = false;
      }
    },

    async withdraw(_amount, _pool, _note, _address) {
      const withdrawAmount = this.web3.utils.toWei(_amount, "ether");

      if (!this.mixer) await this.initContracts();

      this.withdrawEvent.on("data", (event) => {
        console.log("Withdrawal Event:", event);
        this.isProcessing = false;
      });

      try {
        const data = await fetch("http://192.168.56.2:3001/create-withdrawal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            poolAmount: withdrawAmount,
            selectedPool: _pool,
            note: _note,
            networkId: this.networkId.toString(),
            withdrawalAddress: _address,
          }),
        });

        const deposit = await data.json();

        if (deposit.error) {
          console.warn(deposit.error);

          throw new Error(deposit.error);
        }

        const proof = deposit.proof;
        const publicSignals = deposit.publicSignals;
        const nullifierHash = deposit.nullifierHash;
        const root = deposit.root;

        const relay = await fetch("http://192.168.56.2:3005/relay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proof: proof,
            publicSignals: publicSignals,
            root: root,
            nullifierHash: nullifierHash,
            recipient: _address,
            amount: _amount,
            networkId: this.networkId.toString(),
            withdrawalAddress: _address,
          }),
        });

        const relayer = await relay.json();

        if (relayer.error) {
          console.warn(relayer.error);
          throw new Error(relayer.error);
        }

        return {
          success: true,
          txHash: relayer.txHash,
          message:
            "Withdraw successful !.\n Transaction Hash :" + relayer.txHash,
        };
      } catch (error) {
        this.isProcessing = false;

        this.showNotification("error", error);
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

    async getNumberOfDepositAndAnonymitySet(_poolAmount) {
      if (!this.mixer) await this.initContracts();

      try {
        const pastEvents = await this.mixer.getPastEvents("Deposit", {
          fromBlock: 0,
          toBlock: "latest",
        });

        const anonymitySet = await this.mixer.methods
          .getAnonymitySetSize(this.web3.utils.toWei(_poolAmount, "ether"))
          .call();

        return {
          depositNumber: pastEvents.length,
          anonymitySetSize: anonymitySet,
          success: true,
        };
      } catch (error) {
        this.showNotification("error", "Failed to load number of deposits");
        return {
          success: false,
        };
      }
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
