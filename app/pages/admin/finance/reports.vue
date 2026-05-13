<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>
        <li class="breadcrumb-item txt-caption text-muted">Keuangan</li>
        <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Laporan & Export</li>
      </ol>
    </nav>

    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-5">
        
        <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-header bg-white py-3 border-bottom text-center">
            <h5 class="mb-0 txt-title text-dark">
              <i class="bi bi-file-earmark-arrow-down text-success me-2"></i>Export Laporan Keuangan
            </h5>
          </div>

          <div class="card-body p-4 text-center">
  
  <div class="alert alert-info rounded-3 border-0 bg-info bg-opacity-10 text-info-emphasis d-flex gap-3 mb-4 p-3 text-start">
    <i class="bi bi-info-circle-fill fs-5 mt-1"></i>
    <div>
      <h6 class="txt-body fw-bold mb-1">Informasi Laporan</h6>
      <p class="mb-0 txt-caption">Hanya mengekspor transaksi yang berstatus <strong>LUNAS</strong> untuk event yang sedang dipilih.</p>
    </div>
  </div>

  <div class="mb-4">
    <p class="text-secondary txt-caption mb-1">Event saat ini:</p>
    <h5 class="fw-bold text-dark">{{ activeEventTitle }}</h5>
  </div>

  <hr class="my-4 text-muted opacity-25">

  <div class="d-flex justify-content-center mt-2">
    <button type="button" 
            class="btn btn-success px-4 py-2 rounded-pill shadow-sm txt-body fw-bold w-auto" 
            @click="handleExportExcel" 
            :disabled="isLoadingExcel || !hasActiveEvent">
      <span v-if="isLoadingExcel" class="spinner-border spinner-border-sm me-2"></span>
      <i v-else class="bi bi-file-earmark-excel-fill me-2"></i> Export Excel
    </button>
  </div>

  <p v-if="!hasActiveEvent" class="text-danger txt-caption mt-3 mb-0">
    <i class="bi bi-exclamation-triangle-fill me-1"></i> Silakan pilih event di navigasi atas terlebih dahulu.
  </p>

</div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import { useAlert } from '~/utils/swal';
// 🟢 Import store global event
import { useGlobalEventStore } from '~/stores/globalEvent';

useHead({
  title: 'Laporan & Export'
});

definePageMeta({ layout: 'admin' });

const { alert: swalAlert } = useAlert();
const globalStore = useGlobalEventStore();

const isLoadingExcel = ref(false);
const isLoadingPDF = ref(false);
const hasActiveEvent = computed(() => globalStore.activeEventSK !== 'ALL' && globalStore.activeEventSK !== '');
const activeEventTitle = computed(() => {
  if (!globalStore.activeEventSK) return 'Belum Ada Event Terpilih';
  return globalStore.activeEvent?.Title || 'Judul Event Tidak Tersedia'; 
});

// FUNGSI EXPORT EXCEL
const handleExportExcel = () => {
  if (!hasActiveEvent.value && globalStore.activeEventSK !== 'ALL') return;

  isLoadingExcel.value = true;
  
  // 🟢 Nanti di sini tinggal tembak API:
  // await $apiBase.get(`/export-excel?sk=${globalStore.activeEventSK}`);

  setTimeout(() => {
    isLoadingExcel.value = false;
    swalAlert(
      'Berhasil', 
      'File Rekap_Keuangan.xlsx berhasil di-download!', 
      'success'
    );
  }, 1500);
};

// FUNGSI EXPORT PDF
const handleExportPDF = () => {
  if (!hasActiveEvent.value && globalStore.activeEventSK !== 'ALL') return;

  isLoadingPDF.value = true;
  
  // 🟢 Nanti di sini tinggal tembak API:
  // await $apiBase.get(`/export-pdf?sk=${globalStore.activeEventSK}`);

  setTimeout(() => {
    isLoadingPDF.value = false;
    swalAlert(
      'Berhasil', 
      'File Rekap_Keuangan.pdf berhasil di-download!', 
      'success'
    );
  }, 1500);
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>