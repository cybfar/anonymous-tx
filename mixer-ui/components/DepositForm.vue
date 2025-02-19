<script setup>

import { saveAs } from 'file-saver'

const web3Store = useWeb3Store()
const isProcessing = ref(false)
const depositNote = ref('')
const commitment = ref('')
const note = ref('')

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

const emit = defineEmits(['depositDone'])

const handleDeposit = async () => {
  isProcessing.value = true

  if (props.poolAmount == '' || props.selectedPool == '') {
    console.error("Select a deposit amount");
    web3Store.showNotification('error', 'Select a deposit amount')
    isProcessing.value = false
    return

  }

  try {
    const result = await web3Store.deposit(props.poolAmount, commitment.value)
    if (result.success) {
      console.log(result);

      note.value = result.note

      const blob = new Blob([note.value], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "phantom-eth-deposit-note." + Date.now() + "." + props.selectedPool + ".txt");
      depositNote.value = note.value

      emit('depositDone')
    }

  } catch (error) {
    console.error('Deposit error:', error)

  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="p-6 bg-gray-700 rounded-xl">
    <h3 class="text-lg font-medium text-white mb-4">Deposit ETH</h3>

    <!-- Note Box -->
    <div class="mb-6 p-4 bg-info-700 rounded-lg">
      <p class="text-sm text-gray-300">
        You will receive a note after deposit. Save it - you'll need it to withdraw your funds.
      </p>
    </div>

    <Notification />

    <!-- Deposit Form -->
    <form @submit.prevent="handleDeposit">
      <!-- Selected Amount Display -->
      <div class="mb-4 mt-3">
        <label class="block text-gray-300 text-sm font-medium mb-2">
          Amount to Deposit
        </label>
        <div class="p-3 bg-gray-800 rounded-lg text-white">
          {{ selectedPool || 'Select an amount' }}
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isProcessing" :class="[
        'w-full py-3 px-4 rounded-lg font-medium transition-all',
        !isProcessing
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
      ]">
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Deposit</span>
      </button>
    </form>

    <!-- After Deposit Note Display -->
    <div v-if="depositNote" class="mt-6 p-4 bg-blue-900/50 rounded-lg">
      <p class="text-sm text-white font-medium mb-2">Your Note (Save this!):</p>
      <textarea readonly :value="depositNote" rows="3" class="w-full p-2 bg-gray-800 rounded text-sm text-gray-300" />
    </div>
  </div>
</template>