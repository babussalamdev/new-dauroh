<template>
  <section class="hero-section">
    <div class="container text-center">
      <h1 class="display-5 fw-bold mb-5" style="font-family: 'Montserrat', sans-serif;">
        Dauroh <span class="text-primary">Babussalam</span>
      </h1>
      <div class="search-bar-hero mx-auto" style="max-width: 600px;">
        <CommonSearchBar />
      </div>

      <div class="button-container">
        <div class="button-item" @click="handleButtonClick('/qr')">
          <ButtonHeroButton :icon="QrCode" bgClass="btn-hero-custom" />
          <p class="mt-1">QR Code</p>
        </div>
        
        <div class="button-item" @click="handleButtonClick('/jadwal')">
          <ButtonHeroButton :icon="JadwalIcon" bgClass="btn-hero-custom" />
          <p class="mt-1">Jadwal</p>
        </div>

        <div class="button-item" @click="handleButtonClick('/sewa-booth')">
          <ButtonHeroButton :icon="BoothIcon" bgClass="btn-hero-custom" />
          <p class="mt-1">Sewa Booth</p>
        </div>
      </div>
    </div>

    </section>
</template>

<script setup>
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';

// Icons
import QrCode from '~/components/icons/QrIcon.vue';
import JadwalIcon from '~/components/icons/JadwalIcon.vue';
import BoothIcon from '~/components/icons/BoothIcon.vue';

const { isLoggedIn } = useAuth();
const userStore = useUserStore();
const toastStore = useToastStore();
const router = useRouter();

const handleButtonClick = (path) => {
  // 1. Cek Login
  if (!isLoggedIn.value) {
    toastStore.showToast({
      message: 'Mohon login atau daftar terlebih dahulu.',
      type: 'info'
    });
    return;
  }

  // 2. Routing Handler
  switch (path) {
    case '/qr':
      // Cek apakah user punya tiket aktif (Upcoming)
      if (userStore.getUpcomingTickets.length > 0) {
        // Arahkan ke dashboard tempat QR berada
        router.push('/dashboard');
      } else {
        toastStore.showToast({
          message: 'Anda belum memiliki tiket dauroh aktif.',
          type: 'info'
        });
      }
      break;
      
    case '/jadwal':
      router.push('/jadwal');
      break;
      
    case '/sewa-booth':
      router.push('/sewa-booth');
      break;
  }
};
</script>

<style scoped>
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