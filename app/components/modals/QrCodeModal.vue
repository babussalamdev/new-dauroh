<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-sm"> <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        
        <div class="modal-header bg-primary text-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h6 class="modal-title fw-bold mb-0">E-Ticket Peserta</h6>
            <small class="opacity-75 text-truncate d-block" style="max-width: 200px; font-size: 0.75rem;">
              {{ ticket?.event?.Title || ticket?.Title || 'Event' }}
            </small>
          </div>
          <button type="button" class="btn-close btn-close-white shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-4 text-center bg-light">
          
          <h5 class="fw-bold text-dark text-capitalize mb-1">{{ participant?.Name || participant?.name || 'Peserta' }}</h5>
          <div class="small text-muted font-monospace mb-4">
            ID: {{ String(ticket?.SK || '').slice(-6).toUpperCase() || 'N/A' }}
          </div>

          <div class="qr-frame p-3 bg-white d-inline-block rounded-4 shadow-sm border mb-4">
            <img :src="qrUrl" alt="QR Code" class="img-fluid" style="width: 220px; height: 220px; object-fit: contain;">
          </div>

          <div class="alert alert-warning p-2 d-flex align-items-center justify-content-center gap-2 small mb-0 rounded-3">
            <i class="bi bi-brightness-high-fill"></i>
            <span>Terangkan layar HP Anda saat di-scan</span>
          </div>

        </div>

        <div class="modal-footer border-0 p-3 bg-white d-flex justify-content-center">
          <button class="btn btn-outline-primary w-100 rounded-pill fw-bold" @click="downloadQr" :disabled="isDownloading">
            <span v-if="isDownloading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-download me-2"></i> Simpan Tiket
          </button>
        </div>

      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// PROPS: Sekarang nerima data "participant" spesifik yang di-klik dari DetailModal
const props = defineProps<{
  show: boolean;
  ticket: any;
  participant: any; 
}>();

const emit = defineEmits(['close']);
const isDownloading = ref(false);

// Generate Link QR Code langsung dari data participant yang dikirim
const qrUrl = computed(() => {
  if (!props.participant) return '';
  const data = {
    trx: String(props.ticket?.SK || 'NEW'),
    name: props.participant.Name || props.participant.name,
    event: props.ticket?.event?.Title || props.ticket?.Title
  };
  const encodedData = encodeURIComponent(JSON.stringify(data));
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodedData}`;
});

const downloadQr = async () => {
  isDownloading.value = true;
  try {
    const name = String(props.participant?.Name || props.participant?.name || 'Peserta').replace(/\s+/g, '-');
    const response = await fetch(qrUrl.value);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `Tiket-${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Download QR Gagal:', error);
  } finally {
    isDownloading.value = false;
  }
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1070;
}
.qr-frame {
  border: 2px dashed #dee2e6 !important; /* Biar ada aksen tiket sobek */
}
</style>