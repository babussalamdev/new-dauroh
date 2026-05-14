<template>
  <div>
    <div class="text-center mb-3">
      <img v-if="paymentLogoUrl" :src="paymentLogoUrl" :alt="store.paymentMethod || 'Logo Pembayaran'"
        class="payment-logo-summary">
      <hr class="text-muted opacity-25">
    </div>

    <div class="mb-3">
      <label for="voucher" class="form-label txt-label fw-bold text-secondary">Kode Voucher</label>
      <div class="input-group">
        <input type="text" class="form-control txt-body" id="voucher" placeholder="Masukkan kode voucher"
          v-model="store.voucherCode" :disabled="loading || store.repay" @keyup.enter="applyVoucher">
        <button class="btn btn-outline-secondary txt-body fw-bold" type="button" @click="applyVoucher" :disabled="loading || store.repay">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span v-else>Submit</span>
        </button>
      </div>
      <small v-if="store.repay" class="text-danger txt-caption fst-italic mt-1">*Voucher tidak dapat diubah pada sesi bayar ulang.</small>
    </div>

    <div v-if="!store.repay" class="card border-0 shadow-sm rounded-4 p-3 mb-4" style="background-color: #f8f9fa; border-left: 4px solid #0dcaf0 !important;">
      <h6 class="fw-bold mb-1 text-dark txt-label d-flex align-items-center">
        <i class="bi bi-heart-fill text-danger me-2"></i>Tambahkan Infaq Operasional
      </h6>
      <p class="text-muted txt-caption">Dukung dakwah Yayasan Babussalam. Semoga menjadi amal jariyah.</p>

      <div class="d-flex flex-wrap gap-2 mb-3">
        <button class="btn btn-sm rounded-pill txt-body fw-bold" :class="store.donationAmount === 10000 ? 'btn-info text-white' : 'btn-outline-info'" @click="setDonation(10000)">Rp 10.000</button>
        <button class="btn btn-sm rounded-pill txt-body fw-bold" :class="store.donationAmount === 20000 ? 'btn-info text-white' : 'btn-outline-info'" @click="setDonation(20000)">Rp 20.000</button>
        <button class="btn btn-sm rounded-pill txt-body fw-bold" :class="store.donationAmount === 50000 ? 'btn-info text-white' : 'btn-outline-info'" @click="setDonation(50000)">Rp 50.000</button>
        <button class="btn btn-sm rounded-pill txt-body fw-bold" :class="store.donationAmount === 0 ? 'btn-secondary text-white' : 'btn-outline-secondary'" @click="setDonation(0)">Tidak, Terima Kasih</button>
      </div>

      <div class="input-group input-group-sm">
        <span class="input-group-text bg-white border-end-0 txt-body fw-bold">Rp</span>
        <input type="number" class="form-control border-start-0 shadow-none txt-body fw-bold text-dark" placeholder="Isi nominal bebas..." v-model="customDonation" @input="handleCustomDonation">
      </div>
    </div>

    <div class="alert alert-warning txt-caption fw-bold p-2 rounded-3 border-0" role="alert">
      <i class="bi bi-clock-history me-1"></i>
      Untuk pembayaran hanya aktif selama 30 menit.
      Pastikan anda sudah siap membayar sebelum menekan tombol bayar.
    </div>

    <ul class="list-group list-group-flush mt-4">
      <li class="list-group-item d-flex justify-content-between align-items-center px-0 txt-body">
        <span class="text-muted">Biaya Pendaftaran - {{ store.event?.Title }} ({{ store.participants?.length || 0 }} tiket)</span>
        <span class="fw-bold text-dark">{{ formatCurrency(store.totalAmount) }}</span>
      </li>

      <li v-if="store.donationAmount > 0" class="list-group-item d-flex justify-content-between align-items-center px-0 txt-body text-success">
        <span>Infaq Dakwah Babussalam</span>
        <span class="fw-bold">+ {{ formatCurrency(store.donationAmount) }}</span>
      </li>

      <li v-if="store.discountAmount > 0"
        class="list-group-item d-flex justify-content-between align-items-center px-0 txt-body text-danger">
        <span>Diskon ({{ store.voucherCode }})</span>
        <span class="fw-bold">- {{ formatCurrency(store.discountAmount) }}</span>
      </li>

      <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-light rounded-3 mt-2 p-2">
        <span class="txt-body fw-bold text-dark">TOTAL</span>
        <span class="txt-subtitle fw-bold text-primary">{{ formatCurrency(store.finalAmount) }}</span>
      </li>
    </ul>

    <div v-if="error" class="alert alert-danger txt-caption fw-bold p-2 mt-3">
      <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ error }}
    </div>

    <h6 class="fw-bold mt-4 mb-2 txt-label text-muted">DATA PESERTA</h6>
    <div class="table-responsive mb-4 border rounded-4 overflow-hidden">
      <table class="table table-sm mb-0">
        <thead class="bg-light">
          <tr>
            <th class="ps-3 txt-caption fw-bold text-muted">Nama</th>
            <th class="txt-caption fw-bold text-muted">Gender</th>
            <th class="txt-caption fw-bold text-muted">Usia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in store.participants" :key="idx">
            <td class="ps-3 txt-body fw-bold text-dark">{{ p.Name }}</td>
            <td class="txt-body text-muted">{{ p.Gender }}</td>
            <td class="txt-body text-muted">{{ p.Age }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between mt-4">
      <button class="btn btn-light border px-4 rounded-pill txt-body fw-bold text-muted" @click="store.setStep('select')" :disabled="loading">
        <i class="bi bi-arrow-left me-1"></i> Kembali
      </button>

      <button class="btn btn-primary px-5 rounded-pill txt-body fw-bold shadow-sm" @click="handlePay" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ loading ? 'Memproses...' : 'Bayar Sekarang' }}
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
import { useRouter } from 'vue-router'; 
import { useNuxtApp } from '#app';
import { useAuth } from '~/composables/useAuth';
import { useAlert } from '~/utils/swal'; // 🟢 Sudah terimport

// Import Images
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
const { alert: swalAlert } = useAlert(); // 🟢 Ambil fungsi alert
const { $apiBase } = useNuxtApp();
const { accessToken } = useAuth();
const loading = ref(false);
const error = ref<string | null>(null);
const customDonation = ref<number | null>(null);

onMounted(() => {
  if (!store.paymentMethod) {
    store.setStep('select');
  }
  if (!store.repay) {
    store.donationAmount = 0;
  }
});

const setDonation = (amount: number) => {
  store.donationAmount = amount;
  customDonation.value = null; 
};

const handleCustomDonation = () => {
  if (customDonation.value !== null && customDonation.value >= 0) {
    store.donationAmount = customDonation.value;
  } else {
    store.donationAmount = 0;
  }
};

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
    }

    if (disc > store.totalAmount) disc = store.totalAmount;

    if (disc > 0) {
      store.setVoucher(code, disc);
      swalAlert('Voucher Berhasil!', `Potongan ${formatCurrency(disc)}`, 'success');
    } else {
      throw new Error("Voucher tidak valid atau nominal 0");
    }

  } catch (err: any) {
    store.removeVoucher();
    store.voucherCode = code;

    let rawMsg = err.response?.data?.message || err.message || '';
    let userMsg = 'Kode voucher salah atau tidak ditemukan.';

    const lowerMsg = rawMsg.toLowerCase();
    if (lowerMsg.includes('inactive') || lowerMsg.includes('expire') || lowerMsg.includes('sudah digunakan')) {
      userMsg = 'Voucher sudah tidak aktif / kadaluarsa.';
    }

    error.value = userMsg;
    swalAlert('Gagal', userMsg, 'error');

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
      const errMsg = (result.message || '').toLowerCase();
      
      if (errMsg.includes('booking pending') || errMsg.includes('memiliki booking') || errMsg.includes('pending')) {
        await swalAlert(
          'Transaksi Tertunda', 
          'Sistem mendeteksi Anda memiliki pendaftaran yang belum dibayar. Silakan cek menu Riwayat.', 
          'warning'
        );
        router.push('/history');
        return;
      }

      const isSoldOut = result.error?.response?.status === 400 && (errMsg.includes('habis') || errMsg.includes('sold'));
      if (isSoldOut) {
        await swalAlert('Mohon Maaf', 'Kuota tiket sudah habis.', 'error');
        store.clearCheckout();
        router.push('/');
      } else {
        throw new Error(result.message || 'Gagal membuat transaksi.');
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Gagal memproses pembayaran.';
    swalAlert('Gagal', error.value || 'Terjadi kesalahan sistem.', 'error');
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