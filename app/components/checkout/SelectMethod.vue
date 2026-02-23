<template>
  <div>

    <h5 class="mb-3">Silahkan pilih metode pembayaran berikut:</h5>

    <div class="row g-3">
      <div v-for="bank in banks" :key="bank.code" class="col-6 col-md-4">
        <label class="payment-method-label" :class="{ active: selectedMethod === bank.code }">
          <input type="radio" name="paymentMethod" v-model="selectedMethod" :value="bank.code" class="form-check-input">
          <img :src="bank.img" :alt="bank.code">
        </label>
      </div>
    </div>

    <div class="d-flex justify-content-between mt-4">

      <button class="btn btn-secondary" @click="handleBack">Kembali
      </button>

      <button class="btn btn-primary" @click="handleSelect" :disabled="!selectedMethod">
        Pilih
      </button>
    </div>
  </div>

  <a href="https://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
    <i class="bi bi-whatsapp me-1"></i> Whatsapp
  </a>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

// Import Gambar
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

const store = useCheckoutStore();
const router = useRouter();
const selectedMethod = ref<string | null>(null);

// Data Bank
const banks = [
  { code: 'BNI', img: bniLogo },
  { code: 'BRI', img: briLogo },
  { code: 'BSI', img: bsiLogo },
  { code: 'CIMB', img: cimbLogo },
  { code: 'DANAMON', img: danamonLogo },
  { code: 'MANDIRI', img: mandiriLogo },
  { code: 'PERMATA', img: permataLogo },
  { code: 'QRIS', img: qrisLogo },
];

onMounted(() => {
  // Cek validasi peserta
  if (!store.participants || store.participants.length === 0) {
    router.replace('/');
  }
  selectedMethod.value = store.paymentMethod;
});
const handleBack = () => {
  router.back();
};

const handleSelect = () => {
  if (selectedMethod.value) {
    store.setPaymentMethod(selectedMethod.value);
    store.setStep('summary');
  }
};

// --- LOGIC GUARD (REVISI) ---
onBeforeRouteLeave((to, from, next) => {
  // 1. Kalau pindah ke Dashboard (Selesai), biarin lewat
  if (to.path === '/dashboard') {
    next();
    return;
  }

  // 2. Kalau cuma ganti Step (Select -> Summary) di halaman yang sama, biarin lewat
  if (to.path === from.path) {
    next();
    return;
  }

  // 3. [SOLUSI UTAMA] Cek apakah Data Checkout Masih Ada?
  // Kalau event/participants kosong (artinya udah di-clearCheckout di Instructions sebelumnya),
  // JANGAN TAHAN USER. Langsung next().
  if (!store.event || !store.participants || store.participants.length === 0) {
    next();
    return;
  }

  // 4. Kalau data masih ada dan user mau keluar halaman lain, baru tanya
  Swal.fire({
    title: 'Batalkan pembayaran?',
    text: "Data pendaftaran akan hilang.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Lanjut Bayar'
  }).then((result) => {
    if (result.isConfirmed) {
      store.clearCheckout();
      next();
    } else {
      next(false);
    }
  });
});
</script>

<style scoped>
.payment-method-label {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.payment-method-label:hover {
  border-color: #aaa;
}

.payment-method-label.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 155, 77, 0.2);
}

.payment-method-label img {
  max-width: 100%;
  max-height: 40px;
  filter: grayscale(100%);
  opacity: 0.7;
}

.payment-method-label.active img {
  filter: grayscale(0%);
  opacity: 1;
}

.form-check-input {
  display: none;
}
</style>