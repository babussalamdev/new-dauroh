<template>
  <div class="container py-5">
    <CommonLoadingSpinner v-if="daurohStore.loading.detailPublic && !dauroh" />

    <div v-else-if="dauroh" class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg">
          <img :src="dauroh.Picture" class="card-img-top" alt="Picture Dauroh" style="max-height: 400px; object-fit: cover;">
          <div class="card-body p-4">
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
            </ul>

            <div class="d-grid mt-4">
              <button class="btn btn-primary btn-lg" @click="handleRegisterClick">Daftar Sekarang</button>
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
import { useUserStore } from '~/stores/user'; // [PENTING] Import User Store
import { useAuth } from '~/composables/useAuth';

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const checkoutStore = useCheckoutStore();
const userStore = useUserStore(); // [PENTING] Init User Store
const { isLoggedIn } = useAuth();

const daurohSK = route.params.id ? String(route.params.id) : null;

// State untuk Modal QR (Gratis)
const showQrModal = ref(false);
const newlyCreatedTicket = ref(null);

const dauroh = computed(() => daurohStore.currentPublicDaurohDetail);

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

const showRegistrationModal = ref(false);

const handleRegisterClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login');
  } else if (dauroh.value && dauroh.value.SK) {
    router.push(`/dauroh/register/${dauroh.value.SK}`);
  }
};

const closeRegistrationModal = () => {
  showRegistrationModal.value = false;
};

// [BAGIAN INI YANG MENGATUR REDIRECT]
const handleRegistrationSubmit = (registrationData) => {
  closeRegistrationModal();

  // Cek Harga (Pastikan menjadi Number)
  const price = Number(registrationData.dauroh.Price || 0);

  if (price === 0) {
    // === JIKA GRATIS ===
    // 1. Langsung simpan tiket ke user store (bypass pembayaran)
    userStore.registerDauroh(registrationData);

    // 2. Siapkan data tiket dummy untuk ditampilkan di modal QR saat ini juga
    newlyCreatedTicket.value = {
      id: `TRX-${Date.now()}`, 
      dauroh: registrationData.dauroh,
      participants: registrationData.participants,
    };

    // 3. Tampilkan Modal QR Code (dengan sedikit delay agar smooth)
    setTimeout(() => {
       showQrModal.value = true;
    }, 300);

  } else {
    // === JIKA BERBAYAR ===
    // Masuk ke flow checkout seperti biasa
    checkoutStore.startCheckout(registrationData);
    router.push('/checkout/select');
  }
};

// Kalau modal QR ditutup, baru arahkan ke dashboard
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
</script>

<style scoped>
.card-img-top {
  border-bottom: 1px solid #eee;
}
.text-capitalize {
  text-transform: capitalize;
}
</style>