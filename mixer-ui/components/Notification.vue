<script setup>
const web3Store = useWeb3Store()

onBeforeMount(() => {
    web3Store.clearNotification()
})

onUnmounted(() => {
    web3Store.clearNotification()
})
</script>

<template>
    <div>
        <div v-if="web3Store.notification.show" :class="{
            'bg-success-800 text-white': web3Store.notification.type === 'success',
            'bg-error-800 text-white': web3Store.notification.type === 'error'
        }" class="p-4 rounded text-xs gap-x-3 flex items-center">
            <IconsInfo class="text-xl" /> {{ web3Store.notification.message }}
        </div>

    </div>
</template>