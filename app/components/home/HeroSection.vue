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
          <ButtonHeroButton :icon="QrCode" bgClass="btn-hero-custom shadow-sm" />
          <p class="mt-2 mb-0 txt-caption fw-bold text-secondary">QR Code</p>
        </div>
        <div class="button-item" @click="handleButtonClick('/jadwal')">
          <ButtonHeroButton :icon="JadwalIcon" bgClass="btn-hero-custom shadow-sm" />
          <p class="mt-2 mb-0 txt-caption fw-bold text-secondary">Jadwal</p>
        </div>
        <div class="button-item" @click="handleButtonClick('/booth')">
          <ButtonHeroButton :icon="BoothIcon" bgClass="btn-hero-custom shadow-sm" />
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
import Swal from 'sweetalert2';

const { isLoggedIn } = useAuth();
const userStore = useUserStore();
const router = useRouter();
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
  if (!isLoggedIn.value) {
    Swal.fire({
      ...swalConfig,
      icon: 'info',
      title: 'Login Diperlukan',
      text: 'Silakan login terlebih dahulu untuk mengakses fitur ini.',
      confirmButtonText: 'Login Sekarang',
      showCancelButton: true,
      cancelButtonText: 'Nanti',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/auth');
      }
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
        Swal.fire({
          ...swalConfig,
          icon: 'question',
          iconColor: '#dee2e6',
          title: 'Belum Ada Tiket',
          text: 'Anda belum memiliki tiket aktif. Yuk cari kajian menarik!',
          confirmButtonText: 'Cari Event',
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          reverseButtons: true
        }).then((result) => {
          // Jika user klik 'Cari Event', scroll ke list event (opsional)
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