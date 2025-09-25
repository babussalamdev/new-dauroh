<template>
  <section class="hero-section">
    <div class="container text-center">
      <h1 class="display-5 fw-bold mb-5" style="font-family: 'Montserrat', sans-serif;">
        Dauroh <span class="text-primary">Babussalam</span>
      </h1>
      <div class="search-bar-hero mx-auto" style="max-width: 600px;">
        <SearchBar />
      </div>

      <div class="button-container">
        <div class="button-item" @click="handleButtonClick('/qr')">
          <HeroButton :icon="QrCode" bgClass="btn-hero-custom" />
          <p class="mt-1">QR Code</p>
        </div>
        
        <div class="button-item" @click="handleButtonClick('/jadwal')">
          <HeroButton :icon="JadwalIcon" bgClass="btn-hero-custom" />
          <p class="mt-1">Jadwal</p>
        </div>

        <div class="button-item" @click="handleButtonClick('/sewa-booth')">
          <HeroButton :icon="BoothIcon" bgClass="btn-hero-custom" />
          <p class="mt-1">Sewa Booth</p>
        </div>
      </div>
    </div>

    <QrCodeModal :show="showQrModal" @close="closeQrModal" />

    </section>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast'; // <-- DITAMBAHKAN
import SearchBar from '~/components/common/SearchBar.vue';
import HeroButton from '~/components/button/HeroButton.vue';
import QrCode from '~/components/icons/QrIcon.vue';
import JadwalIcon from '~/components/icons/JadwalIcon.vue';
import BoothIcon from '~/components/icons/BoothIcon.vue';
import QrCodeModal from '~/components/modals/QrCodeModal.vue';

const { isLoggedIn } = useAuth();
const userStore = useUserStore();
const toastStore = useToastStore();
const router = useRouter();

const showQrModal = ref(false);
// State untuk InfoModal dihapus
// const showInfoModal = ref(false);
// const infoModalContent = ref({ title: '', message: '' });

const handleButtonClick = (path) => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }

  switch (path) {
    case '/qr':
      handleQrClick();
      break;
    case '/jadwal':
      router.push('/jadwal');
      break;
    case '/sewa-booth':
      router.push('/sewa-booth');
      break;
  }
};

const handleQrClick = () => {
  if (userStore.upcomingDauroh.length > 0) {
    showQrModal.value = true;
  } else {
    // --- DIGANTI DARI MODAL MENJADI TOAST NOTIFICATION ---
    toastStore.showToast({
      message: 'Anda belum terdaftar pada dauroh manapun untuk menampilkan QR Code.',
      type: 'info'
    });
  }
};

const closeQrModal = () => (showQrModal.value = false);
// Fungsi untuk InfoModal dihapus
// const closeInfoModal = () => (showInfoModal.value = false);
</script>

<style scoped>
/* CSS tidak perlu diubah */
.hero-section {
  background: #ffffff;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.hero-section h1 {
  font-size: 30px;
  color: #333;
}

.search-bar-hero {
  margin: 0 auto;
}

:deep(.btn-hero-custom) {
  background-color: #daecff;
  border: 1.5px solid #79bcff;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;
  display:flexbox;
  align-items: center;
  justify-content: center;
}

:deep(.btn-hero-custom:hover) {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

:deep(.hero-icon) {
  font-size: 50px;
}

.button-container {
  padding-top: 1%;
  display: flex;
  justify-content: center;
}

.button-item {
  flex: 1 1 auto;
  max-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-item p {
  font-size: 13px;
  color: #555;
  font-weight: 500;
  margin-bottom: 0;
}
</style>