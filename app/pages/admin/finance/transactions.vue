<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Keuangan'}, {text: 'Data Transaksi'}]" />

    <AdminFinanceTransactionList 
      :is-loading="financeStore.loadingTx"
      :transactions="financeStore.transactions"
    />

  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useFinanceStore } from '~/stores/finance';
import { useGlobalEventStore } from '~/stores/globalEvent';

definePageMeta({ 
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/admin');
  }
});

const financeStore = useFinanceStore();
const globalStore = useGlobalEventStore();

await useAsyncData('tx-init', async () => {
  await financeStore.fetchTransactions();
  return true;
});
watch(() => globalStore.activeEventSK, () => {
  financeStore.fetchTransactions();
});
</script>