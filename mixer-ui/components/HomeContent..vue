<template>
    <div>
        <!-- Mixer Interface Card -->
        <div class="mt-8 bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
            <!-- Amount Selection -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold text-white mb-4">Select Amount to Mix</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button v-for="amount in ['0.1 ETH', '1 ETH', '10 ETH']" :key="amount"
                        class="px-6 py-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all">
                        {{ amount }}
                    </button>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Deposit Section -->
                <div class="p-6 bg-gray-700 rounded-xl">
                    <h3 class="text-lg font-medium text-white mb-4">Deposit ETH</h3>
                    <p class="text-gray-300 mb-4">Mix your ETH into the pool</p>
                    <button
                        class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                        :disabled="!web3Store.isConnected">
                        Deposit
                    </button>
                </div>

                <!-- Withdraw Section -->
                <div class="p-6 bg-gray-700 rounded-xl">
                    <h3 class="text-lg font-medium text-white mb-4">Withdraw ETH</h3>
                    <p class="text-gray-300 mb-4">Withdraw your mixed ETH</p>
                    <button
                        class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
                        :disabled="!web3Store.isConnected">
                        Withdraw
                    </button>
                </div>
            </div>

            <!-- Pool Statistics -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-4 bg-gray-700 rounded-lg">
                    <p class="text-gray-400 text-sm">Pool Size</p>
                    <p class="text-white text-xl font-bold">100 ETH</p>
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
</template>