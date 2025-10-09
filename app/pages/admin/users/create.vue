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
              <input type="password" class="form-control" id="password" v-model="form.password" required>
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
            <NuxtLink to="/admin/users" class="btn btn-secondary me-2">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary">Simpan User</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Script tidak ada perubahan
import { reactive } from 'vue';
import { useAuth } from '~/composables/useAuth';
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
const form = reactive({ name: '', email: '', password: '', role: 'user' });
const handleSubmit = () => {
  console.log('Data user baru:', form);
  Swal.fire({
    title: 'Berhasil!',
    text: 'Simulasi penambahan user baru berhasil.',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  }).then(() => {
    router.push('/admin/users');
  });
};
</script>

<style scoped>
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