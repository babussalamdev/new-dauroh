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
          
          <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
              <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
                <h5 class="mb-0 txt-title fw-bold text-dark text-truncate w-100">
                  <i class="bi bi-file-earmark-arrow-down text-success me-2"></i>Export Laporan
                </h5>
                
                <div v-if="globalStore.activeEventSK" class="text-primary fw-medium txt-caption text-truncate w-100">
                  {{ globalStore.activeEvent?.Title }}
                </div>
                <div v-else class="text-muted txt-caption text-truncate w-100">
                  Belum Ada Event Terpilih
                </div>
              </div>
            </div>
          </div>

          <div class="card-body p-0">
            
            <div v-if="!globalStore.activeEventSK" class="text-center py-5 text-muted bg-light px-3 rounded-bottom-4">
              <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
              <p class="mb-0 fw-medium txt-body">Silakan pilih <strong>Event</strong> terlebih dahulu di halaman Dashboard.</p>
              <NuxtLink to="/admin" class="btn btn-sm btn-primary mt-3 rounded-pill px-4 shadow-sm txt-caption">Ke Dashboard</NuxtLink>
            </div>

            <div v-else class="p-4 text-center">
              
              <div class="alert alert-info rounded-3 border-0 bg-info bg-opacity-10 text-info-emphasis d-flex gap-3 mb-4 p-3 text-start">
                <i class="bi bi-info-circle-fill fs-5 mt-1"></i>
                <div>
                  <h6 class="txt-body fw-bold mb-1">Informasi Laporan</h6>
                  <p class="mb-0 txt-caption">Hanya mengekspor transaksi yang berstatus <strong>LUNAS</strong> untuk event yang sedang dipilih.</p>
                </div>
              </div>

              <hr class="my-4 text-muted opacity-25">

              <div class="d-flex justify-content-center mt-2 pb-2">
                <button type="button" 
                        class="btn btn-success px-4 py-2 rounded-pill shadow-sm txt-body fw-bold w-auto" 
                        @click="handleExportExcel" 
                        :disabled="isLoadingExcel">
                  <span v-if="isLoadingExcel" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-file-earmark-excel-fill me-2"></i> Export Excel
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAlert } from '~/utils/swal';
import { useGlobalEventStore } from '~/stores/globalEvent';

useHead({
  title: 'Laporan & Export'
});

definePageMeta({ layout: 'admin' });

const { alert: swalAlert } = useAlert();
const globalStore = useGlobalEventStore();

const isLoadingExcel = ref(false);

// FUNGSI EXPORT EXCEL
const handleExportExcel = () => {
  if (!globalStore.activeEventSK) return;

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

</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>