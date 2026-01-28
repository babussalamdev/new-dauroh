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
            <input 
              type="text" 
              class="form-control bg-light border-0" 
              placeholder="Cari nama, email, atau role..."
              v-model="store.search"
              @input="store.changePage(1)"
            >
          </div>
          <NuxtLink to="/admin/users/create" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i>
            Tambah User Baru
          </NuxtLink>
        </div>
      </div>
      <div class="card-body"> 
        <CommonLoadingSpinner v-if="store.loading && store.users.length === 0" class="my-5" />

        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover table-sm align-middle fs-sm">
            <thead class="table-light">
              <tr>
                <th>User Info</th>
                <th>Kontak</th>
                <th class="text-center">Role</th>
                <th class="text-center">Status</th>
                <th class="text-center" style="width: 150px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.paginatedData.length > 0" v-for="user in store.paginatedData" :key="user.SK">
                
                <td>
                  <div class="fw-bold">{{ user.Name }}</div>
                  <small class="text-muted">{{ user.SK || '-' }}</small>
                </td>
                
                <td>
                  <span v-if="user.Whatsapp">{{ user.Whatsapp }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                
                <td class="text-center">
                  <span :class="['badge', getRoleBadge(user.role || user.PK || user.Series)]">
                    {{ user.role || user.PK || user.Series || 'user' }}
                  </span>
                </td>

                <td class="text-center">
                  <span :class="['badge rounded-pill', getStatusBadge(user.Status)]">
                    {{ user.Status || 'Unverified' }}
                  </span>
                </td>
                
                <td class="text-center">
                  <div class="d-flex justify-content-center gap-1">
                    <NuxtLink :to="`/admin/users/edit/${user.SK}`" class="btn btn-sm btn-light text-primary border" title="Edit">
                      <i class="bi bi-pencil-square"></i>
                    </NuxtLink>

                    <button 
                      class="btn btn-sm btn-light border" 
                      :class="user.Status === 'blocked' ? 'text-success' : 'text-warning'"
                      :title="user.Status === 'blocked' ? 'Aktifkan User' : 'Blokir User'"
                      @click="toggleBlockUser(user)"
                    >
                      <i :class="user.Status === 'blocked' ? 'bi bi-check-circle' : 'bi bi-slash-circle'"></i>
                    </button>

                    <button 
                      class="btn btn-sm btn-light text-danger border" 
                      title="Hapus Permanen"
                      @click="deleteUser(user)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="!store.loading && store.users.length === 0">
                <td colspan="5" class="text-center py-5"> <i class="bi bi-people fs-3 text-muted"></i>
                  <h6 class="mt-2 mb-1">Belum Ada Data User</h6>
                  <p class="text-muted small">Silakan tambahkan user baru untuk memulai.</p>
                </td>
              </tr>

              <tr v-if="!store.loading && store.users.length > 0 && store.paginatedData.length === 0">
                <td colspan="5" class="text-center py-5"> <i class="bi bi-search fs-3 text-muted"></i>
                  <h6 class="mt-2 mb-1">Tidak Ada Hasil</h6>
                  <p class="text-muted small">Tidak ditemukan user dengan kata kunci "{{ store.search }}".</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!store.loading && store.totalPages > 1" class="card-footer d-flex justify-content-between align-items-center">
        <span class="text-muted small">
          Menampilkan {{ store.paginatedData.length }} dari {{ store.totalItems }} user
        </span>
        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: store.currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="store.changePage(store.currentPage - 1)">Previous</a>
            </li>
            <li v-for="page in store.totalPages" :key="page" class="page-item" :class="{ active: store.currentPage === page }">
              <a class="page-link" href="#" @click.prevent="store.changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: store.currentPage === store.totalPages }">
              <a class="page-link" href="#" @click.prevent="store.changePage(store.currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useAdminUserStore } from '~/stores/adminUser';
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
const store = useAdminUserStore();

onMounted(() => { 
  store.getListaccount(true); 
});

// Helper Badge Role
const getRoleBadge = (roleStr?: string) => {
  if (!roleStr) return 'bg-light text-dark';
  const role = roleStr.toLowerCase();
  switch (role) {
    case 'root': return 'bg-light text-dark';
    case 'super_role': return 'bg-light text-dark';          // Biru buat Super Admin
    case 'admin': return 'text-dark';        // Cyan buat Admin
    case 'bendahara': return 'bg-dark text-white';           // Hijau buat Bendahara
    case 'registrasi': return 'bg-dark text-white';// Kuning buat Registrasi
    case 'user': return 'bg-dark text-white';              // Abu buat User Biasa
    default: return 'bg-dark text-white';
  }
};

// Helper Badge Status
const getStatusBadge = (status?: string) => {
  if (!status) return 'bg-light text-secondary border';
  const s = status.toLowerCase();
  
  if (s === 'active' || s === 'verified') return 'bg-success-subtle text-success border border-success-subtle';
  if (s === 'unverified') return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
  if (s === 'banned' || s === 'blocked') return 'bg-danger-subtle text-danger border border-danger-subtle';
  
  return 'bg-light text-secondary border';
};

// Action: Block / Unblock User
const toggleBlockUser = async (user: any) => {
  const isBlocked = user.Status === 'blocked';
  const actionText = isBlocked ? 'Aktifkan' : 'Blokir';
  const confirmColor = isBlocked ? '#198754' : '#dc3545'; 

  const result = await Swal.fire({
    title: `${actionText} User?`,
    text: `User ${user.Name} akan ${isBlocked ? 'diaktifkan kembali' : 'diblokir aksesnya'}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    confirmButtonText: `Ya, ${actionText}`,
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
     Swal.fire('Fitur Belum Tersedia', 'Function update status belum ada di store.', 'info');
  }
};

// Action: Delete User
const deleteUser = async (user: any) => {
  const result = await Swal.fire({
    title: 'Hapus User?',
    text: "Data user ini akan dihapus permanen dan tidak bisa dikembalikan!",
    icon: 'error', 
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Ya, Hapus Permanen',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
     Swal.fire('Fitur Belum Tersedia', 'Function delete belum ada di store.', 'info');
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
.btn-sm { white-space: nowrap; }
</style>