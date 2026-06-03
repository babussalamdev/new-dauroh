<template>
  <div class="card content-card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    
    <div class="p-3 px-4 bg-white border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
      <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
        <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
          <h6 class="mb-0 fw-bold txt-subtitle text-dark text-truncate w-100">Ringkasan Pendapatan</h6>
          <span v-if="globalStore.activeEventSK" class="text-primary fw-medium txt-caption text-truncate w-100">
            {{ globalStore.activeEvent?.Title }}
          </span>
          <span v-else class="text-muted txt-caption text-truncate w-100">
            Belum Ada Event Terpilih
          </span>
        </div>
      </div>
    </div>

    <div v-if="!globalStore.activeEventSK" class="text-center py-5 text-muted bg-light px-3 rounded-bottom-4">
      <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
      <p class="mb-0 fw-medium txt-body">Silakan pilih <strong>Event</strong> terlebih dahulu di halaman Dashboard.</p>
      <NuxtLink to="/admin" class="btn btn-sm btn-primary mt-3 rounded-pill px-4 shadow-sm txt-caption">Ke Dashboard</NuxtLink>
    </div>

    <div v-else class="card-body p-3 bg-white">
      <CommonLoadingSpinner v-if="isLoading" class="my-5" />

      <div v-else>
        <div class="row g-2 mb-3">
          
          <div class="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="TOTAL PEMASUKAN" 
              :value="formatRupiah(summaryData.totalPendapatan)" 
              icon="bi-cash-stack"
              iconBgClass="bg-success bg-opacity-10 text-success" 
              class="inner-finance-card"
            />
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="PENDAPATAN TIKET" 
              :value="formatRupiah(summaryData.totalTiketPrice)" 
              icon="bi-ticket-perforated"
              iconBgClass="bg-primary bg-opacity-10 text-primary" 
              class="inner-finance-card"
            />
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="TOTAL INFAQ DONASI" 
              :value="formatRupiah(summaryData.totalInfaq)" 
              icon="bi-heart-fill"
              iconBgClass="bg-info bg-opacity-10 text-info" 
              class="inner-finance-card"
            />
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <StatCard 
              title="TIKET LUNAS" 
              :value="`${summaryData.totalTicketsSold} Peserta`" 
              icon="bi-people-fill"
              iconBgClass="bg-warning bg-opacity-10 text-warning" 
              class="inner-finance-card"
            />
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
import { useGlobalEventStore } from '~/stores/globalEvent';
import StatCard from '~/components/admin/dashboard/StatCard.vue';

const globalStore = useGlobalEventStore()
const props = defineProps<{
  isLoading: boolean;
  summaryData: {
    totalPendapatan: number; 
    totalTiketPrice: number;
    totalInfaq: number;
    totalTicketsSold: number;
  }
}>();

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(angka || 0);
};
</script>

<style scoped>
/* Class ini tetep gua pertahanin biar efek hover "mantul" ke atas tetep jalan */
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