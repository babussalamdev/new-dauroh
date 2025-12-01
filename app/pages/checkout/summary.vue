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
              v-model="store.voucherCode" 
              :disabled="loading"
              @keyup.enter="applyVoucher"
            >
            <button class="btn btn-outline-secondary" type="button" @click="applyVoucher" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span v-else>Submit</span>
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
          
          <li v-if="store.discountAmount > 0" class="list-group-item d-flex justify-content-between align-items-center px-0 text-danger">
            Di skon ({{ store.voucherCode }})
            <span>- {{ formatCurrency(store.discountAmount) }}</span>
          </li>
          
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-light fw-bold">
            TOTAL
            <span>{{ formatCurrency(store.finalAmount) }}</span>
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

    <a href="https://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
      <i class="bi bi-whatsapp me-1"></i> Whatsapp
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useNuxtApp } from '#app'; 

// Import logo bank
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
const { $apiBase } = useNuxtApp();
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  if (!store.paymentMethod) {
    router.replace('/checkout/select');
  }
});

// Helper Logo
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const applyVoucher = async () => {
  error.value = null;
  loading.value = true;
  
  const code = store.voucherCode;

  if (!code) {
    store.setVoucher(null, 0);
    loading.value = false;
    return;
  }

  try {
    // const response = await $apiBase.get(`/vouchers/check?code=${code}`);
    // const voucherData = response.data; // misal: { type: 'PERCENT', value: 20 }

    // Simulasi Data Voucher
    const mockVoucherDatabase = [
      { code: 'DAUROH20', type: 'PERCENT', value: 20 },     // Di skon 20%
      { code: 'HEMAT50',  type: 'FIXED',   value: 50000 },  // Potongan 50rb
      { code: 'GRATIS01', type: 'FIXED',   value: 1000000 } // Gratis (Potongan 1jt)
    ];

    // Simulasi delay API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Cari voucher yang cocok
    const validVoucher = mockVoucherDatabase.find(v => v.code === code.toUpperCase());

    if (!validVoucher) {
      throw new Error('Kode voucher tidak ditemukan');
    }

    // --- LOGIKA PERHITUNGAN ---
    let calculatedDiscount = 0;

    if (validVoucher.type === 'PERCENT') {
      // Hitung Persen: Total * (Nilai / 100)
      calculatedDiscount = store.totalAmount * (validVoucher.value / 100);
    } else if (validVoucher.type === 'FIXED') {
      // Potongan Tetap
      calculatedDiscount = validVoucher.value;
    }

    // Validasi: Diskon gak boleh lebih gede dari total harga
    if (calculatedDiscount > store.totalAmount) {
      calculatedDiscount = store.totalAmount;
    }

    // Simpan hasil hitungan Frontend ke State
    store.setVoucher(code, calculatedDiscount);
    
    Swal.fire({
      icon: 'success',
      title: 'Voucher Berhasil!',
      text: `Anda mendapatkan potongan ${formatCurrency(calculatedDiscount)}`,
      timer: 1500,
      showConfirmButton: false
    });

  } catch (err: any) {
    store.setVoucher(code, 0); // Reset jika gagal
    error.value = err.message || 'Kode voucher tidak valid';
  } finally {
    loading.value = false;
  }
};
// --- AKHIR LOGIKA DISKON ---

const handlePay = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Saat createPayment, store akan mengirim 'finalAmount' yang sudah didi skon
    const success = await store.createPayment();
    
    if (success) {
      router.push('/checkout/instructions');
    } else {
      throw new Error('Gagal membuat transaksi.');
    }

  } catch (err: any) {
    error.value = err.message || 'Gagal memproses pembayaran.';
  } finally {
    loading.value = false;
  }
};

onBeforeRouteLeave((to, from, next) => {
  if (to.path === '/checkout/instructions' || to.path === '/checkout/select') {
    next(); 
    return;
  }
  
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
      store.clearCheckout();
      next();
    } else {
      next(false);
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