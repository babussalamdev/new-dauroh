<template>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <div class="checkout-container">

        <CheckoutSelectMethod v-if="checkoutStore.currentStep === 'select'" />

        <CheckoutSummary v-else-if="checkoutStore.currentStep === 'summary'" />

        <CheckoutInstructions v-else-if="checkoutStore.currentStep === 'instructions'" />

        <CheckoutSuccess v-else-if="checkoutStore.currentStep === 'success'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Import Store
import { useCheckoutStore } from '~/stores/checkout'

// 2. Setup Layout
definePageMeta({
  layout: 'checkout',
  // Pastikan middleware auth aktif di sini
  middleware: (_to, _from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/auth/login');
  }
});

const checkoutStore = useCheckoutStore()
</script>