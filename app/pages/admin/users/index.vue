<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Manajemen User</li>
      </ol>
    </nav>
    
    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      
    <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column gap-3">
        
        <div class="d-flex justify-content-between align-items-center w-100">
          <h5 class="mb-0 fw-bold text-dark fs-6 fs-md-5 text-truncate">
            <i class="bi bi-people-fill text-primary me-2"></i>Manajemen User
          </h5>
          <NuxtLink to="/admin/users/create" class="btn btn-primary btn-sm rounded-pill px-3 fw-medium shadow-sm text-nowrap">
            <i></i> Tambah User
          </NuxtLink>
        </div>

        <div class="d-flex justify-content-between align-items-center gap-2 w-100">
          
          <div class="input-group input-group-sm shadow-sm" style="max-width: 400px; flex: 1;">
            <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
            <input 
              type="text" 
              class="form-control bg-light border-0" 
              placeholder="Cari nama, email..." 
              v-model="store.search" 
              @input="store.changePage(1)"
            >
          </div>

          <div class="dropdown">
            <button class="btn btn-sm btn-light border d-flex align-items-center shadow-sm px-2 px-md-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-funnel-fill text-secondary"></i>
              <span class="ms-2 fw-medium text-secondary d-none d-md-inline" style="font-size: 0.8rem;">{{ activeTypeLabel }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="font-size: 0.85rem;">
              <li><h6 class="dropdown-header">Kategori Role</h6></li>
              <li>
                <a class="dropdown-item py-2" :class="{ 'active bg-primary text-white': activeType === 'all' }" href="#" @click.prevent="changeType('all')">
                  <i class="bi bi-list-ul me-2"></i>Semua User
                </a>
              </li>
              <li>
                <a class="dropdown-item py-2" :class="{ 'active bg-primary text-white': activeType === 'admin' }" href="#" @click.prevent="changeType('admin')">
                  <i class="bi bi-shield-lock me-2"></i>Data Admin
                </a>
              </li>
              <li>
                <a class="dropdown-item py-2" :class="{ 'active bg-primary text-white': activeType === 'client' }" href="#" @click.prevent="changeType('client')">
                  <i class="bi bi-person me-2"></i>Data Client
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>  
      
      <div class="card-body p-0"> 
        <CommonLoadingSpinner v-if="store.loading && store.users.length === 0" class="my-5" />

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0" style="min-width: 800px;">
            <thead class="table-light text-muted" style="font-size: 0.8rem;">
              <tr>
                <th class="ps-4">USER INFO</th>
                <th>KONTAK</th>
                <th class="text-center">ROLE</th>
                <th class="text-center">STATUS</th>
                <th class="text-center pe-4" style="width: 180px;">AKSI</th> 
    
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.paginatedData.length > 0" v-for="user in store.paginatedData" :key="user.SK">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ user.Name }}</div>
                  <small class="text-muted" style="font-size: 0.75rem;">{{ user.SK || '-' }}</small>
                </td>
                
                <td>
                  <span v-if="user.Whatsapp" class="text-dark">{{ user.Whatsapp }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                
                <td class="text-center">
                  <span :class="['badge border px-2 py-1', getRoleBadge(user.Role || user.role || user.Series || user.PK)]" style="font-size: 0.7rem;">
                    {{ formatRoleName(user.Role || user.role || user.Series || user.PK || 'user') }}
                  </span>
                </td>

                <td class="text-center">
                  <span :class="['badge rounded-pill px-3 py-1', getStatusBadge(user.Status)]" style="font-size: 0.7rem;">
                    {{ user.Status || 'Unverified' }}
                  </span>
                </td>
                
                <td class="text-center pe-4">
                  <div class="d-flex justify-content-center gap-1">
                    <NuxtLink :to="`/admin/users/edit/${encodeURIComponent(user.SK)}`" class="btn btn-sm btn-light text-primary border rounded-circle" title="Edit">
                      <i class="bi bi-pencil-square"></i>
                    </NuxtLink>

                    <button 
                      v-if="canManageUsers"
                      class="btn btn-sm btn-light text-warning border rounded-circle" 
                      title="Reset Password User"
                      @click="handleResetPassword(user)"
                    >
                      <i class="bi bi-key-fill"></i>
                    </button>

                    <button 
                      v-if="canManageUsers"
                      class="btn btn-sm btn-light border rounded-circle" 
                      :class="user.Status === 'inactive' ? 'text-success' : 'text-danger'"
                      :title="user.Status === 'inactive' ? 'Buka Blokir' : 'Blokir User'"
                      @click="toggleBlockUser(user)"
                    >
                      <i :class="user.Status === 'inactive' ? 'bi bi-unlock-fill' : 'bi bi-lock-fill'"></i>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="!store.loading && store.users.length === 0">
                <td colspan="5" class="text-center py-5"> 
                  <i class="bi bi-people fs-2 text-muted opacity-50 mb-2 d-block"></i>
                  <h6 class="mt-2 mb-1 fw-bold text-dark">Data Kosong</h6>
                  <p class="text-muted small">Belum ada data untuk kategori {{ activeType }}.</p>
                </td>
              </tr>
              
              <tr v-if="!store.loading && store.users.length > 0 && store.paginatedData.length === 0">
                <td colspan="5" class="text-center py-5">
                    <h6 class="mt-2 mb-1 text-muted fw-bold">Tidak Ada Hasil Pencarian</h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!store.loading && store.totalPages > 1" class="card-footer bg-white border-top d-flex justify-content-between align-items-center p-3 px-4">
        <span class="text-muted" style="font-size: 0.8rem;">
          Menampilkan <strong>{{ store.paginatedData.length }}</strong> dari <strong>{{ store.totalItems }}</strong> user
        </span>
        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: store.currentPage === 1 }">
              <a class="page-link text-muted" href="#" @click.prevent="store.changePage(store.currentPage - 1)">Prev</a>
            </li>
            <li v-for="page in store.totalPages" :key="page" class="page-item" :class="{ active: store.currentPage === page }">
              <a class="page-link" href="#" @click.prevent="store.changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: store.currentPage === store.totalPages }">
              <a class="page-link text-muted" href="#" @click.prevent="store.changePage(store.currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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

const router = useRouter();
const route = useRoute();
const store = useAdminUserStore();
const { user } = useAuth();
const { $apiBase } = useNuxtApp() as any; 

// --- Permission Check ---
const canManageUsers = computed(() => {
  const myRole = (user.value?.role || user.value?.Role || '').toLowerCase();
  const allowedRoles = ['root', 'super role', 'super_role', 'admin'];
  return allowedRoles.includes(myRole);
});

// Ambil tipe aktif dari URL
const activeType = computed(() => (route.query.type as string) || 'all');

const activeTypeLabel = computed(() => {
  if (activeType.value === 'admin') return 'Data Admin';
  if (activeType.value === 'client') return 'Data Client';
  return 'Semua User';
});

// 🟢 FUNGSI BARU: Buat ngubah tab tanpa ngereload web (tapi update URL)
const changeType = (type: string) => {
  router.push({ query: { ...route.query, type } });
};

// 🟢 Tembak API setiap URL-nya berubah (misal dari hasil klik tab)
watch(() => route.query.type, (newType) => {
    const type = (newType as string) || 'all';
    store.search = ''; 
    store.getListaccount(type, true);
}, { immediate: true });

// --- Helpers ---
const formatRoleName = (role: string | null | undefined) => {
  if (!role) return '-';
  const lowerRole = String(role).toLowerCase();
  if (lowerRole === 'user') return 'Client';
  
  const cleanRole = String(role).replace(/_/g, ' ');
  return cleanRole.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getRoleBadge = (roleStr?: string) => {
  if (!roleStr) return 'bg-light text-dark';
  const role = roleStr.toLowerCase();
  
  switch (role) {
    case 'root': return 'bg-dark text-white border-dark';
    case 'super role': 
    case 'super_role': return 'bg-secondary bg-opacity-10 text-dark border-secondary border-opacity-25';
    case 'admin': return 'bg-info bg-opacity-10 text-info border-info border-opacity-25';
    case 'bendahara': return 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-25';
    case 'registrasi': return 'bg-teal bg-opacity-10 text-teal border-teal border-opacity-25';
    case 'user': return 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-25';             
    default: return 'bg-light text-dark border';
  }
};

const getStatusBadge = (status?: string) => {
  if (!status) return 'bg-light text-secondary border';
  const s = status.toLowerCase();
  if (s === 'active' || s === 'verified') return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
  if (s === 'inactive') return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'; 
  if (s === 'unverified') return 'bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25';
  if (s === 'banned' || s === 'blocked') return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
  return 'bg-light text-secondary border';
};

// --- LOGIKA RESET PASSWORD ---
const handleResetPassword = async (targetUser: any) => {
  const result = await Swal.fire({
    title: 'Reset Password User?',
    text: `Anda yakin ingin mereset password untuk user "${targetUser.Name}"? Password baru akan digenerate secara acak oleh sistem.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ffc107',
    confirmButtonText: 'Ya, Reset Password',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    Swal.showLoading();

    try {
      const response = await $apiBase.put('/change-password', {}, {
        params: { username: targetUser.SK }
      });

      const newPassword = response.password || response.data?.password || response.message || "Gagal mengambil password";

      await Swal.fire({
        title: 'Berhasil Direset!',
        html: `
          <p>Password user <b>${targetUser.Name}</b> berhasil direset.</p>
          <div class="alert alert-success d-flex align-items-center justify-content-center gap-2 mb-0">
            <strong class="fs-4 user-select-all" style="user-select: all;">${newPassword}</strong>
          </div>
          <p class="small text-muted mt-2 mb-0">Silakan copy dan berikan password ini kepada user.</p>
        `,
        icon: 'success',
        confirmButtonText: 'Tutup'
      });

    } catch (err: any) {
      console.error("Reset password error:", err);
      const msg = err.response?.data?.message || err.message || "Terjadi kesalahan saat mereset password.";
      Swal.fire('Gagal!', msg, 'error');
    }
  }
};

// --- LOGIKA BLOKIR USER ---
const toggleBlockUser = async (targetUser: any) => {
  const isCurrentlyInactive = targetUser.Status === 'inactive';
  const newStatus = isCurrentlyInactive ? 'active' : 'inactive';
  const actionText = isCurrentlyInactive ? 'Buka Blokir' : 'Blokir';
  const confirmColor = isCurrentlyInactive ? '#198754' : '#dc3545';

  const result = await Swal.fire({
    title: `${actionText} User?`,
    text: `User ${targetUser.Name} akan diubah statusnya menjadi ${newStatus}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    confirmButtonText: `Ya, ${actionText}`,
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    await store.changeUserStatus(targetUser.SK, newStatus);
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

/* Helper Colors */
.text-teal { color: #20c997 !important; }
.bg-teal { background-color: #20c997 !important; }
.border-teal { border-color: #20c997 !important; }

/* Menghilangkan padding card-body biar tabel nempel manis */
.table> :not(caption)>*>* { border-bottom-width: 1px; }

.tabs-scroll-wrapper {
  overflow-x: auto; 
  white-space: nowrap; 
  -webkit-overflow-scrolling: touch; 
  scrollbar-width: none; /* Buat Firefox */
  padding-bottom: 2px;
}
.tabs-scroll-wrapper::-webkit-scrollbar { 
  display: none; /* Buat Chrome/Safari/Edge */
}
</style>