<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item text-muted">Keuangan</li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Dashboard Pendapatan</li>
      </ol>
    </nav>

    <AdminFinanceRevenueSummary 
      :is-loading="isLoading"
      :selected-event-s-k="selectedEventSK"
      :events="mockEvents"
      :summary-data="summaryData"
      @update-event-s-k="handleEventChange"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({ 
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/admin');
  }
});

// STATE UTAMA
const isLoading = ref(false);
const selectedEventSK = ref('ALL');

const summaryData = ref({
  totalOmzet: 0,
  totalTiketPrice: 0,
  totalInfaq: 0,
  totalTicketsSold: 0
});

// MOCKUP API (Nanti lu ganti pake axios dari temen BE lu)
const mockEvents = ref([
  { SK: 'EVT#001', Title: 'Dauroh: Menggapai Kebahagiaan' },
  { SK: 'EVT#002', Title: 'Kajian Rutin Pemuda Hijrah' },
]);

const fetchSummary = (eventSK: string) => {
  isLoading.value = true;
  
  // Simulasi nembak API
  setTimeout(() => {
    if (eventSK === 'EVT#001') {
      summaryData.value = { totalOmzet: 12500000, totalTiketPrice: 10000000, totalInfaq: 2500000, totalTicketsSold: 200 };
    } else if (eventSK === 'EVT#002') {
      summaryData.value = { totalOmzet: 3100000, totalTiketPrice: 2500000, totalInfaq: 600000, totalTicketsSold: 50 };
    } else {
      summaryData.value = { totalOmzet: 15600000, totalTiketPrice: 12500000, totalInfaq: 3100000, totalTicketsSold: 250 };
    }
    isLoading.value = false;
  }, 600);
};

// Fungsi yang dipanggil dari Komponen pas dropdown diubah
const handleEventChange = (newSK: string) => {
  selectedEventSK.value = newSK;
  fetchSummary(newSK);
};

onMounted(() => {
  fetchSummary(selectedEventSK.value);
});
</script>

<style scoped>
/* Style dipindahin ke komponen masing-masing biar bersih */
</style>