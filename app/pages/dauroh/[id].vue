// app/pages/dauroh/[id].vue
<template>
  <div class="container py-5">
     <CommonLoadingSpinner v-if="daurohStore.loading.tiketDauroh && !dauroh" />

    <div v-else-if="dauroh" class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg">
          <img :src="dauroh.poster" class="card-img-top" alt="Poster Dauroh" style="max-height: 400px; object-fit: cover;">
          <div class="card-body p-4">
            <h1 class="card-title">{{ dauroh.Title }}</h1>
            <span v-if="dauroh.Gender" class="badge bg-primary-subtle text-primary-emphasis rounded-pill mb-3 text-capitalize">{{ dauroh.Gender }}</span>

            <h5 class="mt-4">Deskripsi</h5>
            <p>
              {{ dauroh.description || 'Deskripsi untuk dauroh ini belum tersedia.' }}
            </p>

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

              <li class="list-group-item"><strong>Pemateri:</strong> {{ dauroh.pemateri || 'Akan diumumkan' }}</li>
              <li class="list-group-item"><strong>Lokasi:</strong> {{ dauroh.Place || 'Akan diumumkan' }}</li>
               <li class="list-group-item"><strong>Harga:</strong> {{ formatCurrency(dauroh.price) }}</li>
            </ul>

            <div class="d-grid mt-4">
              <button class="btn btn-primary btn-lg" @click="handleRegisterClick">Daftar Sekarang</button>
            </div>
          </div>
        </div>
      </div>
    </div>
     <div v-else-if="!daurohStore.loading.tiketDauroh && !dauroh" class="text-center">
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
      v-if="showQrModal"
      :show="showQrModal"
      @close="closeQrModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'; // Import onMounted
import { useDaurohStore } from '~/stores/dauroh';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const userStore = useUserStore();
const { isLoggedIn } = useAuth();

const daurohId = route.params.id ? parseInt(route.params.id) : null;

// Ambil data detail dauroh dari state publik (tiketDauroh)
const dauroh = computed(() => {
  if (!daurohId) return null;
  // Gunakan state tiketDauroh untuk mencari detailnya
  return daurohStore.tiketDauroh.find(d => d.id === daurohId);
});

// Panggil fetch data publik saat komponen dimuat,
// Store akan handle jika data sudah ada
onMounted(() => {
  daurohStore.fetchPublicTiketDauroh();
});

 // Update judul halaman setelah data dauroh didapatkan
 watch(dauroh, (newDauroh) => {
     useHead({
         title: newDauroh ? newDauroh.Title : 'Detail Dauroh',
     });
 }, { immediate: true }); // immediate agar langsung set judul awal

const showRegistrationModal = ref(false);
const showQrModal = ref(false);

const handleRegisterClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login');
  } else if (dauroh.value) { // Pastikan dauroh ada sebelum membuka modal
    showRegistrationModal.value = true;
  }
};

const closeRegistrationModal = () => {
  showRegistrationModal.value = false;
};

const handleRegistrationSubmit = (registrationData) => {
  closeRegistrationModal();
  userStore.registerDauroh(registrationData);
  showQrModal.value = true;
};

const closeQrModal = () => {
  showQrModal.value = false;
};

 // Helper currency formatter
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