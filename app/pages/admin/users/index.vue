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
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>Role</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.paginatedData.length > 0" v-for="user in store.paginatedData" :key="user.email">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['badge', getRoleBadge(user.role)]">{{ user.role }}</span>
                </td>
                <td class="text-center">
                  <NuxtLink :to="`/admin/users/edit/${user.email}`" class="btn btn-link text-primary p-1" title="Edit">
                    <i class="bi bi-pencil-square fs-5"></i>
                  </NuxtLink>
                  </td>
              </tr>
              
              <tr v-if="!store.loading && store.users.length === 0">
                <td colspan="4" class="text-center py-5"> <i class="bi bi-people fs-3 text-muted"></i>
                  <h6 class="mt-2 mb-1">Belum Ada Data User</h6>
                  <p class="text-muted small">Silakan tambahkan user baru untuk memulai.</p>
                </td>
              </tr>

              <tr v-if="!store.loading && store.users.length > 0 && store.paginatedData.length === 0">
                <td colspan="4" class="text-center py-5"> <i class="bi bi-search fs-3 text-muted"></i>
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
            
            <li 
              v-for="page in store.totalPages" 
              :key="page" 
              class="page-item" 
              :class="{ active: store.currentPage === page }"
            >
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
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
    case 'root':
      return 'bg-primary';
    case 'user':
      return 'bg-secondary';
    default:
      return 'bg-light text-dark';
  }
};

</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
.btn-sm { 
    white-space: nowrap; 
}
</style>