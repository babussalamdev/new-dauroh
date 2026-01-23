<template>
  <div>
    <div class="card shadow-sm">
      <div class="card-body p-4 text-center">

        <img 
          v-if="paymentLogoUrl" 
          :src="paymentLogoUrl" 
          :alt="store.transactionDetails?.paymentMethod || 'Bank'" 
          class="payment-logo-summary mb-3"
        >
        
        <p class="text-muted mb-1">Jumlah yang harus dibayar</p>
        
        <h2 class="fw-bold mb-3 text-primary">
          {{ formatCurrency(Number(store.transactionDetails?.amount || 0)) }}
        </h2>

        <hr class="my-4">

        <div class="mb-4">
           <BankPaymentCountdown />
        </div>

        <div class="text-start">
          <div v-if="currentStatus === 'PENDING' || currentStatus === 'pending'">
             <h6 class="mb-3 text-center">Panduan Pembayaran</h6>
             
             <component 
              :is="currentBankComponent" 
              v-if="currentBankComponent"
              :vaNumber="store.transactionDetails?.vaNumber || 'ERROR'"
              :amount="Number(store.transactionDetails?.amount || 0)"
            />
            
            <div v-else class="alert alert-warning text-center">
              Gunakan No. VA: <strong>{{ store.transactionDetails?.vaNumber || '-' }}</strong>
            </div>

            <div class="text-center mt-3 pt-2 border-top">
              <div class="spinner-grow spinner-grow-sm text-primary" role="status"></div>
              <span class="ms-2 text-muted small fst-italic">Menunggu pembayaran otomatis...</span>
            </div>
          </div>
          
          <div v-else-if="isPaid" class="alert alert-success text-center">
             <h5 class="alert-heading"><i class="bi bi-check-circle-fill"></i> Pembayaran Berhasil!</h5>
             <p class="mb-2">Terima kasih, pendaftaran Anda telah dikonfirmasi.</p>
             <button class="btn btn-primary w-100 mt-2" @click="goToDashboard">
                Selesai & Ke Dashboard
             </button>
          </div>

          <div v-else-if="currentStatus === 'EXPIRED' || currentStatus === 'expired'" class="alert alert-danger text-center">
             <h5 class="alert-heading"><i class="bi bi-x-circle-fill"></i> Waktu Habis</h5>
             <p>Maaf, batas waktu pembayaran telah berakhir.</p>
             <button class="btn btn-danger mt-2" @click="router.push('/')">Kembali ke Beranda</button>
          </div>

        </div>
      </div>
    </div>
    
    <a href="https://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
      <i class="bi bi-whatsapp me-1"></i> Whatsapp
    </a>

    <ModalsQrCodeModal 
      v-if="showQrModal"
      :show="showQrModal" 
      :ticket="newlyCreatedTicket" 
      @close="handleCloseQr" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

// Import Assets (Sama kayak sebelumnya)
import bniLogo from '~/assets/img/bank/bni.png';
import briLogo from '~/assets/img/bank/bri.png';
import bsiLogo from '~/assets/img/bank/bsi.png';
import cimbLogo from '~/assets/img/bank/cimb.png';
import danamonLogo from '~/assets/img/bank/danamon.png';
import mandiriLogo from '~/assets/img/bank/mandiri.png';
import permataLogo from '~/assets/img/bank/permata.png';
import qrisLogo from '~/assets/img/bank/qris.png';

// HAPUS definePageMeta (karena ini component)

const store = useCheckoutStore();
const userStore = useUserStore();
const router = useRouter();
const showQrModal = ref(false);

// --- Computed Helpers ---
const currentStatus = computed(() => store.transactionDetails?.status || 'PENDING');

const isPaid = computed(() => {
  const s = (currentStatus.value || '').toUpperCase();
  return ['PAID', 'SUCCESS', 'SETTLED', 'LUNAS'].includes(s);
});

const newlyCreatedTicket = computed(() => {
  if (!store.dauroh || !store.participants.length) return undefined;
  return { dauroh: store.dauroh, participants: store.participants };
});

const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = { 'BNI': bniLogo, 'BRI': briLogo, 'BSI': bsiLogo, 'CIMB': cimbLogo, 'DANAMON': danamonLogo, 'MANDIRI': mandiriLogo, 'PERMATA': permataLogo, 'QRIS': qrisLogo };
  const method = store.transactionDetails?.paymentMethod;
  return method ? logos[method.toUpperCase()] : null;
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
  const method = store.transactionDetails?.paymentMethod?.toUpperCase(); 
  return method ? BankComponents[method] : null;
});

// --- Lifecycle & Watcher ---
onMounted(() => {
 // Simpan record "Pending" ke userStore pas instruksi dibuka
 if (store.transactionDetails && store.dauroh) {
     userStore.registerDauroh({
         dauroh: store.dauroh,
         participants: store.participants,
         transactionDetails: store.transactionDetails 
     });
 }
});

// Deteksi Lunas via WebSocket/Store Update
watch(isPaid, (paid) => {
  if (paid) {
    // Update status di Frontend Store
    const registrationData = {
      dauroh: store.dauroh as any, 
      participants: store.participants as any[],
    };
    userStore.registerDauroh(registrationData); // Ini harusnya update status jd 'PAID'

    // Tampilkan notif & modal
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Alhamdulillah!',
        text: 'Pembayaran telah diterima.',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
          showQrModal.value = true;
      });
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

// Guard Navigation (Cegah user keluar tanpa sengaja)
onBeforeRouteLeave((to, from, next) => {
  if (isPaid.value || to.path === '/dashboard') {
    next();
    return;
  }
  
  Swal.fire({
    title: 'Keluar halaman?',
    text: "Anda bisa melanjutkan pembayaran nanti lewat menu Riwayat.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      store.clearCheckout(); // [PENTING] Bersihkan store kalau user nyerah
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