<template>
  <div>
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body p-4 text-center">

        <img v-if="paymentLogoUrl" :src="paymentLogoUrl" :alt="store.transactionDetails?.paymentMethod || 'Bank'"
          class="payment-logo-summary mb-3">

        <p class="text-muted mb-1 txt-caption fw-bold text-uppercase">Jumlah yang harus dibayar</p>

        <h2 class="fw-bold mb-3 text-primary txt-title fs-2">
          {{ formatCurrency(Number(store.transactionDetails?.amount || 0)) }}
        </h2>

        <hr class="my-4 text-muted opacity-25">

        <div class="mb-4">
          <BankPaymentCountdown />
        </div>

        <div class="text-start">
          <div v-if="currentStatus === 'PENDING'">
            <h6 class="mb-3 text-center txt-subtitle fw-bold text-dark">Panduan Pembayaran</h6>

            <component :is="currentBankComponent" v-if="currentBankComponent"
              :vaNumber="store.transactionDetails?.vaNumber || 'ERROR'"
              :amount="Number(store.transactionDetails?.amount || 0)" />

            <div v-else class="alert alert-warning text-center txt-body rounded-3 border-0">
              Gunakan No. VA: <strong class="fw-bold fs-5 d-block mt-1">{{ store.transactionDetails?.vaNumber || '-' }}</strong>
            </div>

            <div class="text-center mt-3 pt-3 border-top">
              <div class="spinner-grow spinner-grow-sm text-primary" role="status"></div>
              <span class="ms-2 text-muted txt-caption fw-bold fst-italic">Menunggu pembayaran otomatis...</span>
            </div>
            <div class="text-center mt-4">
              <button class="btn btn-light border px-4 rounded-pill txt-body fw-bold text-muted" @click="handleExit">
                <i class="bi bi-clock-history me-1"></i> Bayar Nanti
              </button>
            </div>

          </div>

          <div v-else-if="currentStatus === 'EXPIRED'" class="alert alert-danger text-center rounded-4 border-0 p-4">
            <h5 class="alert-heading txt-subtitle fw-bold text-danger"><i class="bi bi-x-circle-fill me-2"></i>Waktu Habis</h5>
            <p class="txt-body mb-3 text-danger-emphasis">Sesi pembayaran telah berakhir.</p>
            <button class="btn btn-danger px-4 rounded-pill txt-body fw-bold shadow-sm" @click="handleExpiredState">
              Pilih Metode Pembayaran Ulang
            </button>
          </div>

        </div>
      </div>
    </div>

    <a href="https://wa.me/628123456789" target="_blank" class="btn btn-success whatsapp-fab rounded-pill shadow-sm px-3 txt-body fw-bold d-inline-flex align-items-center mt-4">
      <i class="bi bi-whatsapp me-2 fs-5"></i> Bantuan
    </a>

    <ModalsQrCodeModal v-if="showQrModal" :show="showQrModal" :ticket="newlyCreatedTicket" :participant="store.participants[0]" @close="handleCloseQr" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useNuxtApp, useRuntimeConfig } from '#app';
import { useAlert } from '~/utils/swal';
import ModalsQrCodeModal from '~/components/modals/QrCodeModal.vue';
import { useAuth } from '~/composables/useAuth';

// Import Assets
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

useHead({ title: 'Instruksi Pembayaran' });

const { $connectSocket, $closeSocket } = useNuxtApp();
const config = useRuntimeConfig();
const store = useCheckoutStore();
const userStore = useUserStore();
const router = useRouter();
const { alert: swalAlert, confirm: swalConfirm } = useAlert();
const showQrModal = ref(false);
const isExplicitExit = ref(false);

// --- Computed Helpers ---
const currentStatus = computed(() => {
  if (store.isExpired) return 'EXPIRED';
  const rawStatus = (store.transactionDetails?.status || 'PENDING').toUpperCase();

  if (['SUCCESSFUL'].includes(rawStatus)) return 'SUCCESSFUL';
  if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(rawStatus)) return 'EXPIRED';

  return 'PENDING';
});

const isPaid = computed(() => currentStatus.value === 'SUCCESSFUL');

const newlyCreatedTicket = computed(() => {
  if (!store.event || !store.participants.length) return undefined;
  return { event: store.event, participants: store.participants };
});

const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = {
    'BNI': bniLogo, 'BRI': briLogo, 'BSI': bsiLogo, 'CIMB': cimbLogo,
    'DANAMON': danamonLogo, 'MANDIRI': mandiriLogo, 'PERMATA': permataLogo, 'QRIS': qrisLogo
  };

  // [FIX 2] MAPPING BSM -> BSI BIAR LOGO MUNCUL
  let method = (store.transactionDetails?.paymentMethod || '').toUpperCase();
  if (method === 'BSM') method = 'BSI';

  return logos[method] || null;
});

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// --- Dynamic Bank Components ---
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
  let method = (store.transactionDetails?.paymentMethod || '').toUpperCase();
  if (method === 'BSM') method = 'BSI';

  return BankComponents[method] || null;
});

// --- Helper: Handle Expired Logic ---
const handleExpiredState = () => {
  isExplicitExit.value = true;
  swalAlert(
    'Waktu Habis!', 
    'Sesi pembayaran Anda telah berakhir.', 
    'error'
  ).then(() => {
    store.clearCheckout();
    router.push('/history');
  });
};

const handleExit = () => {
  isExplicitExit.value = true;
  router.push('/dashboard'); 
};

// --- Lifecycle & Watcher ---
onMounted(() => {
  if (currentStatus.value === 'SUCCESSFUL') {
    store.setStep('success');
    return; 
  }

  if (store.transactionDetails && store.event && currentStatus.value !== 'SUCCESSFUL') {
    userStore.registerEvent({
      event: store.event,
      participants: store.participants,
      transactionDetails: store.transactionDetails
    });
  }

  if (currentStatus.value === 'EXPIRED') {
    handleExpiredState();
  }
});

// --- Watcher Status ---
watch(currentStatus, (newStatus) => {
  const status = (newStatus || '').toUpperCase();

  if (status === 'EXPIRED') {
    handleExpiredState();
  }
  else if (status === 'SUCCESSFUL') {
    userStore.registerEvent({
      event: store.event,
      participants: store.participants,
    });
    store.setStep('success');
  }
});

const handleCloseQr = () => {
  showQrModal.value = false;
};

// Guard Navigation
onBeforeRouteLeave((to, from, next) => {
  if (isPaid.value) {
    next();
    return;
  }
  
  if (to.path === from.path) {
    next();
    return;
  }
  if (isExplicitExit.value || to.path === '/dashboard' || to.path === '/history') {
    next();
    setTimeout(() => {
      store.clearCheckout();
    }, 300);
    return;
  }

  swalConfirm(
    'Keluar halaman?',
    'Anda bisa melanjutkan pembayaran nanti lewat menu Riwayat.',
    'Ya, Keluar'
  ).then((result) => {
    if (result.isConfirmed) {
      next();
    
      setTimeout(() => {
        store.clearCheckout();
      }, 300);
    } else {
      next(false);
    }
  });
});
</script>

<style scoped>
.payment-logo-summary {
  max-height: 60px;
  max-width: 180px;
  object-fit: contain;
}
</style>