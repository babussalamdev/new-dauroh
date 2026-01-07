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
            Diskon ({{ store.voucherCode }})
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

        <h6 class="fw-bold mt-4 mb-2 small text-muted">DATA PESERTA</h6>
        <div class="table-responsive mb-4 border rounded">
          <table class="table table-sm mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-3">Nama</th>
                <th>Gender</th>
                <th>Usia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in store.participants" :key="idx">
                <td class="ps-3">{{ p.Name }}</td>
                <td>{{ p.Gender }}</td>
                <td>{{ p.Age }}</td>
              </tr>
            </tbody>
          </table>
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
import { useUserStore } from '~/stores/user';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useNuxtApp } from '#app'; 

import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

definePageMeta({ layout: 'checkout' });
useHead({ title: 'Ringkasan Pembayaran' });

const store = useCheckoutStore();
const userStore = useUserStore();
const router = useRouter();
const { $apiBase } = useNuxtApp();
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  if (!store.paymentMethod) router.replace('/checkout/select');
});

const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = {
    'BNI': bniLogo, 'BRI': briLogo, 'BSI': bsiLogo, 'CIMB': cimbLogo,
    'DANAMON': danamonLogo, 'MANDIRI': mandiriLogo, 'PERMATA': permataLogo, 'QRIS': qrisLogo,
  };
  return store.paymentMethod ? logos[store.paymentMethod] : null;
});

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const applyVoucher = async () => {
  error.value = null; loading.value = true;
  const code = store.voucherCode;
  if (!code) { store.setVoucher(null, 0); loading.value = false; return; }

  try {
    const response = await $apiBase.post('/check-voucher', { code, eventSK: store.dauroh?.SK, totalAmount: store.totalAmount });
    const result = response.data;
    let disc = 0;
    if (result.amount !== undefined) disc = Number(result.amount);
    else if (result.type === 'PERCENT') disc = store.totalAmount * (result.value / 100);
    else if (result.type === 'FIXED') disc = Number(result.value);
    
    if (disc > store.totalAmount) disc = store.totalAmount;
    store.setVoucher(code, disc);
    Swal.fire({ icon: 'success', title: 'Voucher Berhasil!', text: `Potongan ${formatCurrency(disc)}`, timer: 1500, showConfirmButton: false });
  } catch (err: any) {
    store.setVoucher(code, 0);
    error.value = err.response?.data?.message || err.message || 'Kode voucher salah';
  } finally { loading.value = false; }
};

const handlePay = async () => {
  loading.value = true; error.value = null;
  try {
    const result = await store.createPayment();
    if (result.success) {
      if (store.dauroh && store.participants.length > 0) {
        userStore.registerDauroh({ dauroh: store.dauroh, participants: store.participants });
      }
      router.push('/checkout/instructions');
    } else {
      const isSoldOut = result.error?.response?.status === 400 || result.error?.response?.status === 409 || (result.message && result.message.toLowerCase().includes('habis'));
      if (isSoldOut) {
         await Swal.fire({ icon: 'error', title: 'Mohon Maaf', text: 'Kuota tiket sudah habis.', confirmButtonText: 'Kembali ke Home', confirmButtonColor: '#d33' });
         store.clearCheckout(); router.push('/');
      } else {
         throw new Error(result.message || 'Gagal membuat transaksi.');
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Gagal memproses pembayaran.';
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.value || 'Terjadi kesalahan sistem.' });
  } finally { loading.value = false; }
};

onBeforeRouteLeave((to, from, next) => {
  if (to.path === '/checkout/instructions' || to.path === '/checkout/select') { next(); return; }
  Swal.fire({ title: 'Batalkan pembayaran?', text: "Data akan hilang.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya', cancelButtonText: 'Tidak' }).then((r) => r.isConfirmed ? (store.clearCheckout(), next()) : next(false));
});
</script>

<style scoped>
.payment-logo-summary { max-height: 50px; max-width: 150px; object-fit: contain; }
</style>