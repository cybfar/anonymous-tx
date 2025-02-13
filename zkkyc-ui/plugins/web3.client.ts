import Web3 from "web3";
import { useWeb3Store } from "~/stores/web3";

export default defineNuxtPlugin(async () => {
  const web3Store = useWeb3Store();
  await web3Store.init();
  return {
    provide: {
      web3: web3Store,
    },
  };
});
