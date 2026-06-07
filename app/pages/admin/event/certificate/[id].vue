<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Manajemen Event', to: '/admin/events'}, {text: 'Template Sertifikat'}]" />

    <div class="card content-card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
      <div class="card-header bg-white p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h5 class="mb-0 fw-bold text-dark txt-title">Sertifikat</h5>
          <p class="txt-caption text-muted mt-1 mb-0">Event: <span class="fw-bold text-primary">{{ certStore.certificateData?.Title || certStore.certificateData?.title || 'Memuat...' }}</span></p>
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
import { useCertificateStore } from '~/stores/certificate';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Template Sertifikat' });
const route = useRoute();
const certStore = useCertificateStore(); 
const { alert: swalAlert } = useAlert();

await useAsyncData('cert-init', async () => {
  const eventSK = route.params.id as string;
  if (eventSK) {
    await certStore.fetchCertificateData(eventSK);
  } else {
    certStore.base64Image = null; 
  }
  return true;
});

const handleSimpan = async () => {
  if (!certStore.base64Image || certStore.imageErrors.length > 0) return;
  Swal.fire({
    title: 'Menyimpan...',
    html: 'Sedang menyimpan konfigurasi desain ke server.',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const eventSK = route.params.id as string;
    if (!eventSK) throw new Error("Event SK tidak ditemukan di URL");

    const response = await certStore.saveConfigOnly(eventSK);
    
    if (response.ok) {
      swalAlert('Berhasil!', 'Konfigurasi desain berhasil disimpan.', 'success');
    } else {
      throw new Error("Gagal menyimpan dari API");
    }

  } catch (error) {
    swalAlert('Gagal', 'Terjadi kesalahan saat menyimpan konfigurasi.', 'error');
    console.error("Detail Error:", error);
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
.transition-hover { transition: all 0.2s ease-in-out; }
.transition-hover:hover { transform: translateY(-2px); }
</style>