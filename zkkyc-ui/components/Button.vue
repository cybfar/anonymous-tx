<script setup>

defineProps({
    url: {
        type: String,
        default: '#'
    },
    label: {
        type: String,
        default: 'Connect wallet'
    },
    buttonClasses: {
        type: String,
        default: 'relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary-500 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max'
    }
});
</script>


<template>
    <div>
        <a :href="url" :class="buttonClasses">
            <span class="relative text-base font-semibold text-white">{{ label }}</span>
        </a>
    </div>
</template>