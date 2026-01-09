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
        
        <h2 class="fw-bold mb-3 text-primary">
          {{ formatCurrency(Number(store.transactionDetails?.amount || 0)) }}
        </h2>

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
              :amount="Number(store.transactionDetails?.amount || 0)"
            />
            
            <div v-else class="alert alert-warning text-center">
              Gunakan No. VA: <strong>{{ store.transactionDetails?.vaNumber }}</strong>
            </div>
          </div>
          
          <div class="mt-4 pt-2 border-top">
             <div v-if="paymentStatus === 'pending'" class="text-center">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2 text-muted small">Mengecek pembayaran...</span>
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
import { useNuxtApp } from '#app'; 
import Swal from 'sweetalert2';

// Import Assets
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
const { $apiFlip } = useNuxtApp(); // Akses API Flip kalau mau cek status

// State
const paymentStatus = ref<'pending' | 'success' | 'expired'>('pending');
const countdown = ref('...');
const showQrModal = ref(false);

// Interval Variable
let timerInterval: NodeJS.Timeout | null = null;
let pollingInterval: NodeJS.Timeout | null = null; // Buat cek status ke server

// --- Components & Computed ---
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

const newlyCreatedTicket = computed(() => {
  if (!store.dauroh || !store.participants.length) return undefined;
  return { dauroh: store.dauroh, participants: store.participants };
});

const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = { 'BNI': bniLogo, 'BRI': briLogo, 'BSI': bsiLogo, 'CIMB': cimbLogo, 'DANAMON': danamonLogo, 'MANDIRI': mandiriLogo, 'PERMATA': permataLogo, 'QRIS': qrisLogo };
  return store.transactionDetails?.paymentMethod ? logos[store.transactionDetails.paymentMethod] : null;
});

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// --- Lifecycle ---
onMounted(() => {
  // 1. Cek Data Transaksi
  if (!store.transactionDetails) {
    router.replace('/checkout/summary');
    return;
  }

  // 2. Setup Timer (Handle String/Number/Undefined)
  const rawExpiry = store.transactionDetails.expiryTime;
  let expiryTimestamp = Date.now() + (24 * 60 * 60 * 1000); // Default 24 jam

  if (typeof rawExpiry === 'string') {
    expiryTimestamp = new Date(rawExpiry).getTime();
  } else if (typeof rawExpiry === 'number') {
    expiryTimestamp = rawExpiry;
  }
  startTimer(expiryTimestamp);

  // 3. PILIH SALAH SATU MODE DI BAWAH INI:
  
  // MODE A: SIMULASI (Cocok buat testing tanpa backend real)
  startPaymentSimulation(); 

  // MODE B: REAL (Uncomment ini kalau API Flip udah jalan)
  // startPollingStatus();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (pollingInterval) clearInterval(pollingInterval);
});

// --- Logic Status ---

// MODE A: Simulasi (Otomatis sukses dalam 5 detik)
const startPaymentSimulation = () => {
  console.log("Mode Simulasi: Pembayaran akan sukses dalam 5 detik...");
  setTimeout(() => {
    if (paymentStatus.value === 'pending') {
      paymentStatus.value = 'success';
    }
  }, 5000);
};

// MODE B: Polling Real (Cek ke server setiap 5 detik)
/*
const startPollingStatus = () => {
  pollingInterval = setInterval(async () => {
    try {
      if(!store.transactionDetails?.link_id) return;

      // Contoh endpoint cek status
      const response = await $apiFlip.get(`/check-status/${store.transactionDetails.link_id}`);
      const status = response.data.status; // 'SUCCESSFUL', 'PENDING', etc

      if (status === 'SUCCESSFUL') {
         paymentStatus.value = 'success';
         if(pollingInterval) clearInterval(pollingInterval);
      } else if (status === 'CANCELLED' || status === 'FAILED') {
         // Handle failed logic here
      }
    } catch (err) {
      console.error("Gagal cek status:", err);
    }
  }, 5000); // Cek tiap 5 detik
};
*/

// Watcher: Saat Status Berubah jadi SUCCESS
watch(paymentStatus, (newStatus) => {
  if (newStatus === 'success') {
    if (timerInterval) clearInterval(timerInterval);
    if (pollingInterval) clearInterval(pollingInterval);
    
    // 👇 PERBAIKAN DI SINI:
    // Tambahkan 'as any' biar TypeScript gak protes soal properti yang "hilang"
    const registrationData = {
      dauroh: store.dauroh as any, 
      participants: store.participants as any[],
    };
    
    userStore.registerDauroh(registrationData);

    setTimeout(() => {
      showQrModal.value = true;
    }, 500);
  }
});

const handleCloseQr = () => {
  showQrModal.value = false;
};

const goToDashboard = () => {
  store.clearCheckout();
  router.push('/dashboard');
};

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

// Guard Navigation (Cegah user back sembarangan)
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