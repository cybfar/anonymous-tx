<script setup>
const web3Store = useWeb3Store()
const { isConnected, address } = storeToRefs(web3Store)

const shortenAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

</script>

<template>
  <div class="inset-x-0 z-50">
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
    </div>

  </div>
</template>
