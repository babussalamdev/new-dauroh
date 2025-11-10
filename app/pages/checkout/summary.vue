<template>
  <div>
    <div class="card shadow-sm">
      <div class="card-body p-4">
        
        <div class="text-center mb-3">
          <img 
            v-if="paymentLogoUrl" 
            :src="paymentLogoUrl || ''" 
            :alt="store.paymentMethod || 'Logo Pembayaran'" 
            class="payment-logo-summary"
          >
          <hr>
        </div>

        <div class="mb-3">
          <label for="voucher" class="form-label">Kode Voucher</label>
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              id="voucher" 
              placeholder="Masukkan kode voucher" 
              v-model="voucherCode" 
              :disabled="loading"
            >
            <button class="btn btn-outline-secondary" type="button" @click="applyVoucher" :disabled="loading">
              Submit
            </button>
          </div>
        </div>

        <div class="alert alert-warning small p-2" role="alert">
          <i class="bi bi-clock me-1"></i> 
          Untuk pembayaran hanya aktif selama 1x24 jam.
          Pastikan anda sudah siap membayar sebelum menekan tombol bayar.
        </div>

        <ul class="list-group list-group-flush mt-4">
          <li class="list-group-item d-flex justify-content-between align-items-center px-0">
            Biaya Pendaftaran - {{ store.dauroh?.Title }} ({{ store.participants?.length }} tiket)
            <span>{{ formatCurrency(store.totalAmount) }}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0">
            Diskon
            <span>{{ formatCurrency(discountAmount) }}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-light fw-bold">
            TOTAL
            <span>{{ formatCurrency(store.totalAmount - discountAmount) }}</span>
          </li>
        </ul>

        <div v-if="error" class="alert alert-danger small p-2 mt-3">
          {{ error }}
        </div>
        
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-secondary" @click="router.push('/checkout/select')" :disabled="loading">
            Kembali
          </button>
          <button class="btn btn-primary" @click="handlePay" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ loading ? 'Memproses...' : 'Bayar' }}
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
import { ref, onMounted, computed } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
// import logo bank
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

definePageMeta({
  layout: 'checkout',
});
useHead({ title: 'Ringkasan Pembayaran' });

const store = useCheckoutStore();
const router = useRouter();
const loading = ref(false);
const error = ref<string | null>(null);
const voucherCode = ref('');
const discountAmount = ref(0);

// Guard: Pastikan user sudah memilih metode
onMounted(() => {
  if (!store.paymentMethod) {
    router.replace('/checkout/select');
  }
});

// Helper untuk menampilkan logo bank
const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = {
    'BNI': bniLogo,
    'BRI': briLogo,
    'BSI': bsiLogo,
    'CIMB': cimbLogo,
    'DANAMON': danamonLogo,
    'MANDIRI': mandiriLogo,
    'PERMATA': permataLogo,
    'QRIS': qrisLogo,
  };
  return store.paymentMethod ? logos[store.paymentMethod] : null;
});

// Format mata uang
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

// Fungsi voucher (hanya UI)
const applyVoucher = () => {
  error.value = null;
  if (voucherCode.value === 'DISKON10K') {
    discountAmount.value = 10000;
  } else {
    discountAmount.value = 0;
  }
};

// Fungsi klik "Bayar"
const handlePay = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Panggil action di store
    await store.createPayment();
    // Arahkan ke halaman instruksi
    router.push('/checkout/instructions');

  } catch (err: any) {
    error.value = err.message || 'Gagal memproses pembayaran.';
  } finally {
    loading.value = false;
  }
};

onBeforeRouteLeave((to, from, next) => {
  // Jika user mengklik tombol "Bayar" (tujuannya ke '/checkout/instructions')
  // atau user klik "Kembali" (tujuannya ke '/checkout/select')
  // biarkan dia pergi.
  if (to.path === '/checkout/instructions' || to.path === '/checkout/select') {
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
    confirmButtonColor: '#d33', // Merah untuk "Ya, Batalkan"
    cancelButtonColor: '#3085d6', // Biru untuk "Lanjut Bayar"
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Lanjut Bayar' // Ini adalah tombol "Batal" dari SweetAlert
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
.payment-logo-summary {
  max-height: 50px;
  max-width: 150px;
  object-fit: contain;
}
.list-group-item.bg-light {
  background-color: #f8f9fa !important;
}
</style>