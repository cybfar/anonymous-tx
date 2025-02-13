<script setup>

definePageMeta({
    middleware: ['auth']
})

const web3Store = useWeb3Store()

const currentStep = ref(1)
const address = ref('')
const returnData = ref('')


const steps = [
    {
        id: 1,
        name: 'Compliance tool ',
        description: 'Compliance tool '
    }
]


const getPastEvents = async () => {
    try {
        returnData.value = ''

        const result = await web3Store.getPastEvents()
        if (result) {
            console.log(result);
            returnData.value = result
        }
    } catch (error) {
        console.error(error);

    }
}

const getBalance = async () => {
    try {
        returnData.value = ''

        const result = await web3Store.getBalance()
        if (result) {
            console.log(result);
            returnData.value = result
        }
    } catch (error) {
        console.error(error);

    }
}

</script>

<template>
    <div>

        <Header />

        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 mt-9 ">

            <ConnectWallet v-if="!web3Store.isConnected" />
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

                    <div v-if="returnData"
                        class="bg-blue-100 border-l-4 border-primary-500 text-primary-700 p-4 text-xs mt-1.5 mb-1.5"
                        role="alert">
                        <p>{{ returnData }}</p>
                    </div>

                    <div v-if="currentStep === 1">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Compliance tool
                        </h3>
                    </div>

                    <div class="mt-8 flex gap-x-2">

                        <button v-if="!web3Store.isProcessing" @click=getPastEvents
                            class="bg-error-700 text-white px-4 py-2 rounded hover:bg-error-800 transition-all duration-150 ease-in-out text-sm text-nowrap">
                            Get Past Events
                        </button>

                        <button v-if="!web3Store.isProcessing" @click=getBalance
                            class="bg-error-700 text-white px-4 py-2 rounded hover:bg-error-800 transition-all duration-150 ease-in-out text-sm text-nowrap">
                            Get Balance
                        </button>

                        <button v-if="web3Store.isProcessing"
                            class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-all duration-150 ease-in-out flex gap-x-2 items-center pointer-events-none cursor-not-allowed text-sm text-nowrap">
                            Processing
                            <Spinner />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>