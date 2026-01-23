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

        <div class="d-flex justify-content-end mt-4">
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

// Import Gambar (Biar pasti muncul kayak di Summary.vue)
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

// HAPUS definePageMeta (karena ini component, layout ikut parent)

const store = useCheckoutStore();
const router = useRouter(); 
const selectedMethod = ref<string | null>(null);

// Data Bank untuk Loop
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

const handleSelect = () => {
  if (selectedMethod.value) {
    store.setPaymentMethod(selectedMethod.value);
    // REVISI: Pakai 'store', bukan 'checkoutStore'
    store.setStep('summary');
  }
};

// Logic Guard (Konfirmasi Keluar)
onBeforeRouteLeave((to, from, next) => {
  // REVISI: Hapus pengecekan 'to.path === summary' karena kita gak pindah URL.
  // Guard ini cuma jalan kalau user BENAR-BENAR keluar dari halaman Checkout (misal ke Home).
  
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
/* STYLE TETAP SAMA SESUAI REQUEST */
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
  border-color: var(--color-primary); /* Pastikan var ini ada global */
  box-shadow: 0 0 0 2px rgba(0, 155, 77, 0.2);
}
.payment-method-label img {
  max-width: 100%;
  max-height: 40px;
  filter: grayscale(100%);
  opacity: 0.7; /* Typo fix: 0. -> 0.7 */
}
.payment-method-label.active img {
  filter: grayscale(0%);
  opacity: 1;
}
.form-check-input {
  display: none;
}
</style>