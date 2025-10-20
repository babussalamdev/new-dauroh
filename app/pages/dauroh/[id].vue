<template>
  <div class="container py-5">
    <div v-if="dauroh" class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg">
          <img :src="dauroh.poster" class="card-img-top" alt="Poster Dauroh" style="max-height: 400px; object-fit: cover;">
          <div class="card-body p-4">
            <h1 class="card-title">{{ dauroh.title }}</h1>
            <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill mb-3">{{ dauroh.genre }}</span>
            
            <h5 class="mt-4">Deskripsi</h5>
            <p>
              {{ dauroh.description || 'Deskripsi untuk dauroh ini belum tersedia.' }}
            </p>

            <h5 class="mt-4">Detail Acara</h5>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>Tanggal:</strong> {{ dauroh.date || 'Akan diumumkan' }}</li>
              <li class="list-group-item"><strong>Pemateri:</strong> {{ dauroh.pemateri || 'Akan diumumkan' }}</li>
              <li class="list-group-item"><strong>Lokasi:</strong> {{ dauroh.tempat || 'Akan diumumkan' }}</li>
            </ul>

            <div class="d-grid mt-4">
              <button class="btn btn-primary btn-lg" @click="handleRegisterClick">Daftar Sekarang</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center">
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
import { ref, computed } from 'vue';
import { useDaurohStore } from '~/stores/dauroh';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const userStore = useUserStore();
const { isLoggedIn } = useAuth(); // Gunakan isLoggedIn dari useAuth

const daurohId = parseInt(route.params.id);

const dauroh = computed(() => {
  // untuk bagian integrasi be nya: Seharusnya ini memanggil API untuk mendapatkan detail satu dauroh
  const allDauroh = [
    ...daurohStore.tiketDauroh
  ];
  return allDauroh.find(d => d.id === daurohId);
});

useHead({
  title: dauroh.value ? dauroh.value.title : 'Detail Dauroh',
});

const showRegistrationModal = ref(false);
const showQrModal = ref(false);

const handleRegisterClick = () => {
  if (!isLoggedIn.value) { // Gunakan isLoggedIn dari composable
    router.push('/login');
  } else {
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
</script>

<style scoped>
.card-img-top {
  border-bottom: 1px solid #eee;
}
</style>