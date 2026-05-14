<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin/events" class="text-decoration-none txt-caption text-muted">Manajemen Event</NuxtLink></li>
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Template Sertifikat</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
      <div class="card-header bg-white p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h5 class="mb-0 fw-bold text-dark txt-title">Upload Template Sertifikat</h5>
          <p class="txt-caption text-muted mt-1 mb-0">Event: <span class="fw-bold text-primary">{{ globalStore.activeEvent?.Title || 'Memuat...' }}</span></p>
        </div>
      </div>

      <div class="card-body p-4 p-md-5">
        <div class="row g-4 g-xl-5 align-items-start">
          
          <div class="col-12 col-lg-8">
            <AdminCertificateCanvasArea />
          </div>

          <div class="col-12 col-lg-4">
            <AdminCertificateSettingPanel />
          </div>

        </div>
      </div>

      <div class="card-footer bg-light p-4 border-top d-flex justify-content-end gap-2">
        <button 
          class="btn btn-primary rounded-pill px-5 fw-bold shadow-sm py-2 txt-body transition-hover" 
          :disabled="!certStore.base64Image || certStore.imageErrors.length > 0"
          @click="handleSimpan"
        >
          <i class="bi bi-cloud-arrow-up-fill me-2"></i> Simpan Konfigurasi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2'; 
import { useAlert } from '~/utils/swal';
import { useGlobalEventStore } from '~/stores/globalEvent';
import { useCertificateStore } from '~/stores/certificate'; // 🟢 Import Store Baru

definePageMeta({ layout: 'admin' });
useHead({ title: 'Template Sertifikat' });

const globalStore = useGlobalEventStore();
const certStore = useCertificateStore(); // 🟢 Inisialisasi Store
const { alert: swalAlert } = useAlert();

// 🟢 Fungsi tombol simpan sekarang cuma nyuruh Store buat kerja
const handleSimpan = async () => {
  if (!certStore.base64Image || certStore.imageErrors.length > 0) return;

  Swal.fire({
    title: 'Menyimpan...',
    html: 'Sedang mengirim konfigurasi ke server.',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    // Panggil fungsi API yang ada di Store
    await certStore.simpanKonfigurasi(globalStore.activeEventSK || 'event_dummy_123');
    
    Swal.fire({
      title: 'Sukses!',
      text: 'Data berhasil disimpan (Mock API). Silakan test generate PDF.',
      icon: 'success',
      confirmButtonText: 'Test Halaman PDF',
    }).then((result) => {
      if (result.isConfirmed) {
        window.open('/test-pdf', '_blank'); 
      }
    });

  } catch (error) {
    Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error');
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
.transition-hover { transition: all 0.2s ease-in-out; }
.transition-hover:hover { transform: translateY(-2px); }
</style>