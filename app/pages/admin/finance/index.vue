<template>
  <div>
    
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Keuangan'}, {text: 'Dashboard Pendapatan'}]" />

    <AdminFinanceRevenueSummary 
      :is-loading="financeStore.loadingSummary"
      :summary-data="financeStore.summary"
    />

  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useFinanceStore } from '~/stores/finance';
import { useGlobalEventStore } from '~/stores/globalEvent';

useHead({
  title: 'Dashboard Pendapatan'
});
definePageMeta({ 
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/admin');
  }
});

const financeStore = useFinanceStore();
const globalStore = useGlobalEventStore();


await useAsyncData('finance-init', async () => {
  await financeStore.fetchSummary();
  return true;
});
watch(() => globalStore.activeEventSK, () => {
  financeStore.fetchSummary();
});
</script>