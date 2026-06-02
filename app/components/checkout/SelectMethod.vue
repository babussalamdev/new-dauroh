<template>
  <div>
    <h5 class="mb-3 txt-subtitle fw-bold text-dark">Silahkan pilih metode pembayaran berikut:</h5>

    <div class="row g-3">
      <div v-for="bank in banks" :key="bank.code" class="col-6 col-md-4">
        <label class="payment-method-label" :class="{ active: selectedMethod === bank.code }">
          <input type="radio" name="paymentMethod" v-model="selectedMethod" :value="bank.code" class="form-check-input">
          <img :src="bank.img" :alt="bank.code">
        </label>
      </div>
    </div>

    <div class="d-flex justify-content-between mt-4 pt-3 border-top">
      
      <button class="btn btn-light border px-4 rounded-pill txt-body fw-bold text-muted" @click="handleBack">
        <i class="bi bi-arrow-left me-1"></i> Kembali
      </button>

      <button class="btn btn-primary px-4 rounded-pill txt-body fw-bold shadow-sm" @click="handleSelect" :disabled="!selectedMethod">
        Pilih Metode <i class="bi bi-check-circle-fill ms-1"></i>
      </button>
    </div>
  </div>

  <a href="https://wa.me/628123456789" target="_blank" class="btn btn-success whatsapp-fab rounded-pill shadow-sm px-3 txt-body fw-bold d-inline-flex align-items-center mt-4">
    <i class="bi bi-whatsapp me-2 fs-5"></i> Bantuan
  </a>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useAlert } from '~/utils/swal';

// Import Gambar
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

useHead({ title: 'Metode Pembayaran' });

const store = useCheckoutStore();
const router = useRouter();
const selectedMethod = ref<string | null>(null)
const { confirm: swalConfirm } = useAlert();
const isRepay = computed(() => store.repay === true);

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
  if (isRepay.value) {
    router.push('/history');
  } else {
    router.back();
  }
};

const handleSelect = () => {
  if (selectedMethod.value) {
    store.setPaymentMethod(selectedMethod.value);
    store.setStep('summary');
  }
};

// --- LOGIC GUARD ---
onBeforeRouteLeave((to, from, next) => {
  if (to.path === '/dashboard') {
    next();
    setTimeout(() => store.clearCheckout(), 300);
    return;
  }

  if (to.path === from.path) {
    next();
    return;
  }

  if (!store.event || !store.participants || store.participants.length === 0) {
    next();
    return;
  }

  // KETIKA REPAY (BAYAR ULANG)
  if (isRepay.value) {
    swalConfirm(
      'Batal pilih metode?',
      'Anda bisa melanjutkan pembayaran lagi nanti lewat menu Riwayat Pendaftaran.',
      'Ya, Keluar'
    ).then((result) => {
      if (result.isConfirmed) {
        store.clearCheckout();
        next();
      } else {
        next(false);
      }
    });
  } 
  //KETIKA PENDAFTARAN BARU
  else {
    swalConfirm(
      'Batalkan pendaftaran?',
      'Data yang sudah Anda isi akan hilang jika keluar sekarang.',
      'Ya, Batalkan'
    ).then((result) => {
      if (result.isConfirmed) {
        store.clearCheckout();
        next();
      } else {
        next(false);
      }
    });
  }
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