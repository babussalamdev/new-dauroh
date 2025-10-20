<template>
  <div class="user-dashboard bg-light">
    <div class="container py-5">
      <div v-if="isLoggedIn">
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white py-3"> 
                <h5 class="mb-0"><i class="bi bi-calendar-check me-2"></i>Dauroh yang Akan Datang</h5>
              </div>
              <div class="card-body">
                <div v-if="userStore.getUpcomingDauroh.length > 0">
                  <div v-for="movie in userStore.getUpcomingDauroh" :key="movie.id" class="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img :src="movie.poster" class="rounded shadow-sm" style="width: 70px; height: 100px; object-fit: cover;" :alt="movie.title">
                    <div class="ms-3 flex-grow-1">
                      <h6 class="fw-bold mb-1">{{ movie.title }}</h6>
                      <p class="text-muted mb-1 small">{{ movie.genre }}</p>
                      <span class="badge bg-success">Terdaftar</span>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openQrModal">Lihat E-Tiket</button>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-4">
                  <p>Anda belum terdaftar di Dauroh manapun.</p>
                  <NuxtLink to="/" class="btn btn-primary">Cari Dauroh Sekarang</NuxtLink>
                </div>
              </div>
            </div>

            <div class="card shadow-sm">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Riwayat Dauroh</h5>
              </div>
              <div class="card-body">
                <div v-if="userStore.getHistoryDauroh.length > 0">
                  <div v-for="movie in userStore.getHistoryDauroh" :key="movie.id" class="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img :src="movie.poster" class="rounded shadow-sm" style="width: 70px; height: 100px; object-fit: cover;" :alt="movie.title">
                    <div class="ms-3 flex-grow-1">
                      <h6 class="fw-bold mb-1">{{ movie.title }}</h6>
                      <p class="text-muted mb-1 small">{{ movie.genre }}</p>
                      <span class="badge bg-secondary">Selesai</span>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm" @click="downloadCertificate(movie)">Unduh Sertifikat</button>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-3">
                  <p class="mb-0">Belum ada riwayat dauroh yang selesai.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0"><i class="bi bi-person-fill me-2"></i>Profil Saya</h5>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex align-items-center">
                  <i class="bi bi-person-circle fs-2 me-3 text-primary"></i>
                  <div>
                    <h6 class="fw-bold mb-0">{{ userName }}</h6>
                    <span class="text-muted small">{{ userEmail }}</span>
                  </div>
                </li>
                <li class="list-group-item">
                  <small class="text-muted">Tanggal Bergabung</small>
                  <p class="fw-bold mb-0">{{ joinedDate }}</p>
                </li>
              </ul>
              <div class="card-body">
                <NuxtLink to='/profile/edit' class="btn btn-outline-secondary w-100">
                  Edit Profil</NuxtLink>
              </div>
            </div>
            <div class="card shadow-sm">
               <div class="card-header bg-white py-3">
                <h5 class="mb-0"><i class="bi bi-question-circle-fill me-2"></i>Bantuan</h5>
              </div>
               <div class="list-group list-group-flush">
                <a href="#" class="list-group-item list-group-item-action">Pusat Bantuan</a>
                <a href="#" class="list-group-item list-group-item-action">Hubungi Kami</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ModalsQrCodeModal :show="showQrModal" @close="closeQrModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';

const { user, isLoggedIn, userName, userEmail } = useAuth();
const userStore = useUserStore();

const showQrModal = ref(false);
const openQrModal = () => (showQrModal.value = true);
const closeQrModal = () => (showQrModal.value = false);

// untuk bagian integrasi be nya: Properti ini akan mengambil data dari 'user' object
const joinedDate = computed(() => {
  // Anda perlu menambahkan properti `joined_date` atau sejenisnya pada data user dari backend
  // Contoh: return new Date(user.value?.joined_date).toLocaleDateString('id-ID');
  return user.value?.joined_date || 'Tanggal tidak tersedia';
});

const downloadCertificate = (dauroh) => {
  Swal.fire({
    title: 'Fitur Segera Hadir',
    text: `Fitur unduh sertifikat untuk "${dauroh.title}" sedang dalam pengembangan.`,
    icon: 'info',
    confirmButtonText: 'Mengerti'
  });
};
</script>

<style scoped>
.user-dashboard {
  min-height: calc(100vh - 56px);
}
.card {
  border: none;
}
.card-header {
  border-bottom: 0;
}
</style>