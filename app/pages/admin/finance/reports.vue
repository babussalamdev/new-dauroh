<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item text-muted">Keuangan</li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Laporan & Export</li>
      </ol>
    </nav>

    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-5">
        
        <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-header bg-white py-3 border-bottom text-center">
            <h6 class="mb-0 fw-bold"><i class="bi bi-file-earmark-arrow-down text-success me-2"></i>Export Laporan Keuangan</h6>
          </div>

          <div class="card-body p-4">
            
            <div class="alert alert-info rounded-3 border-0 bg-info bg-opacity-10 text-info-emphasis d-flex gap-3 mb-4 p-3">
              <i class="bi bi-info-circle-fill fs-5 mt-1"></i>
              <div>
                <h6 class="fw-bold mb-1" style="font-size: 0.85rem;">Informasi Laporan</h6>
                <p class="mb-0" style="font-size: 0.8rem;">Hanya mengekspor transaksi <strong>LUNAS</strong>. Pilih "Semua Event" untuk melihat rekap bulanan/tahunan secara global.</p>
              </div>
            </div>

            <form @submit.prevent="handleExportExcel">
              
              <div class="mb-3">
                <label class="form-label fw-bold text-dark small mb-1">Pilih Event</label>
                <select class="form-select bg-light border-0 shadow-none" v-model="form.eventSK" @change="resetDates" required>
                  <option value="ALL">Semua Event (Global)</option>
                  <option v-for="event in mockEvents" :key="event.SK" :value="event.SK">{{ event.Title }}</option>
                </select>
              </div>

              <div class="mb-4" v-if="form.eventSK === 'ALL'">
                <label class="form-label fw-bold text-dark small mb-1">Rentang Waktu Transaksi <span class="text-danger">*</span></label>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light border-end-0 text-muted">Dari</span>
                      <input type="date" class="form-control bg-light border-start-0 ps-0" v-model="form.startDate" required>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light border-end-0 text-muted">Sampai</span>
                      <input type="date" class="form-control bg-light border-start-0 ps-0" v-model="form.endDate" :min="form.startDate" required>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-4 text-muted opacity-25">

              <div class="d-flex flex-column flex-sm-row gap-2 justify-content-end mt-2">
                <button type="button" class="btn btn-outline-danger btn-sm fw-bold px-4 rounded-pill" @click="handleExportPDF" :disabled="isLoadingPDF">
                  <span v-if="isLoadingPDF" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-filetype-pdf me-1"></i> PDF
                </button>
                <button type="submit" class="btn btn-success btn-sm fw-bold px-4 rounded-pill shadow-sm" :disabled="isLoadingExcel">
                  <span v-if="isLoadingExcel" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-file-earmark-excel-fill me-1"></i> Download Excel
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Swal from 'sweetalert2';

definePageMeta({ layout: 'admin' });

// STATE FORM
const form = ref({
  eventSK: 'ALL',
  startDate: '',
  endDate: ''
});

const isLoadingExcel = ref(false);
const isLoadingPDF = ref(false);

// MOCK DATA EVENT
const mockEvents = ref([
  { SK: 'EVT#001', Title: 'Dauroh: Menggapai Kebahagiaan' },
  { SK: 'EVT#002', Title: 'Kajian Rutin Pemuda Hijrah' },
]);

// Reset tanggal kalo user milih event spesifik
const resetDates = () => {
  if (form.value.eventSK !== 'ALL') {
    form.value.startDate = '';
    form.value.endDate = '';
  }
};

// FUNGSI EXPORT EXCEL
const handleExportExcel = () => {
  isLoadingExcel.value = true;
  
  // Nanti kirim ini ke BE: console.log(form.value)
  
  setTimeout(() => {
    isLoadingExcel.value = false;
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'File Rekap_Keuangan.xlsx berhasil di-download! (Simulasi)',
      confirmButtonColor: '#198754'
    });
  }, 1500);
};

// FUNGSI EXPORT PDF
const handleExportPDF = () => {
  // Validasi manual buat tombol PDF (Hanya wajib isi jika 'Semua Event')
  if (form.value.eventSK === 'ALL' && (!form.value.startDate || !form.value.endDate)) {
    Swal.fire({
      icon: 'warning',
      title: 'Perhatian',
      text: 'Harap isi Tanggal Mulai dan Akhir untuk rekap Semua Event.',
      confirmButtonColor: '#198754'
    });
    return;
  }

  isLoadingPDF.value = true;
  
  setTimeout(() => {
    isLoadingPDF.value = false;
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'File Rekap_Keuangan.pdf berhasil di-download! (Simulasi)',
      confirmButtonColor: '#dc3545'
    });
  }, 1500);
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");

.form-control:focus, .form-select:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}
::-webkit-calendar-picker-indicator:hover {
  opacity: 0.8;
}
</style>