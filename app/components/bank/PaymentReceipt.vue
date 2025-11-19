<template>
  <div class="receipt-wrapper">
    <div id="invoice-content" class="invoice-page mx-auto bg-white">
      <div class="container px-5 py-4">
        
        <div class="text-center mb-4">
          <img width="120" src="~/assets/img/Logo-Mahad.png" alt="Logo" class="mb-2">
          <h2 class="fw-bold text-dark" style="font-family: sans-serif;">Yayasan Babussalam</h2>
          <p class="text-muted small">Bukti Pembayaran Pendaftaran Dauroh</p>
        </div>

        <hr class="border-2 my-4">

        <div class="text-center mb-5">
          <p class="text-secondary mb-1">Total Pembayaran</p>
          <h1 class="fw-bold text-primary" style="font-size: 42px;">
            {{ formatCurrency(displayData.amount) }}
          </h1>
          <span class="badge bg-success fs-6 px-3 py-2 rounded-pill mt-2">LUNAS / SUCCESS</span>
        </div>

        <div class="card border-0 bg-light rounded-4 p-4">
          <div class="row mb-3">
            <div class="col-6 text-secondary">Metode Pembayaran</div>
            <div class="col-6 text-end fw-bold">{{ displayData.paymentMethod }}</div>
          </div>
          <div class="row mb-3">
            <div class="col-6 text-secondary">Nomor VA / Ref</div>
            <div class="col-6 text-end fw-bold">{{ displayData.vaNumber }}</div>
          </div>
          <div class="row mb-3">
            <div class="col-6 text-secondary">Waktu Pembayaran</div>
            <div class="col-6 text-end fw-bold">{{ displayData.date }}</div>
          </div>
          <div class="row">
             <div class="col-6 text-secondary">Peserta</div>
             <div class="col-6 text-end fw-bold">{{ displayData.participantCount }} Orang</div>
          </div>
        </div>

        <div class="mt-5 text-center">
          <p class="text-secondary small">
            Terima kasih atas pembayaran Anda.<br>
            Mohon simpan bukti ini sebagai referensi yang sah.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';

const store = useCheckoutStore();

// Terima Props 'customData' ---
const props = defineProps({
  customData: {
    type: Object,
    default: null
  }
});

// Jika ada customData (dari Dashboard), pakai itu. Jika tidak, pakai dari Store (saat checkout).
const displayData = computed(() => {
  if (props.customData) {
    return props.customData;
  }
  return {
    amount: store.transactionDetails?.amount || 0,
    paymentMethod: store.transactionDetails?.paymentMethod || '-',
    vaNumber: store.transactionDetails?.vaNumber || '-',
    date: new Date().toLocaleString('id-ID'),
    participantCount: store.participants.length || 1
  };
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

const downloadPdf = async () => {
  if (process.client) {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('invoice-content');
      
      const opt = {
        margin:       0,
        filename:     `Bukti-Bayar-${displayData.value.vaNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error("Gagal download PDF:", error);
    }
  }
};

defineExpose({
  downloadPdf
});
</script>

<style scoped>
.receipt-wrapper {
  position: absolute;
  top: -9999px;
  left: -9999px;
  visibility: hidden; 
}

.invoice-page {
  width: 210mm;
  min-height: 297mm;
  padding: 20px;
  font-family: 'Helvetica', 'Arial', sans-serif;
  background: #fff;
}
</style>