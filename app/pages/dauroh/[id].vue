<template>
  <div class="container py-5">
    <CommonLoadingSpinner v-if="daurohStore.loading.detailPublic && !dauroh" />

    <div v-else-if="dauroh" class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg">
          <img :src="dauroh.Picture" class="card-img-top" alt="Picture Dauroh" style="max-height: 400px; object-fit: cover;">
          <div class="card-body p-4">
            <div v-if="!dauroh.IsActive" class="alert alert-warning mb-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> 
                <strong>Event Non-Aktif</strong>. Event ini tidak terlihat di halaman publik.
            </div>

            <h1 class="card-title">{{ dauroh.Title }}</h1>
            <span v-if="dauroh.Gender" class="badge bg-primary-subtle text-primary-emphasis rounded-pill mb-3 text-capitalize">{{ dauroh.Gender }}</span>

            <h5 class="mt-4">Detail Acara</h5>
            <ul class="list-group list-group-flush">
              <li v-if="dauroh.Date && Object.keys(dauroh.Date).length > 0" class="list-group-item">
                <strong>Jadwal:</strong>
                <ul class="list-unstyled ps-3 mt-1">
                  <li v-for="(day, key) in dauroh.Date" :key="key">
                    <small> {{ day.date }} ({{ day.start_time }} - {{ day.end_time }})</small>
                  </li>
                </ul>
              </li>
              <li v-else class="list-group-item"><strong>Tanggal:</strong> Akan diumumkan</li>
              <li class="list-group-item"><strong>Lokasi:</strong> {{ dauroh.Place || 'Akan diumumkan' }}</li>
              <li class="list-group-item"><strong>Harga:</strong> {{ formatCurrency(dauroh.Price) }}</li>
              
              <li v-if="dauroh.Registration" class="list-group-item text-muted small">
                <i class="bi bi-clock"></i> Pendaftaran: 
                {{ formatDate(dauroh.Registration.start_registration) }} - {{ formatDate(dauroh.Registration.end_registration) }}
              </li>
            </ul>

            <div class="d-grid mt-4">
              <button 
                class="btn btn-lg" 
                :class="registrationStatus.canRegister ? 'btn-primary' : 'btn-secondary'"
                :disabled="!registrationStatus.canRegister"
                @click="handleRegisterClick"
              >
                {{ registrationStatus.message }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="!daurohStore.loading.detailPublic && !dauroh" class="text-center">
      <h2>Dauroh tidak ditemukan</h2>
      <p>Maaf, kami tidak dapat menemukan detail untuk dauroh yang Anda cari.</p>
      <NuxtLink to="/" class="btn btn-secondary">Kembali ke Beranda</NuxtLink>
    </div>

    <ModalsDaurohRegistrationModal
      v-if="showRegistrationModal"
      :show="showRegistrationModal"
      :dauroh="dauroh"
      @close="closeRegistrationModal"
      @submit="handleRegistrationSubmit"
    />

    <ModalsQrCodeModal 
      :show="showQrModal" 
      :ticket="newlyCreatedTicket" 
      @close="handleCloseQr" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDaurohStore } from '~/stores/dauroh';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const checkoutStore = useCheckoutStore();
const userStore = useUserStore();
const { isLoggedIn } = useAuth();

const daurohSK = route.params.id ? String(route.params.id) : null;
const showQrModal = ref(false);
const newlyCreatedTicket = ref(null);
const showRegistrationModal = ref(false);

const dauroh = computed(() => daurohStore.currentPublicDaurohDetail);

// [REVISI] Logic Gate Pendaftaran + Safe Date Parsing
const registrationStatus = computed(() => {
  if (!dauroh.value) return { canRegister: false, message: 'Memuat...' };
  
  // 1. Cek Active
  if (!dauroh.value.IsActive) {
      return { canRegister: false, message: 'Event Tidak Aktif' };
  }

  // 2. Cek Registration Object
  if (!dauroh.value.Registration) return { canRegister: true, message: 'Daftar Sekarang' };

  const now = new Date();
  // REVISI: replace(' ', 'T') biar aman di Safari/iOS
  const start = new Date(dauroh.value.Registration.start_registration.replace(' ', 'T'));
  const end = new Date(dauroh.value.Registration.end_registration.replace(' ', 'T'));

  if (now < start) {
    return { canRegister: false, message: 'Pendaftaran Belum Dibuka' };
  } else if (now > end) {
    return { canRegister: false, message: 'Pendaftaran Ditutup' };
  } else {
    return { canRegister: true, message: 'Daftar Sekarang' };
  }
});

onMounted(() => {
  if (daurohSK) {
    daurohStore.fetchPublicDaurohDetail(daurohSK);
  }
});

watch(dauroh, (newDauroh) => {
  useHead({
    title: newDauroh ? newDauroh.Title : 'Detail Dauroh',
  });
}, { immediate: true });


const handleRegisterClick = () => {
  if (!registrationStatus.value.canRegister) return; 

  if (!isLoggedIn.value) {
    router.push('/login');
  } else if (dauroh.value && dauroh.value.SK) {
    router.push(`/dauroh/register/${dauroh.value.SK}`);
  }
};

const closeRegistrationModal = () => {
  showRegistrationModal.value = false;
};

const handleRegistrationSubmit = (registrationData) => {
  closeRegistrationModal();
  const price = Number(registrationData.dauroh.Price || 0);

  if (price === 0) {
    userStore.registerDauroh(registrationData);
    newlyCreatedTicket.value = {
      id: `TRX-${Date.now()}`, 
      dauroh: registrationData.dauroh,
      participants: registrationData.participants,
    };
    setTimeout(() => { showQrModal.value = true; }, 300);
  } else {
    checkoutStore.startCheckout(registrationData);
    router.push('/checkout/select');
  }
};

const handleCloseQr = () => {
  showQrModal.value = false;
  router.push('/dashboard');
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

// [REVISI] Format Date biar nampilin JAM & replace spasi
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Replace spasi ke T biar aman
    const safeDate = dateStr.replace(' ', 'T');
    return new Date(safeDate).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit' // Tambahan biar jam muncul
    });
};
</script>

<style scoped>
.card-img-top {
  border-bottom: 1px solid #eee;
}
.text-capitalize {
  text-transform: capitalize;
}
</style>