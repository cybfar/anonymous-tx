<script setup>
const web3Store = useWeb3Store()

const operationType = ref('deposit')
const selectedPool = ref('')
const poolAmount = ref(0)

const pools = [
    {
        id: 1,
        amount: 1,
        symbol: 'ETH'
    },
    {
        id: 10,
        amount: 10,
        symbol: 'ETH'
    },
    {
        id: 100,
        amount: 100,
        symbol: 'ETH'
    },
]

</script>

<template>
    <div class="min-h-screen bg-gray-900">
        <!-- Hero Section -->
        <div class="relative isolate px-6 pt-14 lg:px-8">
            <!-- Gradient Effect -->
            <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div
                    class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#0ea5e9] to-[#6366f1] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient">
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="mx-auto max-w-6xl py-12">
                <div class="text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl ">
                        <span class="inline-flex mb-2">PhantomETH
                            <IconsGhost class="text-error-500" />
                        </span>
                        <br> KYC-Verified Anonymous Mixing
                    </h1>
                    <p class="mt-6 text-lg leading-8 text-gray-300">
                        Mix your ETH securely with zero-knowledge proofs. <br>
                        Only KYC-verified addresses can participate.
                    </p>

                </div>


                <div class="mt-10 mx-2 flex flex-wrap justify-center gap-y-2 gap-x-2 items-center">
                    <a href="#" v-if="!web3Store.isConnected" @click="web3Store.connect"
                        class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-lg before:bg-primary-700 dark:before:bg-primary-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max hover:before:bg-primary-800">
                        <span
                            class="relative text-sm font-semibold text-white text-nowrap flex items-center content-center gap-x-2">
                            Connect wallet
                            <IconsMetamask class="text-xl" />
                        </span>
                    </a>

                    <a href="#" v-if="web3Store.isConnected" @click="web3Store.disconnect"
                        class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-lg before:bg-error-700 dark:before:bg-error-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max hover:before:bg-error-800">
                        <span
                            class="relative text-sm font-semibold text-white text-nowrap flex items-center content-center gap-x-2">
                            Disconnect wallet
                        </span>
                    </a>

                    <a href="#"
                        class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-lg before:bg-black dark:before:bg-gray-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max">
                        <span
                            class="relative text-sm font-semibold text-white text-nowrap flex items-center content-center gap-x-2">
                            Learn more
                            <IconsGithub class="text-xl" />
                        </span>
                    </a>

                    <NuxtLink to="/compliance"
                        class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-lg before:bg-black dark:before:bg-gray-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max">
                        <span
                            class="relative text-sm font-semibold text-white text-nowrap flex items-center content-center gap-x-2">
                            Compliance
                            <IconsInfo class="text-xl" />
                        </span>
                    </NuxtLink>
                </div>

                <!-- Warning Message -->
                <div class="mt-8 p-4 bg-yellow-900/50 border border-yellow-700/50 rounded-lg">
                    <p class="text-yellow-200 text-sm">
                        Important: Make sure you save your withdrawal proof after depositing.
                        You will need it to withdraw your funds.
                    </p>
                </div>

                <!-- Mixer Interface Card -->
                <div class="mt-8 bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
                    <!-- Amount Selection -->

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <!-- Deposit Section -->
                        <div class="p-6 bg-gray-700 rounded-xl">
                            <h3 class="text-lg font-medium text-white mb-4">Deposit ETH</h3>
                            <p class="text-gray-300 mb-4">Mix your ETH into the pool</p>
                            <button @click="operationType = 'deposit'"
                                class="w-full py-3 px-4 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-all"
                                :disabled="!web3Store.isConnected">
                                Deposit
                            </button>
                        </div>

                        <!-- Withdraw Section -->
                        <div class="p-6 bg-gray-700 rounded-xl">
                            <h3 class="text-lg font-medium text-white mb-4">Withdraw ETH</h3>
                            <p class="text-gray-300 mb-4">Withdraw your mixed ETH</p>
                            <button @click="operationType = 'withdrawal'"
                                class="w-full py-3 px-4 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-medium transition-all"
                                :disabled="!web3Store.isConnected">
                                Withdraw
                            </button>
                        </div>
                    </div>

                    <div class="mb-8">
                        <h2 v-if="operationType == 'deposit'" class="text-xl font-semibold text-white mb-4">Select
                            Amount to Mix</h2>
                        <h2 v-if="operationType == 'withdrawal'" class="text-xl font-semibold text-white mb-4">Select
                            Amount to Withdraw</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button v-for="pool in pools" :key="pool.id"
                                @click="selectedPool = pool.amount + ' ' + pool.symbol; poolAmount = pool.amount"
                                :class="[
                                    'px-6 py-4 rounded-lg font-medium transition-all duration-150',
                                    selectedPool === pool.amount + ' ' + pool.symbol
                                        ? 'bg-primary-600 hover:bg-primary-700'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                ]" class="text-white">
                                {{ pool.amount + ' ' + pool.symbol }}
                            </button>
                        </div>
                    </div>

                    <DepositForm v-if="operationType == 'deposit'" :selected-pool="selectedPool"
                        :pool-amount="poolAmount" />

                    <WithdrawalForm v-if="operationType == 'withdrawal'" :selected-pool="selectedPool"
                        :pool-amount="poolAmount" />

                    <!-- Pool Statistics -->
                    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="p-4 bg-gray-700 rounded-lg">
                            <p class="text-gray-400 text-sm">Pool Size</p>
                            <p class="text-white text-xl font-bold">{{ selectedPool || 'Not Selected' }}</p>
                        </div>
                        <div class="p-4 bg-gray-700 rounded-lg">
                            <p class="text-gray-400 text-sm">Total Deposits</p>
                            <p class="text-white text-xl font-bold">150</p>
                        </div>
                        <div class="p-4 bg-gray-700 rounded-lg">
                            <p class="text-gray-400 text-sm">Anonymity Set</p>
                            <p class="text-white text-xl font-bold">50</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<style>
.animate-gradient {
    animation: gradient 8s ease-in-out infinite;
}

@keyframes gradient {
    0% {
        transform: translateX(-50%) rotate(0deg);
        opacity: 0.2;
    }

    50% {
        transform: translateX(-50%) rotate(45deg);
        opacity: 0.3;
    }

    100% {
        transform: translateX(-50%) rotate(0deg);
        opacity: 0.2;
    }
}
</style>