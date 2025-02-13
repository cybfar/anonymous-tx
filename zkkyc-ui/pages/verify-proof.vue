<script setup>

definePageMeta({
    middleware: ['auth']
})

const web3Store = useWeb3Store()

const currentStep = ref(1)
const proof = ref('')

const steps = [
    {
        id: 1,
        name: 'Verify proof',
        description: 'Verify your zk-proof to whitelist addresses'
    }
]

const submitProof = async () => {
    try {
        const proofData = JSON.parse(proof.value)
        const result = await web3Store.verifyAndWhitelist(proofData)
        if (result) {
            console.log(result);

        }
    } catch (error) {
        console.error(error);

    }
}

onBeforeMount(() => {
    web3Store.success = "",
        web3Store.error = ""
})

</script>

<template>
    <div>

        <Header />

        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 mt-9 ">

            <ConnectWallet v-if="!web3Store.isConnected" />

            <!-- Formulaire Whitelist -->
            <div v-else class="max-w-3xl mx-auto px-4">
                <!-- Progress Steps -->
                <nav aria-label="Progress">
                    <ol role="list" class="space-y-4 md:flex md:space-y-0 md:space-x-8">
                        <li v-for="step in steps" :key="step.id" class="md:flex-1">
                            <div :class="[
                                currentStep >= step.id ? 'border-primary-600' : 'border-gray-200',
                                'group pl-4 py-2 flex border-l-4 hover:border-primary-800 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4'
                            ]">
                                <span class="text-sm font-medium">
                                    <span :class="[
                                        currentStep >= step.id ? 'text-primary-600' : 'text-gray-500',
                                        'font-semibold'
                                    ]">{{ step.name }}</span>
                                    <span class="block mt-0.5 text-sm font-medium text-gray-500">{{ step.description
                                        }}</span>
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div class="mt-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">

                    <Notification />

                    <div v-if="currentStep === 1">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Verify proof and whitelist
                        </h3>
                        <div class="space-y-6">

                            <div class="mb-4">

                                <label for="proof"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Generated
                                    Proof</label>
                                <textarea id="proof" rows="4" v-model="proof" placeholder="Paste here"
                                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>

                            </div>
                        </div>
                    </div>

                    <div class="mt-8 flex justify-between">

                        <button v-if="!web3Store.isProcessing" @click=submitProof
                            class="bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-800 transition-all duration-150 ease-in-out">
                            Verify proof
                        </button>

                        <button v-if="web3Store.isProcessing"
                            class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-all duration-150 ease-in-out flex gap-x-2 items-center pointer-events-none cursor-not-allowed">
                            Processing
                            <Spinner />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>