<template>
  <div>
    
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Keuangan'}, {text: 'Laporan & Export'}]" />

    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-5">
        
        <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
          
          <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
              <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
                <h6 class="mb-0 fw-bold txt-subtitle text-dark text-truncate w-100">Export Laporan</h6>
                
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
import { useNuxtApp } from '#app';
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
const handleExportExcel = async () => {
  if (!globalStore.activeEventSK) return;

  isLoadingExcel.value = true;
  const { $apiBase } = useNuxtApp();
  
  try {
    const response = await $apiBase.get('/get-finance', {
      params: { 
        type: 'export', 
        sk: globalStore.activeEventSK 
      }
    });

    const result = response.data?.data || response.data;

    // Pastiin data base64-nya beneran nyampe
    if (!result || !result.base64data) {
      throw new Error("Data laporan kosong atau tidak valid dari server.");
    }

    // Convert Base64 ke wujud File Binary (Blob)
    const base64Data = result.base64data;
    const fileName = result.filename || `Report_Keuangan_${globalStore.activeEventSK}.xlsx`;
    
    // Proses Decode native
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // file .xlsx
    const blob = new Blob([byteArray], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Trigger Download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    // Kasih notif sukses
    swalAlert(
      'Berhasil', 
      `File ${fileName} berhasil di-download!`, 
      'success'
    );

  } catch (error: any) {
    console.error("Gagal Export Excel:", error);
    swalAlert(
      'Gagal', 
      error.message || 'Terjadi kesalahan saat mengunduh laporan Excel.', 
      'error'
    );
  } finally {
    isLoadingExcel.value = false;
  }
};

</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>