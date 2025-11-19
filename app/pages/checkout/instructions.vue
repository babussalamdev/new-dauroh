<template>
  <div>
    <div class="card shadow-sm">
      <div class="card-body p-4 text-center">

        <img 
          v-if="paymentLogoUrl" 
          :src="paymentLogoUrl || ''" 
          :alt="store.transactionDetails?.paymentMethod || 'Bank'" 
          class="payment-logo-summary mb-3"
        >
        
        <p class="text-muted mb-1">Jumlah yang harus dibayar</p>
        <h2 class="fw-bold mb-3 text-primary">{{ formatCurrency(store.transactionDetails?.amount || 0) }}</h2>

        <div class="countdown-timer mb-4 badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">
          <i class="bi bi-clock me-1"></i>
          Selesaikan dalam: <strong>{{ countdown }}</strong>
        </div>

        <hr class="my-4">

        <div class="text-start">
          <h6 class="mb-3 text-center">Panduan Pembayaran</h6>
          
          <component 
            :is="currentBankComponent" 
            v-if="currentBankComponent"
            :vaNumber="store.transactionDetails?.vaNumber || 'ERROR'"
            :amount="store.transactionDetails?.amount || 0"
          />
          
          <div v-else class="alert alert-warning text-center">
            Instruksi untuk bank <strong>{{ store.transactionDetails?.paymentMethod }}</strong> belum tersedia.
            <br>Silakan gunakan No. VA: <strong>{{ store.transactionDetails?.vaNumber }}</strong>
          </div>
        </div>

        <div class="mt-5 pt-3 border-top">
           <div v-if="paymentStatus === 'pending'" class="text-center">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span class="ms-2 text-muted small">Menunggu pembayaran...</span>
            <p class="text-muted small mt-1">Halaman ini akan otomatis terupdate setelah pembayaran berhasil.</p>
          </div>

          <div v-if="paymentStatus === 'success'" class="alert alert-success text-center">
            <h5 class="alert-heading"><i class="bi bi-check-circle-fill"></i> Pembayaran Berhasil!</h5>
            <p class="mb-0">Anda akan diarahkan ke dashboard.</p>
          </div>

          <div v-if="paymentStatus === 'expired'" class="alert alert-danger text-center">
            <h5 class="alert-heading"><i class="bi bi-x-circle-fill"></i> Waktu Habis</h5>
            <p class="mb-0">Waktu pembayaran telah berakhir. Silakan ulangi pendaftaran.</p>
            <button class="btn btn-danger mt-2" @click="router.push('/')">Kembali ke Beranda</button>
          </div>
        </div>

      </div>
    </div>
    
    <a href="https://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
      <i class="bi bi-whatsapp me-1"></i> Whatsapp
    </a>

    <BankPaymentReceipt ref="receiptRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, defineAsyncComponent } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

// Import Logo
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

definePageMeta({ layout: 'checkout' });
useHead({ title: 'Instruksi Pembayaran' });

const store = useCheckoutStore();
const userStore = useUserStore();
const router = useRouter();

// --- STATE DEFINITIONS ---
const paymentStatus = ref<'pending' | 'success' | 'expired'>('pending');
const countdown = ref('23:59:59');
const receiptRef = ref(null); // Referensi ke komponen receipt
let timerInterval: NodeJS.Timeout | null = null;
let simulationTimer: NodeJS.Timeout | null = null;
let pollingInterval: NodeJS.Timeout | null = null;

// --- DYNAMIC COMPONENTS ---
const BankComponents: any = {
  'BNI': defineAsyncComponent(() => import('~/components/bank/BNI.vue')),
  'BRI': defineAsyncComponent(() => import('~/components/bank/BRI.vue')),
  'BSI': defineAsyncComponent(() => import('~/components/bank/BSI.vue')),
  'CIMB': defineAsyncComponent(() => import('~/components/bank/CIMB.vue')),
  'DANAMON': defineAsyncComponent(() => import('~/components/bank/Danamon.vue')),
  'MANDIRI': defineAsyncComponent(() => import('~/components/bank/Mandiri.vue')),
  'PERMATA': defineAsyncComponent(() => import('~/components/bank/Permata.vue')),
};

const currentBankComponent = computed(() => {
  const method = store.transactionDetails?.paymentMethod;
  return method ? BankComponents[method] : null;
});

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  if (!store.transactionDetails) {
    router.replace('/checkout/summary');
    return;
  }
  startTimer(store.transactionDetails.expiryTime);
  startPaymentPolling();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (simulationTimer) clearTimeout(simulationTimer);
  if (pollingInterval) clearInterval(pollingInterval);
});

// --- LOGIC ---
const startPaymentPolling = () => {
  console.log("Memulai simulasi pengecekan pembayaran...");
  // Simulasi sukses setelah 10 detik
  simulationTimer = setTimeout(() => {
    if (paymentStatus.value === 'pending') {
      paymentStatus.value = 'success';
    }
  }, 10000);
};

watch(paymentStatus, (newStatus) => {
  if (newStatus === 'success') {
    // Stop semua timer
    if (timerInterval) clearInterval(timerInterval);
    if (simulationTimer) clearTimeout(simulationTimer);
    if (pollingInterval) clearInterval(pollingInterval);

    // Tampilkan notifikasi sukses & tawaran download receipt
    Swal.fire({
      title: 'Pembayaran Berhasil!',
      text: 'Download bukti pembayaran Anda sekarang?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Ya, Download PDF',
      cancelButtonText: 'Nanti Saja',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Panggil fungsi download di dalam komponen anak
        // @ts-ignore
        receiptRef.value?.downloadPdf();
      }
      
      // Simpan ke user store (sebagai tiket aktif)
      const registrationData = {
        dauroh: store.dauroh,
        participants: store.participants,
      };
      if (registrationData.dauroh && registrationData.participants) {
         userStore.registerDauroh(registrationData as any);
      }
      
      // Beri jeda sedikit jika user download, baru redirect dan bersihkan data
      setTimeout(() => {
        store.clearCheckout();
        router.push('/dashboard');
      }, 1500);
    });
  }
});

const startTimer = (expiryTime: number) => {
  timerInterval = setInterval(() => {
    const now = Date.now();
    const distance = expiryTime - now;

    if (distance < 0) {
      if (timerInterval) clearInterval(timerInterval);
      countdown.value = "Waktu Habis";
      if (paymentStatus.value === 'pending') {
          paymentStatus.value = 'expired';
      }
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.value = 
      String(hours).padStart(2, '0') + ":" + 
      String(minutes).padStart(2, '0') + ":" + 
      String(seconds).padStart(2, '0');
  }, 1000);
};

// Helper Logo & Currency
const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = { 'BNI': bniLogo, 'BRI': briLogo, 'BSI': bsiLogo, 'CIMB': cimbLogo, 'DANAMON': danamonLogo, 'MANDIRI': mandiriLogo, 'PERMATA': permataLogo, 'QRIS': qrisLogo };
  return store.transactionDetails?.paymentMethod ? logos[store.transactionDetails.paymentMethod] : null;
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

// Navigation Guard
onBeforeRouteLeave((to, from, next) => {
  // Izinkan jika sudah sukses atau mau ke dashboard
  if (paymentStatus.value === 'success' || to.path === '/dashboard') {
    next();
    return;
  }
  
  Swal.fire({
    title: 'Anda yakin ingin membatalkan pembayaran?',
    text: "Instruksi pembayaran ini akan hangus jika Anda keluar.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Tetap di Sini'
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
.payment-logo-summary { max-height: 60px; max-width: 180px; object-fit: contain; }
</style>