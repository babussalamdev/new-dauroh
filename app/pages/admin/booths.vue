<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Pengajuan Booth</li>
      </ol>
    </nav>

    <div class="card content-card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Daftar Pengajuan Booth</h5>
        <button class="btn btn-outline-primary btn-sm" @click="store.fetchSubmissions" :disabled="store.loading">
          <i :class="store.loading ? 'spinner-border spinner-border-sm' : 'bi bi-arrow-clockwise'"></i>
          <span class="ms-1">Refresh</span>
        </button>
      </div>
      <div class="card-body">
        
        <CommonLoadingSpinner v-if="store.loading" class="my-5" />

        <div v-else-if="!store.loading && store.sortedSubmissions.length > 0" class="table-responsive">
          <table class="table table-bordered table-hover align-middle fs-sm">
            <thead class="table-light">
              <tr>
                <th>Nama Booth</th>
                <th>Nama Kontak</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in store.sortedSubmissions" :key="sub.SK">
                <td>{{ sub.boothName }}</td>
                <td>{{ sub.contactName }}</td>
                <td>{{ sub.email }}</td>
                <td>{{ sub.phone }}</td>
                <td>
                  <span :class="['badge', getStatusBadge(sub.status)]">{{ sub.status }}</span>
                </td>
                <td class="text-center">
                  <template v-if="sub.status === 'Menunggu'">
                    <button 
                      class="btn btn-success btn-sm me-1" 
                      title="Setujui"
                      @click="store.updateSubmissionStatus(sub.SK, 'Disetujui')">
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button 
                      class="btn btn-danger btn-sm" 
                      title="Tolak"
                      @click="store.updateSubmissionStatus(sub.SK, 'Ditolak')">
                      <i class="bi bi-x-lg"></i>
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