<template>
  <div class="card content-card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    
    <div class="p-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-white border-bottom gap-3">
      <div class="d-flex align-items-center gap-3 w-100">
        <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px;">
          <i class="bi bi-wallet2"></i>
        </div>
        <h6 class="mb-0 fw-bold txt-subtitle text-dark">Ringkasan Pendapatan</h6>
      </div>
      
      <div class="w-100 d-flex justify-content-md-end">
        <select class="form-select form-select-sm shadow-sm rounded-pill px-3 py-2 txt-body fw-bold" style="max-width: 380px; border-color: #198754;"
          v-model="localSelectedEvent" @change="emitChangeEvent">
          <option value="ALL">-- Semua Event --</option>
          <option v-for="event in events" :key="event.SK" :value="event.SK">
            {{ event.Title }}
          </option>
        </select>
      </div>
    </div>

    <div class="card-body p-3 bg-white">
      <CommonLoadingSpinner v-if="isLoading" class="my-5" />

      <div v-else>
        <div class="row g-2 mb-3">
          
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card border-0 rounded-4 h-100 inner-finance-card bg-light">
              <div class="card-body p-3 d-flex align-items-center">
                <div class="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-success flex-shrink-0" style="width: 40px; height: 40px;">
                  <i class="bi bi-cash-stack fs-5"></i>
                </div>
                <div>
                  <p class="mb-0 fw-bold txt-label text-muted">TOTAL PEMASUKAN</p>
                  <h5 class="mb-0 fw-bold text-dark mt-1 txt-title">{{ formatRupiah(summaryData.totalOmzet) }}</h5>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card border-0 rounded-4 h-100 inner-finance-card bg-light">
              <div class="card-body p-3 d-flex align-items-center">
                <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-primary flex-shrink-0" style="width: 40px; height: 40px;">
                  <i class="bi bi-ticket-perforated fs-5"></i>
                </div>
                <div>
                  <p class="mb-0 fw-bold txt-label text-muted">PENDAPATAN TIKET</p>
                  <h5 class="mb-0 fw-bold text-dark mt-1 txt-title">{{ formatRupiah(summaryData.totalTiketPrice) }}</h5>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card border-0 rounded-4 h-100 inner-finance-card bg-light">
              <div class="card-body p-3 d-flex align-items-center">
                <div class="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-info flex-shrink-0" style="width: 40px; height: 40px;">
                  <i class="bi bi-heart-fill fs-5"></i>
                </div>
                <div>
                  <p class="mb-0 fw-bold txt-label text-muted">TOTAL INFAQ DONASI</p>
                  <h5 class="mb-0 fw-bold text-dark mt-1 txt-title">{{ formatRupiah(summaryData.totalInfaq) }}</h5>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card border-0 rounded-4 h-100 inner-finance-card bg-light">
              <div class="card-body p-3 d-flex align-items-center">
                <div class="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 text-warning flex-shrink-0" style="width: 40px; height: 40px;">
                  <i class="bi bi-people-fill fs-5"></i>
                </div>
                <div>
                  <p class="mb-0 fw-bold txt-label text-muted">TIKET LUNAS</p>
                  <h5 class="mb-0 fw-bold text-dark mt-1 txt-title">{{ summaryData.totalTicketsSold }} <span class="fw-bold text-muted txt-caption">Peserta</span></h5>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="card border-0 rounded-4 bg-light mt-4">
          <div class="card-body d-flex align-items-start align-items-sm-center gap-3 p-3 px-4">
            <i class="bi bi-info-circle-fill text-primary fs-4"></i>
            <div>
              <h6 class="fw-bold mb-1 txt-body text-dark">Catatan Pendapatan</h6>
              <p class="text-muted mb-0 txt-caption">Angka di atas hanya menghitung transaksi dengan status <strong>LUNAS (Berhasil)</strong>. Transaksi yang masih <i>pending</i> atau dibatalkan tidak dimasukkan ke dalam perhitungan ini.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isLoading: boolean;
  selectedEventSK: string;
  events: any[];
  summaryData: {
    totalOmzet: number;
    totalTiketPrice: number;
    totalInfaq: number;
    totalTicketsSold: number;
  }
}>();

const emit = defineEmits(['updateEventSK']);

// Bikin local state buat nampung model dari dropdown
const localSelectedEvent = ref(props.selectedEventSK);

// Kalau props dari parent berubah, update local state
watch(() => props.selectedEventSK, (newVal) => {
  localSelectedEvent.value = newVal;
});

// Ngirim tau ke Parent (index.vue) kalau dropdown di-klik
const emitChangeEvent = () => {
  emit('updateEventSK', localSelectedEvent.value);
};

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(angka || 0);
};
</script>

<style scoped>
.inner-finance-card {
  background-color: #f8f9fa !important;
  border: 1px solid #f1f3f5 !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

.inner-finance-card:hover {
  background-color: #ffffff !important;
  border-color: #dee2e6 !important;
  transform: translateY(-2px);
}
</style>