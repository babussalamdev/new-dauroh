<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item text-muted">Keuangan</li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Ringkasan Omzet</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-white py-3 border-bottom gap-3">
        <div class="d-flex align-items-center gap-3 w-100">
          <h5 class="mb-0 text-nowrap fw-bold"><i class="bi bi-graph-up-arrow text-success me-2"></i>Ringkasan Omzet</h5>
        </div>
        <div class="w-100 d-flex justify-content-md-end">
          <select class="form-select form-select-sm shadow-sm" style="max-width: 300px; border-color: #198754;"
            v-model="selectedEventSK" @change="fetchSummary">
            <option value="ALL">-- Semua Event --</option>
            <option v-for="event in mockEvents" :key="event.SK" :value="event.SK">
              {{ event.Title }}
            </option>
          </select>
        </div>
      </div>

      <div class="card-body p-4 bg-light">
        
        <CommonLoadingSpinner v-if="isLoading" class="my-5" />

        <div v-else>
          <div class="row g-3 mb-4">
            
            <div class="col-12 col-sm-6 col-xl-3">
             <div class="card border-0 shadow-sm rounded-4 h-100 bg-white border-start border-success border-4">
                <div class="card-body d-flex align-items-center p-3 p-xl-4">
                  <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-primary" style="width: 50px; height: 50px;">
                    <i class="bi bi-wallet2 fs-4"></i>
                  </div>
                  <div>
                    <p class="mb-0 small fw-medium text-muted">Total Keseluruhan</p>
                    <h4 class="mb-0 fw-bold">{{ formatRupiah(summaryData.totalOmzet) }}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 h-100 bg-white border-start border-primary border-4">
                <div class="card-body d-flex align-items-center p-3 p-xl-4">
                  <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-primary" style="width: 50px; height: 50px;">
                    <i class="bi bi-ticket-perforated fs-4"></i>
                  </div>
                  <div>
                    <p class="mb-0 small fw-medium text-muted">Pendapatan Tiket</p>
                    <h5 class="mb-0 fw-bold text-dark">{{ formatRupiah(summaryData.totalTiketPrice) }}</h5>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 h-100 bg-white border-start border-info border-4">
                <div class="card-body d-flex align-items-center p-3 p-xl-4">
                  <div class="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-info" style="width: 50px; height: 50px;">
                    <i class="bi bi-heart-fill fs-4"></i>
                  </div>
                  <div>
                    <p class="mb-0 small fw-medium text-muted">Total Infaq Donasi</p>
                    <h5 class="mb-0 fw-bold text-dark">{{ formatRupiah(summaryData.totalInfaq) }}</h5>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 h-100 bg-white border-start border-warning border-4">
                <div class="card-body d-flex align-items-center p-3 p-xl-4">
                  <div class="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-warning" style="width: 50px; height: 50px;">
                    <i class="bi bi-people-fill fs-4"></i>
                  </div>
                  <div>
                    <p class="mb-0 small fw-medium text-muted">Tiket Lunas</p>
                    <h5 class="mb-0 fw-bold text-dark">{{ summaryData.totalTicketsSold }} <span class="fs-6 fw-normal text-muted">Peserta</span></h5>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="card border-0 shadow-sm rounded-4 bg-white">
            <div class="card-body d-flex align-items-start align-items-sm-center gap-3 p-4">
              <i class="bi bi-info-circle-fill text-primary fs-3"></i>
              <div>
                <h6 class="fw-bold mb-1">Catatan Omzet</h6>
                <p class="text-muted small mb-0">Angka di atas hanya menghitung transaksi dengan status <strong>LUNAS</strong>. Transaksi yang masih pending atau gagal tidak dimasukkan ke dalam perhitungan Ringkasan Omzet dan Infaq.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({ 
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    // Opsional: Cek role disini kalo lu udah terapin di auth store
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/admin');
  }
});

const isLoading = ref(false);
const selectedEventSK = ref('ALL');

// DATA MOCKUP (Simulasi dari API BE)
const summaryData = ref({
  totalOmzet: 0,
  totalTiketPrice: 0,
  totalInfaq: 0,
  totalTicketsSold: 0
});

const mockEvents = ref([
  { SK: 'EVT#001', Title: 'Dauroh: Menggapai Kebahagiaan' },
  { SK: 'EVT#002', Title: 'Kajian Rutin Pemuda Hijrah' },
]);

// Fungsi Format Duit ke Rupiah otomatis
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

const fetchSummary = () => {
  isLoading.value = true;
  
  // Simulasi nembak API GET /api/finance/summary?eventSK=...
  setTimeout(() => {
    if (selectedEventSK.value === 'EVT#001') {
      summaryData.value = {
        totalOmzet: 12500000,
        totalTiketPrice: 10000000, // 200 tiket x 50k
        totalInfaq: 2500000,       // Hasil infaq orang-orang
        totalTicketsSold: 200
      };
    } else if (selectedEventSK.value === 'EVT#002') {
      summaryData.value = {
        totalOmzet: 3100000,
        totalTiketPrice: 2500000, // 50 tiket x 50k
        totalInfaq: 600000,
        totalTicketsSold: 50
      };
    } else {
      // JIKA "SEMUA EVENT" DIPILIH (Digabungin totalnya)
      summaryData.value = {
        totalOmzet: 15600000,
        totalTiketPrice: 12500000, 
        totalInfaq: 3100000,
        totalTicketsSold: 250
      };
    }
    isLoading.value = false;
  }, 600);
};

// Panggil data buat mode "Semua Event" pas pertama kali buka halaman
onMounted(() => {
  fetchSummary();
});
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>