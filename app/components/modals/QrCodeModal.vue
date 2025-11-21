<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">{{ ticket?.dauroh?.Title || 'E-Tiket' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        
        <div class="modal-body text-center pt-2">
          <p class="text-muted small mb-4">Tunjukkan QR Code ini kepada panitia saat registrasi ulang.</p>

          <div v-for="(person, index) in participantList" :key="index" class="mb-4 pb-3 border-bottom last:border-0">
            
            <div class="qr-container bg-light p-3 d-inline-block rounded mb-2">
              <img 
                :src="getQrUrl(person, 300)" 
                alt="QR Code" 
                class="img-fluid"
                style="width: 180px; height: 180px;"
              >
            </div>

            <div class="mb-3">
              <button 
                class="btn btn-sm btn-outline-primary rounded-pill px-3" 
                @click="downloadQr(person)"
                :disabled="isDownloading"
              >
                <i class="bi bi-download me-1"></i> Unduh QR
              </button>
            </div>

            <h5 class="fw-bold mb-1">{{ person.name }}</h5>
            <span class="badge bg-primary-subtle text-primary rounded-pill text-capitalize">
              {{ person.gender || 'Peserta' }}
            </span>
            <div class="mt-2 text-muted small font-monospace">
              {{ ticket?.id || 'TRX-NEW' }}-{{ index + 1 }}
            </div>

          </div>
        </div>

        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary w-100" @click="close">Tutup</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  show: boolean;
  ticket: any; 
}>();

const emit = defineEmits(['close']);
const isDownloading = ref(false);

const participantList = computed(() => {
  if (!props.ticket) return [];
  if (props.ticket.participants && Array.isArray(props.ticket.participants)) {
    return props.ticket.participants;
  }
  if (props.ticket.participant) {
    return [props.ticket.participant];
  }
  return [];
});

// Helper untuk generate URL
const getQrUrl = (person: any, size = 300) => {
  const data = {
    id: props.ticket?.id || 'NEW',
    event: props.ticket?.dauroh?.Title,
    name: person.name,
    email: person.email
  };
  const encodedData = encodeURIComponent(JSON.stringify(data));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
};

// [BARU] Fungsi Download
const downloadQr = async (person: any) => {
  isDownloading.value = true;
  try {
    // 1. Ambil URL gambar (minta ukuran lebih besar 500x500 biar bagus saat diunduh)
    const url = getQrUrl(person, 500);
    
    // 2. Fetch gambar sebagai Blob
    const response = await fetch(url);
    const blob = await response.blob();
    
    // 3. Buat URL objek sementara
    const objectUrl = URL.createObjectURL(blob);
    
    // 4. Buat elemen <a> virtual untuk trigger download
    const link = document.createElement('a');
    link.href = objectUrl;
    // Nama file: Tiket-NamaPeserta.png
    link.download = `Tiket-${person.name.replace(/\s+/g, '-')}.png`; 
    document.body.appendChild(link);
    link.click();
    
    // 5. Bersihkan
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Gagal mengunduh QR:', error);
    alert('Maaf, terjadi kesalahan saat mengunduh QR Code.');
  } finally {
    isDownloading.value = false;
  }
};

const close = () => emit('close');
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
}
.qr-container {
  border: 1px dashed #ccc;
}
.last\:border-0:last-child {
  border-bottom: none !important;
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}
</style>