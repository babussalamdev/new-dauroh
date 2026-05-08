<template>
  <section class="hero-section">
    <div class="container text-center">
      
      <h1 class="display-5 txt-title fw-bold mb-5 text-dark">
        Event <span class="text-primary">Babussalam</span>
      </h1>
      
      <div class="search-bar-hero mx-auto" style="max-width: 600px;">
        <CommonSearchBar />
      </div>

      <div class="button-container mt-4">
        <div class="button-item" @click="handleButtonClick('/qr')">
          <ButtonHeroButton :icon="QrCode" :iconSize="35" bgClass="btn-hero-custom shadow-sm" />
          <p class="mt-2 mb-0 txt-caption fw-bold text-secondary">QR Code</p>
        </div>
        
        <div class="button-item" @click="handleButtonClick('/jadwal')">
          <ButtonHeroButton :icon="JadwalIcon" :iconSize="35" bgClass="btn-hero-custom shadow-sm" />
          <p class="mt-2 mb-0 txt-caption fw-bold text-secondary">Jadwal</p>
        </div>
        
        <div class="button-item" @click="handleButtonClick('/booth')">
          <ButtonHeroButton :icon="BoothIcon" :iconSize="35" bgClass="btn-hero-custom shadow-sm" />
          <p class="mt-2 mb-0 txt-caption fw-bold text-secondary">Booth</p>
        </div>
      </div>
      
    </div>
  </section>
</template>

<script setup>
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';
import { useAlert } from '~/utils/swal';

const { isLoggedIn } = useAuth();
const userStore = useUserStore();
const router = useRouter();
const { alert: swalAlert, confirm: swalConfirm } = useAlert();
const QrCode = ref('ic:baseline-qr-code-scanner')
const JadwalIcon = ref('ic:baseline-edit-calendar')
const BoothIcon = ref('ic:baseline-storefront')
const swalConfig = {
  customClass: {
    popup: 'rounded-4 border-0 shadow-lg p-4',
    title: 'fs-5 fw-bold text-dark mb-1',
    htmlContainer: 'text-muted small mb-3',
    confirmButton: 'btn btn-primary rounded-pill px-4 shadow-sm fw-medium',
    cancelButton: 'btn btn-light rounded-pill px-4 text-muted fw-medium me-2'
  },
  buttonsStyling: false,
  backdrop: `rgba(0,0,0,0.15) left top no-repeat`
};

const handleButtonClick = (path) => {
  // 1. Cek Login
  if (!isLoggedIn.value) {
    swalConfirm(
      'Login Diperlukan',
      'Silakan login terlebih dahulu untuk mengakses fitur ini.',
      'Login Sekarang'
    ).then((result) => {
      if (result.isConfirmed) {
        router.push('/auth');
      }
    });
    return;
  }

  // 2. Routing Handler
  switch (path) {
    case '/qr':
      if (userStore.getUpcomingTickets.length > 0) {
        router.push('/dashboard');
      } else {
        // 🟢 Pake swalConfirm buat nanya mau cari event apa nggak
        swalConfirm(
          'Belum Ada Tiket',
          'Anda belum memiliki tiket aktif. Yuk cari kajian menarik!',
          'Cari Event'
        ).then((result) => {
          if (result.isConfirmed) {
            const element = document.getElementById('tiketEvent');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
      break;

    case '/jadwal':
      router.push('/jadwal');
      break;

    case '/booth':
      router.push('/booth');
      break;
  }
};
</script>

<style scoped>
@import url("~/assets/css/components/hero.css");
</style>

<style>
.swal2-backdrop-show {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
</style>