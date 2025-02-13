export default defineNuxtRouteMiddleware(() => {
  const web3Store = useWeb3Store();
  if (!web3Store.isConnected) {
    return navigateTo("/");
  }
});
