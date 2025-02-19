<script setup>

const web3Store = useWeb3Store()
const isProcessing = ref(false)
const depositNote = ref('')
const withdrawalAddress = ref('')
const withdrawalSuccess = ref(false)
const withdrawalSuccessMessage = ref('')
const fees = ref(0)

const emit = defineEmits(['WithdrawalDone'])

const props = defineProps({
  selectedPool: {
    type: String,
    required: true
  },
  poolAmount: {
    type: Number,
    required: true
  }
})

const handleWithdrawal = async () => {
  isProcessing.value = true
  withdrawalSuccess.value = false
  withdrawalSuccessMessage.value = ''

  if (props.poolAmount == '' || props.selectedPool == '' || depositNote.value == '' || withdrawalAddress.value == '') {
    console.error("Please select a withdrawal amount, paste your note and your withdrawal address.");
    web3Store.showNotification('error', 'Please select a withdrawal amount, paste your note and your withdrawal address.')
    isProcessing.value = false

    return
  }

  try {
    const result = await web3Store.withdraw(props.poolAmount, props.selectedPool, depositNote.value, withdrawalAddress.value)
    if (result.success) {
      withdrawalSuccess.value = true
      withdrawalSuccessMessage.value = result.message
      depositNote.value = ''
      withdrawalAddress.value = ''
      emit('WithdrawalDone')
    }

  } catch (error) {
    console.error('Withdrawal error:', error)

  } finally {
    isProcessing.value = false
  }

}

function updateFees(amount) {
  fees.value = amount * 0.05 + " ETH"
}

watch(() => props.poolAmount, (newVal, oldVal) => {
  updateFees(newVal)
});

onMounted(() => {
  updateFees(props.poolAmount)
})

</script>

<template>
  <div class="p-6 bg-gray-700 rounded-xl">
    <h3 class="text-lg font-medium text-white mb-4">Withdraw ETH</h3>

    <!-- Note Box -->
    <div class="mb-6 p-4 bg-info-800 rounded-lg">
      <p class="text-sm text-gray-300">
        Paste your deposit note in the form below to withdraw your funds
      </p>
    </div>

    <Notification />

    <div v-if="withdrawalSuccess" class="mb-6 p-4 bg-success-700 rounded-lg">
      <p class="text-sm text-gray-300">
        {{ withdrawalSuccessMessage }}
      </p>
    </div>

    <!-- Deposit Form -->
    <form @submit.prevent="handleWithdrawal">
      <!-- Selected Amount Display -->
      <div class="mb-4 mt-3">
        <label class="block text-gray-300 text-sm font-medium mb-2">
          Amount to Withdraw
        </label>
        <div class="p-3 bg-gray-800 rounded-lg text-white">
          {{ selectedPool || 'Select an amount' }}
        </div>
      </div>

      <div class="mb-4 mt-3">
        <label class="block text-gray-300 text-sm font-medium mb-2">
          Fees (Gas fees + Relayer fees)
        </label>
        <div class="p-3 bg-gray-800 rounded-lg text-white">
          {{ fees }}
        </div>
      </div>

      <div class="mt-6 mb-2 rounded-lg">
        <p class="text-sm text-white font-medium mb-2">Your deposit Note</p>
        <textarea v-model="depositNote" rows="3" class="w-full p-2 bg-gray-800 rounded text-sm text-gray-300"
          placeholder="phantom-eth..." />
      </div>
      <div class="mt-6 mb-2 rounded-lg">
        <p class="text-sm text-white font-medium mb-2">Withdrawal address</p>
        <input type="text" v-model="withdrawalAddress" class="w-full p-2 bg-gray-800 rounded text-sm text-gray-300"
          placeholder="0x..." />
      </div>


      <button type="submit" :disabled="isProcessing" :class="[
        'w-full py-3 px-4 rounded-lg font-medium transition-all',
        !isProcessing
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
      ]">
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Withdraw</span>
      </button>
    </form>
  </div>
</template>