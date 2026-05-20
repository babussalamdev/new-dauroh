<template>
  <div class="text-center py-5 animate-fade-in">
    
    <div class="mb-4 text-success bounce-animation">
      <i class="bi bi-check-circle-fill display-1"></i>
    </div>

    <h2 class="txt-title fw-bold mb-2 text-dark">Pembayaran Berhasil!</h2>
    
    <p class="text-muted txt-body mb-4">
      Jazakumullah Khairan. Pendaftaran event <br>
      <strong class="text-primary fw-bold">{{ store.event?.Title }}</strong> telah terkonfirmasi.
    </p>

    <div class="card bg-light border-0 rounded-4 p-3 mb-4 mx-auto shadow-sm" style="max-width: 400px;">
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <span class="text-muted txt-caption">Kode Booking</span>
        <span class="fw-bold font-monospace text-dark txt-body">{{ store.activeEventSK }}</span>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted txt-caption">Total Peserta</span>
        <span class="fw-bold text-dark txt-body">{{ store.participants.length }} Orang</span>
      </div>
    </div>

    <div class="d-grid gap-2 col-md-8 mx-auto" style="max-width: 350px;">

      <button class="btn btn-primary rounded-pill py-2 fw-bold shadow-sm txt-body" @click="showQr">
        <i class="bi bi-qr-code-scan me-2"></i> Lihat Tiket & QR Code
      </button>

      <button class="btn btn-outline-secondary rounded-pill py-2 fw-bold txt-body" @click="triggerDownload">
        <i class="bi bi-download me-2"></i> Download Kuitansi
      </button>

      <button class="btn btn-link text-decoration-none text-muted mt-2 fw-bold txt-body" @click="toDashboard">
        Kembali ke Dashboard
      </button>
    </div>

    <ModalsQrCodeModal v-if="showQrModal" :show="showQrModal" :ticket="ticketData" :participant="store.participants[0]" @close="showQrModal = false" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { useRouter } from 'vue-router';
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import bgReceiptImage from '~/assets/img/Bg-Receipt.png';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
// Nanti import ReceiptPayment disini pas udah dibuat

const store = useCheckoutStore();
const router = useRouter();
const showQrModal = ref(false);

onMounted(async () => {
  if (!store.event || !store.participants.length) {
    if (store.transactionDetails?.event_sk) {
       await store.checkExistingTransaction(store.transactionDetails.event_sk);
    } else {
       router.replace('/dashboard');
    }
  }
});
const ticketData = computed(() => ({
  event: store.event,
  participants: store.participants,
  SK: store.activeEventSK
}));

const showQr = () => {
  showQrModal.value = true;
};

const triggerDownload = async () => {
  if (!store.transactionDetails) {
     alert("Data transaksi tidak ditemukan. Silakan kembali ke riwayat.");
     return;
  }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 🟢 2. PAKE VARIABEL HASIL IMPORT DI DALAM FETCH
  const imgData = await fetch(bgReceiptImage).then(r => r.blob()).then(blob => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  });

  // 2. Gambar Background
  doc.addImage(imgData as string, 'PNG', 0, 0, 210, 297); // A4 size

  // 3. Masukin Teks (Koordinat X, Y)
  doc.setFontSize(16);
  doc.text("BUKTI PEMBAYARAN", 105, 40, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`ID Transaksi : ${store.transactionDetails?.id}`, 20, 60);
  doc.text(`Tanggal      : ${dayjs.unix(store.transactionDetails?.created_at).format('DD MMM YYYY HH:mm')}`, 20, 70);
  doc.text(`Event        : ${store.event?.Title}`, 20, 80);
  doc.text(`Total Bayar  : ${formatCurrency(Number(store.transactionDetails?.amount || 0))}`, 20, 90);
  doc.text("Status       : LUNAS", 20, 100);

  // 4. Download
  doc.save(`Bukti Payment_${store.event?.Title}.pdf`);
};

const toDashboard = () => {
  store.clearCheckout();
  router.push('/dashboard');
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bounce-animation {
  animation: bounce 2s infinite;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
  }
}
</style>