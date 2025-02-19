import { defineStore } from "pinia";
import Web3 from "web3";
import { useCookie } from "#app";
import KYCRegistryABI from "../truffle/build/contracts/KYCRegistry.json";
import KYCVerifierABI from "../truffle/build/contracts/Groth16Verifier.json";

export const useWeb3Store = defineStore("web3", {
  state: () => ({
    web3: null,
    address: useCookie("address").value || "",
    isConnected: useCookie("isConnected").value === "true",
    kycRegistry: null,
    kycVerifier: null,
    notification: {
      show: false,
      type: "",
      message: "",
    },
    isProcessing: false,
    kycRegistryEvent: null,
    addWhitelistedEvent: null,
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
        console.log("Current Network ID:", networkId);
        console.log("Available Networks:", KYCRegistryABI.networks);

        if (!KYCRegistryABI.networks[networkId]) {
          throw new Error(
            `Contract not deployed on network ${networkId}. Please switch to a supported network.`
          );
        }

        this.kycRegistry = new this.web3.eth.Contract(
          KYCRegistryABI.abi,
          KYCRegistryABI.networks[networkId].address
        );

        this.kycVerifier = new this.web3.eth.Contract(
          KYCVerifierABI.abi,
          KYCVerifierABI.networks[networkId].address
        );

        this.kycRegistryEvent = this.kycRegistry.events.KYCVerified();
        this.addWhitelistedEvent = this.kycRegistry.events.AddressWhitelisted();
      } catch (error) {
        this.showNotification("error", error.message);
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
      (this.kycRegistry = null),
        (this.kycVerifier = null),
        (this.kycRegistryEvent = null),
        (this.addWhitelistedEvent = null),
        this.clearCookies();
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

      if (!this.kycRegistry) await this.initContracts();

      this.kycRegistryEvent.on("data", (event) => {
        console.log("KYC Event:", event);
        this.isProcessing = false;

        this.showNotification(
          "success",
          "Your KYC proof is valid and your current address " +
            event.returnValues.firstAddress +
            " is whitelisted"
        );
      });

      try {
        await this.kycRegistry.methods
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

        await this.kycRegistry.methods
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

      if (!this.kycRegistry) await this.initContracts();

      try {
        if (!this.web3.utils.isAddress(_address)) {
          throw new Error("Invalid address");
        }

        try {
          await this.kycRegistry.methods
            .addWhitelistedAddress(_hash, _address)
            .call({ from: this.address });
        } catch (error) {
          console.log("Call error:", error);
          const revertMessage = error.data.message;

          console.warn(error);

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
        const receipt = await this.kycRegistry.methods
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
      if (!this.kycRegistry) await this.initContracts();

      try {
        if (!this.web3.utils.isAddress(address)) {
          throw new Error("Invalid address");
        }

        const isWhitelisted = await this.kycRegistry.methods
          .isWhitelisted(address)
          .call();
        return isWhitelisted
          ? "This address is whitelisted"
          : "This address is not whitelisted";
      } catch (error) {
        this.showNotification("error", "Failed to check whitelist status");
        throw error;
      }
    },

    async getKYCAddresses(expectedHash) {
      if (!this.kycRegistry) await this.initContracts();

      try {
        const addresses = await this.kycRegistry.methods
          .getKYCAddresses(expectedHash)
          .call();
        return addresses;
      } catch (error) {
        this.showNotification("error", "Failed to fetch KYC addresses");
        throw error;
      }
    },

    async getPastEvents() {
      if (!this.kycRegistry) await this.initContracts();

      try {
        const pastEvents = await this.kycRegistry.getPastEvents(
          "AddressWhitelisted",
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        );

        const events = pastEvents.map((event) => {
          const sanitizedEvent = Object.fromEntries(
            Object.entries(event.returnValues).map(([key, value]) => [
              key,
              typeof value === "bigint" ? value.toString() : value,
            ])
          );
          return sanitizedEvent;
        });

        const jsonEvents = JSON.stringify(events); // Cela fonctionnera sans erreur
        console.log(jsonEvents);

        return jsonEvents;
      } catch (error) {
        this.showNotification("error", "Failed to load past events");
        console.error(error);
      }
    },

    async updateVerifier(newVerifier) {
      try {
        const owner = await this.kycRegistry.methods.owner().call();
        if (owner.toLowerCase() !== this.address.toLowerCase()) {
          throw new Error("Only the contract owner can update the verifier");
        }

        const result = await this.kycRegistry.methods
          .updateVerifier(newVerifier)
          .send({ from: this.address });

        this.showNotification("success", "Verifier updated successfully");
        return result;
      } catch (error) {
        this.showNotification("error", error.message);
        throw error;
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
