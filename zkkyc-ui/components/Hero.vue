<script setup>
const web3Store = useWeb3Store();
</script>

<template>
    <div id="home" class="relative">
        <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden pt-32 blur-3xl sm:-top-80 sm:pt-40">
            <div
                class="relative left-[50%] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient">
            </div>
        </div>
        <div>
            <div class="relative pt-36 pb-10 ml-auto">
                <div class="lg:w-2/3 text-center mx-auto px-8">
                    <h1 class="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-6xl">
                        Secure KYC Verification with
                        <span class="text-primary-800 dark:text-primary-700">Zero Knowledge.</span>
                    </h1>
                    <p class="mt-8 text-gray-700 dark:text-gray-300">
                        Verify your identity while maintaining complete privacy. Our platform uses advanced
                        zero-knowledge proofs
                        to ensure your personal information remains confidential while meeting regulatory requirements.
                    </p>

                    <div class="mt-10 mx-2 flex flex-wrap justify-center gap-y-2 gap-x-2 items-center">
                        <a href="#" v-if="!web3Store.isConnected" @click="web3Store.connect"
                            class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-lg before:bg-primary-700 dark:before:bg-primary-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max hover:before:bg-primary-800">
                            <span
                                class="relative text-sm font-semibold text-white text-nowrap flex items-center content-center gap-x-2">
                                Connect wallet
                                <IconsMetamask class="text-xl" />
                            </span>
                        </a>

                        <NuxtLink to="kyc" v-if="web3Store.isConnected" @click="web3Store.connect"
                            class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-lg before:bg-primary-700 dark:before:bg-primary-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max hover:before:bg-primary-800">
                            <span
                                class="relative text-sm font-semibold text-white text-nowrap flex items-center content-center gap-x-2">
                                Verify KYC
                                <IconsIdentity class="text-xl" />
                            </span>
                        </NuxtLink>

                        <a href="#"
                            class="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-lg before:bg-black dark:before:bg-gray-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max hover:before:bg-gray-900">
                            <span
                                class="relative text-sm font-semibold text-white text-nowrap flex items-center content-center gap-x-2">
                                Learn more
                                <IconsGithub class="text-xl" />
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes gradient {
    0% {
        transform: rotate(30deg) translateX(-50%);
        opacity: 0.4;
    }

    50% {
        transform: rotate(45deg) translateX(-50%) scale(1.1);
        opacity: 0.6;
    }

    100% {
        transform: rotate(30deg) translateX(-50%);
        opacity: 0.4;
    }
}

.animate-gradient {
    animation: gradient 8s ease-in-out infinite;
    background-size: 200% 200%;
}
</style>