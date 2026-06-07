<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Manajemen Akun'}]" />
    
    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column gap-3">
        
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 w-100">
  
  <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
    <h5 class="mb-0 txt-title fw-bold text-dark text-truncate w-100">Manajemen Akun</h5>
  </div>

  <div class="d-flex flex-shrink-0 flex-wrap">
    <NuxtLink to="/admin/users/create" class="btn btn-primary rounded-pill px-3 py-1 shadow-sm txt-caption fw-medium">
      Tambah Akun
    </NuxtLink>
  </div>

</div>

        <div class="d-flex justify-content-between align-items-center gap-2 w-100">
          
          <div class="input-group input-group-sm shadow-sm" style="max-width: 400px; flex: 1;">
            <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
            <input 
              type="text" 
              class="form-control bg-light border-0 txt-body" 
              placeholder="Cari nama, email..." 
              v-model="store.search" 
              @input="store.changePage(1)"
            >
          </div>

          <div class="dropdown">
            <button class="btn btn-sm btn-light border d-flex align-items-center shadow-sm px-2 px-md-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-funnel-fill text-secondary"></i>
              <span class="ms-2 txt-label text-secondary d-none d-md-inline">{{ activeTypeLabel }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
              <li><h6 class="dropdown-header txt-label">Kategori Role</h6></li>
              <li>
                <a class="dropdown-item py-2 txt-body" :class="{ 'active bg-primary text-white': activeType === 'all' }" href="#" @click.prevent="changeType('all')">
                  <i class="bi bi-list-ul me-2"></i>Semua
                </a>
              </li>
              <li>
                <a class="dropdown-item py-2 txt-body" :class="{ 'active bg-primary text-white': activeType === 'admin' }" href="#" @click.prevent="changeType('admin')">
                  <i class="bi bi-shield-lock me-2"></i>Data Admin
                </a>
              </li>
              <li>
                <a class="dropdown-item py-2 txt-body" :class="{ 'active bg-primary text-white': activeType === 'client' }" href="#" @click.prevent="changeType('client')">
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
            <thead>
              <tr>
                <th class="ps-4 txt-label">USER INFO</th>
                <th class="txt-label">KONTAK</th>
                <th class="text-center txt-label">ROLE</th>
                <th class="text-center txt-label">STATUS</th>
                <th class="text-center pe-4 txt-label" style="width: 180px;">AKSI</th> 
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.paginatedData.length > 0" v-for="user in store.paginatedData" :key="user.SK">
                <td class="ps-4">
                  <div class="fw-bold text-dark txt-body">{{ user.Name }}</div>
                  <div class="text-muted txt-caption">{{ user.SK || '-' }}</div>
                </td>
                
                <td>
                  <span v-if="user.Whatsapp" class="text-dark txt-body">{{ user.Whatsapp }}</span>
                  <span v-else class="text-muted txt-body">-</span>
                </td>
                
                <td class="text-center">
                  <span :class="['badge px-3 py-1 shadow-sm rounded-pill txt-label', getRoleBadge(user.Role || user.role || user.Series || user.PK)]">
                    {{ formatRoleName(user.Role || user.role || user.Series || user.PK || 'user') }}
                  </span>
                </td>

                <td class="text-center">
                  <span :class="['badge px-3 py-1 shadow-sm rounded-pill txt-label', getStatusBadge(user.Status)]">
                    {{ user.Status || 'Unverified' }}
                  </span>
                </td>
                
                <td class="text-center pe-4">
                  <div class="d-flex justify-content-center gap-2">
                    <NuxtLink :to="`/admin/users/edit/${encodeURIComponent(user.SK)}`" class="btn btn-sm text-primary p-0 border-0 bg-transparent shadow-none" title="Edit">
                      <i class="bi bi-pencil-square fs-5"></i>
                    </NuxtLink>

                    <button 
                      v-if="canManageUsers"
                      class="btn btn-sm text-warning p-0 border-0 bg-transparent shadow-none" 
                      title="Reset Password User"
                      @click="handleResetPassword(user)"
                    >
                      <i class="bi bi-key fs-5"></i>
                    </button>

                    <button 
                      v-if="canManageUsers"
                      class="btn btn-sm p-0 border-0 bg-transparent shadow-none" 
                      :class="user.Status === 'inactive' ? 'text-success' : 'text-danger'"
                      :title="user.Status === 'inactive' ? 'Buka Blokir' : 'Blokir User'"
                      @click="toggleBlockUser(user)"
                    >
                      <i :class="user.Status === 'inactive' ? 'bi bi-unlock fs-5' : 'bi bi-lock fs-5'"></i>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="!store.loading && store.users.length === 0">
                <td colspan="5" class="text-center py-5"> 
                  <i class="bi bi-people fs-1 text-muted opacity-50 mb-3 d-block"></i>
                  <h6 class="mb-1 txt-subtitle">Data Kosong</h6>
                  <p class="text-muted txt-body">Belum ada data untuk kategori {{ activeType }}.</p>
                </td>
              </tr>
              
              <tr v-if="!store.loading && store.users.length > 0 && store.paginatedData.length === 0">
                <td colspan="5" class="text-center py-5">
                  <i class="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
                  <h6 class="mb-1 text-muted txt-subtitle">Tidak Ada Hasil Pencarian</h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!store.loading && store.totalPages > 1" class="card-footer bg-white border-top d-flex justify-content-between align-items-center p-3 px-4">
        <span class="text-muted txt-body">
          Menampilkan <strong>{{ store.paginatedData.length }}</strong> dari <strong>{{ store.totalItems }}</strong> user
        </span>
        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: store.currentPage === 1 }">
              <a class="page-link text-muted txt-body" href="#" @click.prevent="store.changePage(store.currentPage - 1)">Prev</a>
            </li>
            <li v-for="page in store.totalPages" :key="page" class="page-item" :class="{ active: store.currentPage === page }">
              <a class="page-link txt-body" href="#" @click.prevent="store.changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: store.currentPage === store.totalPages }">
              <a class="page-link text-muted txt-body" href="#" @click.prevent="store.changePage(store.currentPage + 1)">Next</a>
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
import { useAlert } from '~/utils/swal';

useHead({
  title: 'Manajemen Akun'
});
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
const { alert: swalAlert, confirm: swalConfirm } = useAlert();

// --- Permission Check ---
const canManageUsers = computed(() => {
  const myRole = (user.value?.role || user.value?.Role || '').toLowerCase();
  const allowedRoles = ['root', 'admin']; 
  return allowedRoles.includes(myRole);
});

// Ambil tipe aktif dari URL
const activeType = computed(() => (route.query.type as string) || 'all');

const activeTypeLabel = computed(() => {
  if (activeType.value === 'admin') return 'Data Admin';
  if (activeType.value === 'client') return 'Data Client';
  return 'Semua';
});

// 🟢 FUNGSI BARU: Buat ngubah tab tanpa ngereload web (tapi update URL)
const changeType = (type: string) => {
  router.push({ query: { ...route.query, type } });
};

// 🟢 Tembak API setiap URL-nya berubah (misal dari hasil klik tab)
watch(() => route.query.type, (newType) => {
    const type = (newType as string) || 'all';
    store.search = ''; 
    
    // Langsung lempar 'type' mentah-mentah ke store. 
    // JANGAN PAKE apiType DI SINI LAGI!
    store.getListaccount(type, true);
}, { immediate: true });

// --- Helpers ---
const formatRoleName = (role: string | null | undefined) => {
  if (!role) return '-';
  const lowerRole = String(role).toLowerCase();
  if (lowerRole === 'client' || lowerRole === 'user') return 'Client'; 
  
  const cleanRole = String(role).replace(/_/g, ' ');
  return cleanRole.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getRoleBadge = (roleStr?: string) => {
  if (!roleStr) return 'bg-light text-dark';
  const role = roleStr.toLowerCase();
  
  switch (role) {
    case 'root': return 'bg-dark text-white border-dark';
    case 'admin': return 'bg-info bg-opacity-10 text-info border-info border-opacity-25';
    case 'bendahara': return 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-25';
    case 'registrasi': return 'bg-teal bg-opacity-10 text-teal border-teal border-opacity-25';
    case 'client':
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
  const result = await swalConfirm(
    'Reset Password User?',
    `Anda yakin ingin mereset password untuk user "${targetUser.Name}"? Password baru akan digenerate secara acak.`,
    'Ya, Reset Password'
  );

  if (result.isConfirmed) {
    Swal.showLoading();

    try {
      const response = await $apiBase.put('/change-password', {}, {
        params: { username: targetUser.SK }
      });

      const newPassword = response.password || response.data?.password || response.message || "Gagal mengambil password";
      Swal.fire({
        title: 'Berhasil Direset!',
        html: `
          <p>Password user <b>${targetUser.Name}</b> berhasil direset.</p>
          <div class="alert alert-success d-flex align-items-center justify-content-center gap-2 mb-0 border-0 rounded-3">
            <strong class="fs-4 user-select-all font-monospace" style="user-select: all;">${newPassword}</strong>
          </div>
          <p class="small text-muted mt-2 mb-0">Silakan copy dan berikan password ini kepada user.</p>
        `,
        icon: 'success',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#004754',
        customClass: {
          popup: 'rounded-4 shadow-lg border-0'
        }
      });

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Gagal mereset password.";
      swalAlert('Gagal!', msg, 'error');
    }
  }
};

// --- LOGIKA BLOKIR USER ---
const toggleBlockUser = async (targetUser: any) => {
  const isCurrentlyInactive = targetUser.Status === 'inactive';
  const newStatus = isCurrentlyInactive ? 'active' : 'inactive';
  const actionText = isCurrentlyInactive ? 'Buka Blokir' : 'Blokir';

  const result = await swalConfirm(
    `${actionText} User?`,
    `User ${targetUser.Name} akan diubah statusnya menjadi ${newStatus}.`,
    `Ya, ${actionText}`
  );

  if (result.isConfirmed) {
    try {
        await store.changeUserStatus(targetUser.SK, newStatus);
        swalAlert('Berhasil', `Status user berhasil diubah menjadi ${newStatus}.`, 'success');
    } catch (error) {
        swalAlert('Error', 'Gagal mengubah status user.', 'error');
    }
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