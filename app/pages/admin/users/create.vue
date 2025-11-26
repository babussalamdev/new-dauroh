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
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" v-model="form.username" required placeholder="Username unik">
            </div>
            <div class="col-md-6">
              <label for="phone" class="form-label">Nomor Telepon</label>
              <input type="tel" class="form-control" id="phone" v-model="form.phone_number" required placeholder="08...">
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
import { useAdminUserStore } from '~/stores/adminUser';
import { useRouter } from 'vue-router';

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
const router = useRouter();

// Menambahkan username dan phone_number ke state form
const form = reactive({ 
  name: '', 
  email: '', 
  username: '',     // Baru
  phone_number: '', // Baru
  password: '', 
  role: 'user' 
});

const handleSubmit = async () => {
  // Kirim data form yang sudah lengkap ke store
  const success = await store.addAccount(form);
  
  if (success) {
    // Reset form
    form.name = '';
    form.email = '';
    form.username = '';
    form.phone_number = '';
    form.password = '';
    form.role = 'user';
    
    // Pindah ke halaman index
    router.push('/admin/users');
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>