<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item"><NuxtLink to="/admin/users">Manajemen User</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Tambah Baru</li>
      </ol>
    </nav>

    <div class="card content-card">
      <div class="card-header">
        <h5 class="mb-0">Formulir User Baru</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="fullName" class="form-label">Nama Lengkap</label>
              <input type="text" class="form-control" id="fullName" v-model="form.name" required>
            </div>
            <div class="col-md-6">
              <label for="email" class="form-label">Alamat Email</label>
              <input type="email" class="form-control" id="email" v-model="form.email" required>
            </div>
            <div class="col-md-6">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" v-model="form.password" required minlength="6">
            </div>
            <div class="col-md-6">
              <label for="role" class="form-label">Role</label>
              <select id="role" class="form-select" v-model="form.role" required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="root">Root</option>
              </select>
            </div>
          </div>
          <div class="mt-4 text-end">
            <NuxtLink to="/admin/users" class="btn btn-secondary me-2" :class="{ disabled: store.loading }">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary" :disabled="store.loading">
              <span v-if="store.loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ store.loading ? 'Menyimpan...' : 'Simpan User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useAdminUserStore } from '~/stores/adminUser'; // * Import store
import { useRouter } from 'vue-router'; // * Import router

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});

const store = useAdminUserStore(); // *
const router = useRouter(); // *

const form = reactive({ 
  name: '', 
  email: '', 
  password: '', 
  role: 'user' 
});

const handleSubmit = async () => {
  // * Ganti simulasi dengan call ke store
  const success = await store.addAccount(form);
  
  if (success) {
    // Reset form (opsional, karena   pindah halaman)
    form.name = '';
    form.email = '';
    form.password = '';
    form.role = 'user';
    // Pindah ke halaman index
    router.push('/admin/users');
  }
  // Pesan error/sukses sudah dihandle di dalam store
};
</script>

<style scoped>
/* Style dari file aslimu */
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