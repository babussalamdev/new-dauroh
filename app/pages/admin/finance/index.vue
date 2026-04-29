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
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Dashboard Pendapatan</li>
      </ol>
    </nav>

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