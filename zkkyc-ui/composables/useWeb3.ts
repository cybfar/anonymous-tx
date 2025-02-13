import { ref } from "vue";
import Web3 from "web3";

export const useWeb3 = () => {
  const web3 = ref<Web3 | null>(null);
  const address = ref("");
  const isConnected = ref(false);

  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        web3.value = new Web3(window.ethereum);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error initializing Web3:", error);
      return false;
    }
  };

  const connect = async () => {
    try {
      if (!(await initWeb3())) {
        throw new Error("MetaMask not installed!");
      }

      // Demander la connexion
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      address.value = accounts[0];
      isConnected.value = true;

      // Écouter les changements
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      address.value = accounts[0];
    }
  };

  const disconnect = () => {
    address.value = "";
    isConnected.value = false;
    web3.value = null;
  };

  return {
    web3,
    address,
    isConnected,
    connect,
    disconnect,
  };
};
