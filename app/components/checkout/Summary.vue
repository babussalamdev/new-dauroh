<template>
  <div>
    <div class="text-center mb-3">
      <img v-if="paymentLogoUrl" :src="paymentLogoUrl" :alt="store.paymentMethod || 'Logo Pembayaran'"
        class="payment-logo-summary">
      <hr>
    </div>

    <div class="mb-3">
      <label for="voucher" class="form-label">Kode Voucher</label>
      <div class="input-group">
        <input type="text" class="form-control" id="voucher" placeholder="Masukkan kode voucher"
          v-model="store.voucherCode" :disabled="loading" @keyup.enter="applyVoucher">
        <button class="btn btn-outline-secondary" type="button" @click="applyVoucher" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span v-else>Submit</span>
        </button>
      </div>
    </div>

    <div class="alert alert-warning small p-2" role="alert">
      <i class="bi bi-clock me-1"></i>
      Untuk pembayaran hanya aktif selama 30 menit.
      Pastikan anda sudah siap membayar sebelum menekan tombol bayar.
    </div>

    <ul class="list-group list-group-flush mt-4">
      <li class="list-group-item d-flex justify-content-between align-items-center px-0">
        Biaya Pendaftaran - {{ store.event?.Title }} ({{ store.participants?.length || 0 }} tiket)
        <span>{{ formatCurrency(store.totalAmount) }}</span>
      </li>

      <li v-if="store.discountAmount > 0"
        class="list-group-item d-flex justify-content-between align-items-center px-0 text-danger">
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
      <button class="btn btn-secondary" @click="store.setStep('select')" :disabled="loading">
        Kembali
      </button>

      <button class="btn btn-primary" @click="handlePay" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ loading ? 'Memproses...' : 'Bayar' }}
      </button>
    </div>

  </div>
  <a href="https://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
    <i class="bi bi-whatsapp me-1"></i> Whatsapp
  </a>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { useRouter } from 'vue-router'; // onBeforeRouteLeave dihapus dari sini biar simple
import Swal from 'sweetalert2';
import { useNuxtApp } from '#app';
import { useAuth } from '~/composables/useAuth';

// Import Images
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

// REVISI 2: Hapus definePageMeta (karena ini component, bukan page)
// definePageMeta({ layout: 'checkout' });

const store = useCheckoutStore();
const router = useRouter();
const { $apiBase } = useNuxtApp();
const { accessToken } = useAuth();
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  // REVISI 3: Cek paymentMethod, kalau null lempar balik ke step select
  if (!store.paymentMethod) {
    store.setStep('select');
  }
});

const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = {
    'BNI': bniLogo, 'BRI': briLogo, 'BSI': bsiLogo, 'CIMB': cimbLogo,
    'DANAMON': danamonLogo, 'MANDIRI': mandiriLogo, 'PERMATA': permataLogo, 'QRIS': qrisLogo,
  };
  return store.paymentMethod ? logos[store.paymentMethod.toUpperCase()] : null;
});

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const applyVoucher = async () => {
  error.value = null;
  loading.value = true;
  const code = store.voucherCode;

  if (!code) {
    store.removeVoucher();
    loading.value = false;
    return;
  }

  try {
    if (!store.event?.SK) throw new Error("Data event tidak ditemukan.");

    const payload = {
      code: code,
      eventSK: store.event.SK,
      AccessToken: accessToken.value
    };

    const response = await $apiBase.put('/match-voucher', payload);
    const rawResult = response.data;

    // Logic Parsing Voucher (Tetap sama)
    let finalData = rawResult;
    if (finalData && typeof finalData === 'object' && 'data' in finalData) finalData = finalData.data;
    if (Array.isArray(finalData)) finalData = finalData[0];
    if (finalData && typeof finalData === 'object' && 'data' in finalData) finalData = finalData.data;

    if (!finalData) throw new Error("Format data voucher tidak dikenali.");

    let disc = 0;
    const valAmount = finalData.Amount ?? finalData.amount ?? finalData.Nominal ?? finalData.nominal ?? finalData.Diskon ?? finalData.diskon;
    const valValue = finalData.Value ?? finalData.value;
    const valType = finalData.Type ?? finalData.type;

    if (valAmount !== undefined) {
      disc = Number(valAmount);
    } else if (valType === 'PERCENT' || valType === 'percent') {
      disc = store.totalAmount * (Number(valValue) / 100);
    } else if (valType === 'FIXED' || valType === 'fixed') {
      disc = Number(valValue);
    } else if (typeof rawResult === 'number') {
      disc = rawResult;
    }

    if (disc > store.totalAmount) disc = store.totalAmount;

    if (disc > 0) {
      store.setVoucher(code, disc);
      Swal.fire({ icon: 'success', title: 'Voucher Berhasil!', text: `Potongan ${formatCurrency(disc)}`, timer: 1500, showConfirmButton: false });
    } else {
      throw new Error("Voucher tidak valid atau nominal 0");
    }

  } catch (err: any) {
    console.error("Voucher Error:", err);
    store.removeVoucher();
    store.voucherCode = code;

    let rawMsg = err.response?.data?.message || err.message || '';
    let userMsg = 'Kode voucher salah atau tidak ditemukan.';

    const lowerMsg = rawMsg.toLowerCase();
    if (lowerMsg.includes('inactive') || lowerMsg.includes('expire') || lowerMsg.includes('sudah digunakan')) {
      userMsg = 'Voucher sudah tidak aktif / kadaluarsa.';
    } else if (lowerMsg.includes('not found') || lowerMsg.includes('tidak ditemukan')) {
      userMsg = 'Kode voucher tidak ditemukan.';
    }

    error.value = userMsg;
    Swal.fire({ icon: 'error', title: 'Gagal', text: userMsg, timer: 2000, showConfirmButton: false });

  } finally {
    loading.value = false;
  }
};

const handlePay = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await store.createPayment();
    if (result.success) {
      store.setStep('instructions');
    }
    else {
      const errMsg = (result.message || '').toLowerCase()
      if (errMsg.includes('booking pending') || errMsg.includes('memiliki booking') || errMsg.includes('pending')) {

        await Swal.fire({
          icon: 'warning',
          title: 'Transaksi Tertunda',
          text: 'Sistem mendeteksi Anda memiliki pendaftaran yang belum dibayar, namun data gagal diambil otomatis. Silakan cek menu Riwayat.',
          confirmButtonText: 'Cek Riwayat',
          confirmButtonColor: '#004754'
        });

        router.push('/riwayat-pendaftaran');
        return;
      }

      // Logic Sold Out
      const isSoldOut = result.error?.response?.status === 400 && (errMsg.includes('habis') || errMsg.includes('sold'));

      if (isSoldOut) {
        await Swal.fire({ icon: 'error', title: 'Mohon Maaf', text: 'Kuota tiket sudah habis.', confirmButtonText: 'Kembali ke Home', confirmButtonColor: '#d33' });
        store.clearCheckout();
        router.push('/');
      } else {
        throw new Error(result.message || 'Gagal membuat transaksi.');
      }
    }
  } catch (err: any) {
    console.error(err);
    error.value = err.message || 'Gagal memproses pembayaran.';
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.value || 'Terjadi kesalahan sistem.' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.payment-logo-summary {
  max-height: 50px;
  max-width: 150px;
  object-fit: contain;
}
</style>