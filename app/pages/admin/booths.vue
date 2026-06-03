<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>
        <li class="breadcrumb-item active txt-caption fw-bold text-secondary" aria-current="page">Pengajuan Booth</li>
      </ol>
    </nav>

    <div class="card content-card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold txt-subtitle text-dark text-truncate w-100">Pengajuan Booth</h6>
      </div>
      <div class="card-body">
        
        <CommonLoadingSpinner v-if="store.loading" class="my-5" />

        <div class="table-responsive" v-else-if="!store.loading && store.sortedSubmissions.length > 0">
          <table class="table table-hover mb-0" style="min-width: 800px;">
            <thead>
              <tr>
                <th class="ps-4">NAMA BOOTH</th>
                <th>NAMA KONTAK</th>
                <th>EMAIL</th>
                <th>TELEPON</th>
                <th>STATUS</th>
                <th class="text-center pe-4">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in store.sortedSubmissions" :key="sub.SK">
                <td class="ps-4 fw-bold text-dark">{{ sub.boothName }}</td>
                <td>{{ sub.contactName }}</td>
                <td>{{ sub.email }}</td>
                <td>{{ sub.phone }}</td>
                <td>
                  <span :class="['badge rounded-pill px-3', getStatusBadge(sub.status)]" style="font-size: 0.75rem;">{{ sub.status }}</span>
                </td>
                <td class="text-center pe-4">
                  <template v-if="sub.status === 'Menunggu'">
                    <button class="btn btn-sm text-success p-0 border-0 bg-transparent shadow-none me-2" title="Setujui" @click="store.updateSubmissionStatus(sub.SK, 'Disetujui')">
                      <i class="bi bi-check-circle-fill fs-5"></i>
                    </button>
                    <button class="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none" title="Tolak" @click="store.updateSubmissionStatus(sub.SK, 'Ditolak')">
                      <i class="bi bi-x-circle-fill fs-5"></i>
                    </button>
                  </template>
                  <span v-else class="text-muted small fst-italic">Selesai</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!store.loading && store.sortedSubmissions.length === 0" class="text-center py-5">
          <i class="bi bi-shop fs-3 text-muted"></i>
          <h6 class="mt-2 mb-1">Belum Ada Pengajuan Booth</h6>
          <p class="text-muted small">Data pengajuan sewa booth akan tampil di sini.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useBoothStore } from '~/stores/booth'; // Import store baru

// Setup halaman admin (layout, middleware, judul)
definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});
useHead({ title: 'Pengajuan Booth' });

// Inisialisasi store
const store = useBoothStore();

// Panggil data saat halaman dimuat
onMounted(() => {
  store.fetchSubmissions();
});

// Helper untuk styling badge status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Menunggu':
      return 'bg-warning-subtle text-warning-emphasis';
    case 'Disetujui':
      return 'bg-success-subtle text-success-emphasis';
    case 'Ditolak':
      return 'bg-danger-subtle text-danger-emphasis';
    default:
      return 'bg-secondary-subtle text-secondary-emphasis';
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>