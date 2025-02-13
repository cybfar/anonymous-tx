<script setup>
const web3Store = useWeb3Store()
const { isConnected, address } = storeToRefs(web3Store)

const shortenAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

</script>

<template>
  <div class="inset-x-0">
    <div v-if="!isConnected"
      class="relative flex items-center justify-center gap-4 px-5 py-3 shadow-sm text-white bg-red-500 ">
      <p class="text-sm font-semibold">
        You are not connected to your wallet
      </p>
    </div>

    <div v-if="isConnected"
      class="relative flex items-center justify-center gap-4 px-5 py-3 shadow-sm text-white bg-success-500 ">
      <p>
        Connected : Account ({{ shortenAddress(address) }})
      </p>

      <Button
        button-classes="relative flex py-2 items-center justify-center px-5 before:absolute before:inset-0 before:rounded-lg before:bg-error-500 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
        label="Disconnect wallet" @click="web3Store.disconnect" />
    </div>

  </div>
</template>
