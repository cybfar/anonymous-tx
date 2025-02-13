<script setup lang="ts">
import { NuxtLink } from '#components';

</script>

<template>
    <div>
        <section class=" pt-5 pb-8 bg-gray-50 dark:bg-gray-900">
            <div class="container mx-auto px-4 xl:px-10">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- KYC Step -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div class="text-primary-600 mb-4">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2 dark:text-white">1. Zero-Knowledge KYC</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Complete your KYC verification while maintaining privacy. Our system uses advanced
                            zero-knowledge proofs to verify your identity without exposing personal data.
                        </p>
                    </div>

                    <!-- Whitelisting Step -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div class="text-primary-600 mb-4">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2 dark:text-white">2. Wallet Whitelisting</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Get your wallet addresses whitelisted after successful KYC verification. Add multiple
                            addresses under the same KYC proof for maximum flexibility.
                        </p>
                    </div>

                    <!-- Mixer Step -->
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div class="text-primary-600 mb-4">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2 dark:text-white">3. Private Transactions</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Use our compliant mixer to conduct private transactions. Only whitelisted addresses can
                            participate, ensuring both privacy and regulatory compliance.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="py-16 dark:bg-gray-800">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12 dark:text-white">
                    Key Features
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="text-center">
                        <div
                            class="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2 dark:text-white">Privacy First</h3>
                        <p class="text-gray-600 dark:text-gray-300">Zero-knowledge proofs ensure your data stays private
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2 dark:text-white">Regulatory Compliant</h3>
                        <p class="text-gray-600 dark:text-gray-300">KYC verification meets regulatory requirements</p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2 dark:text-white">Fast & Efficient</h3>
                        <p class="text-gray-600 dark:text-gray-300">Quick transaction processing and verification</p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2 dark:text-white">Multi-Address Support</h3>
                        <p class="text-gray-600 dark:text-gray-300">Link multiple addresses to one KYC</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-20 bg-primary-600">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold text-white mb-8">
                    Ready to Experience Private & Compliant Transactions?
                </h2>
                <div class="flex justify-center gap-4">
                    <NuxtLink to="/kyc"
                        class="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Start KYC
                    </NuxtLink>
                    <NuxtLink to="/whitelist"
                        class="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors">
                        Whitelist address
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>