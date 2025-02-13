<!-- components/Header.vue -->
<script setup>
import { storeToRefs } from 'pinia'
const web3Store = useWeb3Store()
const { isConnected, address } = storeToRefs(web3Store)

const shortenAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
</script>

<template>
    <header class="fixed w-full z-50">
        <!-- Banner for wallet status -->
        <div class="relative flex items-center justify-center gap-4 px-5 py-3 shadow-sm text-white"
            :class="isConnected ? 'bg-success-500' : 'bg-red-500'">
            <p v-if="!isConnected" class="text-sm font-semibold">
                You are not connected to your wallet
            </p>
            <p v-else>
                Connected : {{ shortenAddress(address) }}
            </p>
        </div>

        <!-- Main navigation -->
        <nav class="bg-white/80 backdrop-blur-md shadow dark:bg-gray-900/80">
            <div class="container px-6 py-4 mx-auto">
                <div class="flex items-center justify-between">
                    <!-- Logo/Brand -->
                    <div class="flex items-center">
                        <NuxtLink to="/" class="text-xl font-bold text-gray-800 dark:text-white">
                            zk-KYC
                        </NuxtLink>
                    </div>

                    <!-- Navigation Items -->
                    <div class="flex items-center gap-x-6">
                        <NuxtLink to="/kyc"
                            class="text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400">
                            KYC
                        </NuxtLink>

                        <NuxtLink to="/verify-proof"
                            class="text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400">
                            Verify proof
                        </NuxtLink>

                        <NuxtLink to="/whitelist"
                            class="text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400">
                            Whitelist
                        </NuxtLink>

                        <NuxtLink to="/compliance"
                            class="text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400">
                            Compliance tool
                        </NuxtLink>

                        <!-- Connect Button -->
                        <button v-if="!isConnected" @click="web3Store.connect"
                            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                            Connect Wallet
                        </button>
                        <button v-else @click="web3Store.disconnect"
                            class="px-4 py-2 text-sm font-medium text-white bg-error-600 rounded-lg hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <!-- Spacer to prevent content from hiding under fixed header -->
    <div class="h-24"></div>
</template>