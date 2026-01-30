<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">{{ pageTitle }}</li>
      </ol>
    </nav>
    
    <div class="card content-card">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h5 class="mb-0">{{ pageTitle }}</h5>

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
            Tambah User
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
                  <span :class="['badge', getRoleBadge(user.Role || user.role || user.Series || user.PK)]">
                    {{ formatRoleName(user.Role || user.role || user.Series || user.PK || 'user') }}
                  </span>
                </td>

                <td class="text-center">
                  <span :class="['badge rounded-pill', getStatusBadge(user.Status)]">
                    {{ user.Status || 'Unverified' }}
                  </span>
                </td>
                
                <td class="text-center">
                  <div class="d-flex justify-content-center gap-1">
                    <NuxtLink :to="`/admin/users/edit/${encodeURIComponent(user.SK)}`" class="btn btn-sm btn-light text-primary border" title="Edit">
                      <i class="bi bi-pencil-square"></i>
                    </NuxtLink>

                    <button 
                      v-if="canBlockUsers"
                      class="btn btn-sm btn-light border" 
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
                <td colspan="5" class="text-center py-5"> <i class="bi bi-people fs-3 text-muted"></i>
                  <h6 class="mt-2 mb-1">Data Kosong</h6>
                  <p class="text-muted small">Belum ada data untuk kategori {{ activeType }}.</p>
                </td>
              </tr>
              
              <tr v-if="!store.loading && store.users.length > 0 && store.paginatedData.length === 0">
                <td colspan="5" class="text-center py-5">
                    <h6 class="mt-2 mb-1">Tidak Ada Hasil</h6>
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
import { computed, watch } from 'vue';
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

const route = useRoute();
const store = useAdminUserStore();
const { user } = useAuth();

// --- Permission Check ---
const canBlockUsers = computed(() => {
  const myRole = (user.value?.role || user.value?.Role || '').toLowerCase();
  // Pastikan 'super_role' (underscore) juga masuk sini biar aman
  const allowedRoles = ['root', 'super role', 'super_role', 'admin'];
  return allowedRoles.includes(myRole);
});

const activeType = computed(() => (route.query.type as string) || 'all');
const pageTitle = computed(() => {
  const t = activeType.value;
  if (t === 'admin') return 'Daftar Admin';
  if (t === 'client') return 'Daftar Client';
  return 'Daftar Semua User';
});

watch(() => route.query.type, (newType) => {
    const type = (newType as string) || 'all';
    store.search = ''; 
    store.getListaccount(type, true);
}, { immediate: true });

const formatRoleName = (role: string | null | undefined) => {
  if (!role) return '-';
  const cleanRole = String(role).replace(/_/g, ' ');
  return cleanRole.replace(/\b\w/g, (char) => char.toUpperCase());
};

// 2. Fungsi buat nentuin Warna Badge
const getRoleBadge = (roleStr?: string) => {
  if (!roleStr) return 'bg-light text-dark';
  const role = roleStr.toLowerCase();
  
  switch (role) {
    case 'root': return 'bg-dark text-white';
    case 'super role': 
    case 'super_role': return 'bg-light text-dark';
    case 'admin': return 'bg-info text-dark';
    case 'bendahara': return 'bg-warning text-dark';
    case 'registrasi': return 'bg-teal text-white';
    case 'user': return 'bg-secondary text-white';             
    default: return 'bg-light text-dark border';
  }
};

const getStatusBadge = (status?: string) => {
  if (!status) return 'bg-light text-secondary border';
  const s = status.toLowerCase();
  if (s === 'active' || s === 'verified') return 'bg-success-subtle text-success border border-success-subtle';
  if (s === 'inactive') return 'bg-danger-subtle text-danger border border-danger-subtle'; 
  if (s === 'unverified') return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
  if (s === 'banned' || s === 'blocked') return 'bg-danger-subtle text-danger border border-danger-subtle';
  return 'bg-light text-secondary border';
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
.btn-sm { white-space: nowrap; }
.bg-teal { background-color: #20c997; }
</style>