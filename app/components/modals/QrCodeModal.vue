<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        
        <div class="modal-header text-white border-0 py-3 px-4 d-flex justify-content-between align-items-center" 
             :style="{ backgroundColor: '#' + qrColor }">
          <div>
            <h6 class="modal-title fw-bold mb-0">E-Ticket Peserta</h6>
            <small class="opacity-75 text-truncate d-block" style="max-width: 180px; font-size: 0.7rem;">
              {{ ticket?.event?.Title || ticket?.Title || 'Event Dauroh' }}
            </small>
          </div>
          <button type="button" class="btn-close btn-close-white shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-4 text-center bg-light">
          
          <h5 class="fw-bold text-dark text-capitalize mb-1">
            {{ participantName }}
          </h5>
          <div class="small text-muted font-monospace mb-4">
            SK: <span class="fw-bold">{{ participantSK }}</span>
          </div>

          <div class="qr-frame p-2 bg-white d-inline-block rounded-4 shadow-sm mb-4" 
               :style="{ border: '3px solid #' + qrColor }">
            <img :src="qrUrl" alt="QR Code" class="img-fluid rounded-3" style="width: 220px; height: 220px; object-fit: contain;">
          </div>

          <div class="alert alert-warning p-2 d-flex align-items-center justify-content-center gap-2 small mb-0 rounded-3">
            <i class="bi bi-brightness-high-fill"></i>
            <span>Terangkan layar HP Anda saat di-scan</span>
          </div>

        </div>

        <div class="modal-footer border-0 p-3 bg-white d-flex justify-content-center">
          <button class="btn w-100 rounded-pill fw-bold text-white shadow-sm" 
                  :style="{ backgroundColor: '#' + qrColor }" 
                  @click="downloadQr" 
                  :disabled="isDownloading">
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

const props = defineProps<{
  show: boolean;
  ticket: any;
  participant: any; 
}>();

const emit = defineEmits(['close']);
const isDownloading = ref(false);

const participantName = computed(() => props.participant?.Name || props.participant?.name || 'Peserta');

const participantPK = computed(() => {
  return props.participant?.PK || props.participant?.pk || props.ticket?.SK || props.ticket?.sk || 'N/A';
});

const participantSK = computed(() => {
  return props.participant?.SK || props.participant?.sk || 'N/A';
});

const participantGender = computed(() => String(props.participant?.Gender || props.participant?.gender || '').toLowerCase());

const qrColor = computed(() => {
  if (participantGender.value.includes('akhwat') || participantGender.value.includes('perempuan')) {
    return 'd63384'; // Pink/Fuchsia
  }
  return '0d6efd'; // Biru (Ikhwan)
});

// 🟢 QR CODE DIKEMBALIKAN KE WARNA HITAM DEFAULT
const qrUrl = computed(() => {
  if (!props.participant && !props.ticket) return '';
  
  const payload = {
    pk: participantPK.value,
    sk: participantSK.value
  };
  
  const encodedData = encodeURIComponent(JSON.stringify(payload));
  // Parameter &color dihapus biar warnanya balik jadi hitam murni
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodedData}&margin=10`;
});

const downloadQr = async () => {
  isDownloading.value = true;
  try {
    const name = participantName.value;
    const safeFileName = name.replace(/\s+/g, '-');

    const response = await fetch(qrUrl.value);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = objectUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Browser tidak mendukung Canvas");

    const padding = 40;
    const footerHeight = 120; 
    
    canvas.width = img.width + (padding * 2);
    canvas.height = img.height + padding + footerHeight;

    // Background Putih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 🟢 GAMBAR BINGKAI TIPIS DI KANVAS SESUAI GENDER
    ctx.strokeStyle = "#" + qrColor.value;
    ctx.lineWidth = 4;
    ctx.strokeRect(padding, padding, img.width, img.height);

    // Tempel QR Hitam
    ctx.drawImage(img, padding, padding);

    // Judul Event (Abu-abu)
    const eventTitle = props.ticket?.event?.Title || props.ticket?.Title || 'Event Dauroh';
    ctx.fillStyle = "#6c757d";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(eventTitle, canvas.width / 2, img.height + padding + 30);

    // Nama Peserta (Hitam Bold)
    ctx.fillStyle = "#000000";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(name.toUpperCase(), canvas.width / 2, img.height + padding + 70);

    // Kode SK (Warna sesuai gender)
    ctx.fillStyle = "#" + qrColor.value;
    ctx.font = "bold 20px monospace";
    ctx.fillText(`ID: ${participantSK.value}`, canvas.width / 2, img.height + padding + 105);

    const finalImageUrl = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = finalImageUrl;
    link.download = `Tiket-${safeFileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Download Gagal:', error);
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
  transition: all 0.3s ease;
}
</style>