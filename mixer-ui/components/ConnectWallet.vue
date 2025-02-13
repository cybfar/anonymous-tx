<script setup>
const web3Store = useWeb3Store()
</script>

<template>

    <div v-if="!web3Store.isConnected" class="max-w-3xl mx-auto px-4 text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Please connect your wallet first
        </h2>
        <button @click="web3Store.connect" class="mt-4 bg-primary-600 text-white px-4 py-2 rounded">
            Connect Wallet
        </button>
    </div>

</template>