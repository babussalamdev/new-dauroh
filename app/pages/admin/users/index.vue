<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Manajemen User</li>
      </ol>
    </nav>

    <div class="card content-card">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h5 class="mb-0">Daftar Semua User</h5>
        <div class="d-flex flex-column flex-md-row gap-2" style="width: 100%; max-width: 450px;">
          <div class="input-group input-group-sm flex-grow-1">
            <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control bg-light border-0" placeholder="Cari user...">
          </div>
          <NuxtLink to="/admin/users/create" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i>
            Tambah User Baru
          </NuxtLink>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle fs-sm mb-0">
            <thead class="table-light">
              <tr>
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Nama Lengkap</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Tanggal Bergabung</th>
                <th class="py-3 px-4 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="users.length === 0">
                <td colspan="6" class="text-center py-5">
                  <i class="bi bi-people fs-3 text-muted"></i>
                  <h6 class="mt-2 mb-1">Belum Ada Data User</h6>
                  <p class="text-muted small">Silakan tambahkan user baru untuk memulai.</p>
                </td>
              </tr>
              </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Script setup tidak ada perubahan, data tetap kosong
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import AdminDeleteConfirmationModal from '~/components/admin/AdminDeleteConfirmationModal.vue';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});

interface User { id: number; name: string; email: string; role: string; joinedDate: string; }
const users = ref<User[]>([]);
onMounted(() => { /* Nanti panggil API di sini */ });
const showDeleteModal = ref(false);
const selectedUser = ref<User | null>(null);
const openDeleteModal = (user: User) => { selectedUser.value = user; showDeleteModal.value = true; };
const closeDeleteModal = () => { showDeleteModal.value = false; };
const confirmDelete = () => { if (!selectedUser.value) return; console.log('Hapus user ID:', selectedUser.value.id); closeDeleteModal(); };
const getRoleBadge = (role: string) => { /* ... (fungsi badge tetap sama) ... */ };
</script>

<style scoped>
/* Style ini sekarang lebih bersih dan konsisten */
.fs-sm { 
    font-size: 0.875rem; 
}
.btn-sm { 
    white-space: nowrap; 
}
.content-card { 
    border: 1px solid #e2e8f0; 
    border-radius: 0.75rem; 
    box-shadow: none; 
}
.card-header { 
    background-color: #fff; 
    border-bottom: 1px solid #e2e8f0; 
    padding: 1rem 1.25rem; 
}
.table { 
    border-top: 1px solid #e2e8f0; 
}
.table > :not(caption) > * > * { 
    border-bottom-width: 0; 
}
.table th { 
    font-weight: 600; 
    color: #64748b; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    letter-spacing: 0.5px; 
}
.avatar { 
    width: 32px; 
    height: 32px; 
    border-radius: 50%; 
    background-color: var(--bs-primary-bg-subtle); 
    color: var(--bs-primary); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: 600; 
    text-transform: uppercase; 
}
.breadcrumb { 
    background-color: transparent; 
    padding: 0; 
    margin: 0; 
    font-size: 0.9rem; 
    font-weight: 500; 
}
.breadcrumb a { 
    text-decoration: none; 
    color: var(--bs-secondary-color); 
    }
</style>