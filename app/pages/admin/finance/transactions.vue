<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>

        <li class="breadcrumb-item txt-caption text-muted">Keuangan</li>
        <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Data Transaksi</li>
      </ol>
    </nav>

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