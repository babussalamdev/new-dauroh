<template>
  <div>
    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h5 class="mb-3">Silahkan pilih metode pembayaran berikut:</h5>
        
        <div class="row g-3">
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'BNI' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="BNI" class="form-check-input">
              <img src="/assets/img/bank/bni.png" alt="BNI">
            </label>
          </div>
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'BRI' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="BRI" class="form-check-input">
              <img src="/assets/img/bank/bri.png" alt="BRI">
            </label>
          </div>
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'BSI' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="BSI" class="form-check-input">
              <img src="/assets/img/bank/bsi.png" alt="BSI">
            </label>
          </div>
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'CIMB' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="CIMB" class="form-check-input">
              <img src="/assets/img/bank/cimb.png" alt="CIMB Niaga">
            </label>
          </div>
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'DANAMON' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="DANAMON" class="form-check-input">
              <img src="/assets/img/bank/danamon.png" alt="Danamon">
            </label>
          </div>
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'MANDIRI' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="MANDIRI" class="form-check-input">
              <img src="/assets/img/bank/mandiri.png" alt="Mandiri">
            </label>
          </div>
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'PERMATA' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="PERMATA" class="form-check-input">
              <img src="/assets/img/bank/permata.png" alt="PermataBank">
            </label>
          </div>
          <div class="col-6 col-md-4">
            <label class="payment-method-label" :class="{ active: selectedMethod === 'QRIS' }">
              <input type="radio" name="paymentMethod" v-model="selectedMethod" value="QRIS" class="form-check-input">
              <img src="/assets/img/bank/qris.png" alt="QRIS">
            </label>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-primary" @click="handleSelect" :disabled="!selectedMethod">
            Pilih
          </button>
        </div>
      </div>
    </div>

    <a href="httpsa://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
      <i class="bi bi-whatsapp me-1"></i> Whatsapp
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { onBeforeRouteLeave, useRouter } from 'vue-router'; // <-- 1. IMPORT onBeforeRouteLeave
import Swal from 'sweetalert2'; // <-- 2. IMPORT SweetAlert2

definePageMeta({
  layout: 'checkout',
});
useHead({ title: 'Pilih Metode Pembayaran' });

const store = useCheckoutStore();
const router = useRouter(); // <-- 3. Pastikan useRouter di-instance
const selectedMethod = ref<string | null>(null);

// Guard: Pastikan user datang dari modal registrasi
onMounted(() => {
  if (!store.participants || store.participants.length === 0) {
    router.replace('/'); // Kembali ke home jika tidak ada data
  }
  // Set pilihan default jika user kembali ke halaman ini
  selectedMethod.value = store.paymentMethod;
});

const handleSelect = () => {
  if (selectedMethod.value) {
    store.setPaymentMethod(selectedMethod.value);
    router.push('/checkout/summary');
  }
};

// --- 4. TAMBAHKAN LOGIC BARU INI ---
onBeforeRouteLeave((to, from, next) => {
  // Jika user mengklik "Pilih" (tujuannya ke '/checkout/summary')
  // biarkan dia pergi.
  if (to.path === '/checkout/summary') {
    next(); // Lanjutkan navigasi
    return;
  }

  // Jika user mencoba pergi ke tempat LAIN (misal klik "Back" di browser)
  // Tampilkan modal kustom
  Swal.fire({
    title: 'Anda yakin ingin membatalkan pembayaran?',
    text: "Data yang sudah Anda isi akan hilang jika Anda keluar.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Lanjut Bayar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Jika user klik "Ya, Batalkan"
      store.clearCheckout(); // Bersihkan data checkout
      next(); // Izinkan user pergi
    } else {
      // Jika user klik "Lanjut Bayar" (atau menutup modal)
      next(false); // Batalkan navigasi, user tetap di halaman ini
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
  /* margin-left: 0.5rem; */
  filter: grayscale(100%);
  opacity: 0.;
}
.payment-method-label.active img {
  filter: grayscale(0%);
  opacity: 1;
}
.form-check-input {
  display: none;
}
</style>