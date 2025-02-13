<script setup>

definePageMeta({
    middleware: ['auth']
})

const web3Store = useWeb3Store()
const isProcessing = ref(false)
const proofGenerated = ref(false)
const proof = ref("")

const currentStep = ref(1)
const formData = reactive({
    fullName: '',
    dateOfBirth: '',
    country: '',
    idNumber: '',
})

const steps = [
    {
        id: 1,
        name: 'Personal Information',
        description: 'Basic personal details'
    }
]

const handleSubmit = async () => {
    proofGenerated.value = false
    isProcessing.value = true
    try {
        const response = await fetch('http://192.168.56.2:3001/generate-proof', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        proof.value = JSON.stringify(data, null, 2);
        proofGenerated.value = true


        isProcessing.value = false
    } catch (error) {
        console.error('Error:', error);
        isProcessing.value = false
        proofGenerated.value = false

    }
}

</script>

<template>
    <div>

        <Header />

        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 mt-9 ">

            <ConnectWallet v-if="!web3Store.isConnected" />

            <!-- Formulaire KYC -->
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

                    <div class="">
                        <div v-if="isProcessing"
                            class="bg-blue-100 border-l-4 border-primary-500 text-primary-700 p-4 text-xs" role="alert">
                            <p>Generating proof...</p>
                        </div>

                        <div v-if="proofGenerated"
                            class="bg-success-300 border-l-4 border-success-700 text-white p-4 text-xs" role="alert">
                            <p>Proof generated ✅</p>
                        </div>
                    </div>

                    <div v-if="currentStep === 1">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Personal Information</h3>
                        <div class="space-y-6">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Full
                                    Name</label>
                                <input type="text" id="full_name" v-model="formData.fullName"
                                    class="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="John Doe" required />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of
                                    Birth</label>
                                <input type="date" v-model="formData.dateOfBirth"
                                    class="border block w-full p-2.5 text-gray-900 rounded-md border-gray-500 focus:border-blue-500 focus:ring-blue-500">
                            </div>

                            <div class="mb-4">
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                <select v-model="formData.country"
                                    class="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required>
                                    <option value="">Select a country</option>
                                    <option value="AF">Afghanistan</option>
                                    <option value="BE">Belgium</option>
                                    <option value="BJ">Benin</option>
                                    <option value="BR">Brazil</option>
                                    <option value="CA">Canada</option>
                                    <option value="CN">China</option>
                                    <option value="FR">France</option>
                                    <option value="DE">Germany</option>
                                    <option value="GH">Ghana</option>
                                    <option value="IN">India</option>
                                    <option value="IT">Italy</option>
                                    <option value="JP">Japan</option>
                                    <option value="KE">Kenya</option>
                                    <option value="NG">Nigeria</option>
                                    <option value="PT">Portugal</option>
                                    <option value="RU">Russia</option>
                                    <option value="SN">Senegal</option>
                                    <option value="ZA">South Africa</option>
                                    <option value="ES">Spain</option>
                                    <option value="TG">Togo</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="US">United States</option>
                                </select>
                            </div>

                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">ID
                                    Number</label>
                                <input type="text" id="idnumber" v-model="formData.idNumber"
                                    class="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="123456789" required />
                            </div>

                            <div v-if="proof" class="mb-4 bg-success-300 p-3 ">

                                <label for="message"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Generated
                                    Proof</label>
                                <textarea id="proof" rows="4" v-model="proof"
                                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>

                            </div>
                        </div>
                    </div>



                    <!-- Navigation buttons -->
                    <div class="mt-8 flex justify-between">

                        <button v-if="!isProcessing" @click=handleSubmit
                            class="bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-800 transition-all duration-150 ease-in-out">
                            Submit KYC
                        </button>

                        <button v-if="isProcessing"
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