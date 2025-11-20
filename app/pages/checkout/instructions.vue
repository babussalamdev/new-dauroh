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

        <div v-if="paymentStatus === 'pending'" class="countdown-timer mb-4 badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">
          <i class="bi bi-clock me-1"></i>
          Selesaikan dalam: <strong>{{ countdown }}</strong>
        </div>

        <hr class="my-4">

        <div class="text-start">
          <div v-if="paymentStatus === 'pending'">
             <h6 class="mb-3 text-center">Panduan Pembayaran</h6>
             <component 
              :is="currentBankComponent" 
              v-if="currentBankComponent"
              :vaNumber="store.transactionDetails?.vaNumber || 'ERROR'"
              :amount="store.transactionDetails?.amount || 0"
            />
            <div v-else class="alert alert-warning text-center">
              Gunakan No. VA: <strong>{{ store.transactionDetails?.vaNumber }}</strong>
            </div>
          </div>
         
          <div class="mt-4 pt-2 border-top">
             <div v-if="paymentStatus === 'pending'" class="text-center">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2 text-muted small">Menunggu pembayaran otomatis...</span>
            </div>

            <div v-if="paymentStatus === 'success'" class="alert alert-success text-center">
              <h5 class="alert-heading"><i class="bi bi-check-circle-fill"></i> Pembayaran Berhasil!</h5>
              <p class="mb-2">Terima kasih, pendaftaran Anda telah dikonfirmasi.</p>
              <button class="btn btn-primary w-100" @click="goToDashboard">
                Selesai & Ke Dashboard
              </button>
            </div>

            <div v-if="paymentStatus === 'expired'" class="alert alert-danger text-center">
              <h5 class="alert-heading"><i class="bi bi-x-circle-fill"></i> Waktu Habis</h5>
              <button class="btn btn-danger mt-2" @click="router.push('/')">Kembali ke Beranda</button>
            </div>
          </div>

        </div>
      </div>
    </div>
    
    <a href="https://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
      <i class="bi bi-whatsapp me-1"></i> Whatsapp
    </a>

    <ModalsQrCodeModal 
      :show="showQrModal" 
      :ticket="newlyCreatedTicket" 
      @close="handleCloseQr" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, defineAsyncComponent } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

// Import Logo Bank
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

// State
const paymentStatus = ref<'pending' | 'success' | 'expired'>('pending');
const countdown = ref('23:59:59');
const showQrModal = ref(false);

// Timer refs
let timerInterval: NodeJS.Timeout | null = null;
let simulationTimer: NodeJS.Timeout | null = null;

// Dynamic Bank Components
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

// Computed ticket object untuk modal QR
const newlyCreatedTicket = computed(() => {
  if (!store.dauroh || !store.participants.length) return undefined;
  
  return {
    dauroh: store.dauroh,
    participant: store.participants[0] 
  };
});

onMounted(() => {
  if (!store.transactionDetails) {
    router.replace('/checkout/summary');
    return;
  }
  startTimer(store.transactionDetails.expiryTime);
  startPaymentSimulation();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (simulationTimer) clearTimeout(simulationTimer);
});

const startPaymentSimulation = () => {
  // Simulasi sukses bayar dalam 5 detik
  simulationTimer = setTimeout(() => {
    if (paymentStatus.value === 'pending') {
      paymentStatus.value = 'success';
    }
  }, 5000);
};

// Watcher: Jika sukses, daftarkan user dan buka QR Modal
watch(paymentStatus, (newStatus) => {
  if (newStatus === 'success') {
    if (timerInterval) clearInterval(timerInterval);
    
    // 1. Simpan ke user store (Create Ticket)
    const registrationData = {
      dauroh: store.dauroh!,
      participants: store.participants,
    };
    userStore.registerDauroh(registrationData);

    // 2. Tampilkan Modal QR Code secara langsung
    // Beri delay sedikit agar transisi UI enak dilihat
    setTimeout(() => {
      showQrModal.value = true;
    }, 500);
  }
});

// Saat modal ditutup, langsung ke dashboard
const handleCloseQr = () => {
  showQrModal.value = false;
  goToDashboard();
};

const goToDashboard = () => {
  store.clearCheckout();
  router.push('/dashboard');
};

// --- Timer & Formatters ---
const startTimer = (expiryTime: number) => {
  timerInterval = setInterval(() => {
    const now = Date.now();
    const distance = expiryTime - now;
    if (distance < 0) {
      if (timerInterval) clearInterval(timerInterval);
      countdown.value = "Waktu Habis";
      if (paymentStatus.value === 'pending') paymentStatus.value = 'expired';
      return;
    }
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    countdown.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
};

const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = { 'BNI': bniLogo, 'BRI': briLogo, 'BSI': bsiLogo, 'CIMB': cimbLogo, 'DANAMON': danamonLogo, 'MANDIRI': mandiriLogo, 'PERMATA': permataLogo, 'QRIS': qrisLogo };
  return store.transactionDetails?.paymentMethod ? logos[store.transactionDetails.paymentMethod] : null;
});

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// Navigation Guard
onBeforeRouteLeave((to, from, next) => {
  if (paymentStatus.value === 'success' || to.path === '/dashboard') {
    next();
    return;
  }
  Swal.fire({
    title: 'Batalkan Pembayaran?',
    text: "Anda akan kehilangan sesi pembayaran ini.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Keluar',
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
.payment-logo-summary { max-height: 60px; max-width: 180px; object-fit: contain; }
</style>