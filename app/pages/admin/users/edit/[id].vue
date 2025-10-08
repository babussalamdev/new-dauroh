<template>
  <div>
    <div class="page-header mb-4">
      <h1 class="page-title">Edit User</h1>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
          <li class="breadcrumb-item"><NuxtLink to="/admin/users">Semua User</NuxtLink></li>
          <li class="breadcrumb-item active" aria-current="page">Edit User</li>
        </ol>
      </nav>
    </div>

    <div class="card content-card">
      <div class="card-header">
        <h5 class="mb-0">Formulir Edit User</h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <form v-else @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="fullName" class="form-label">Nama Lengkap</label>
              <input type="text" class="form-control" id="fullName" v-model="form.name" required>
            </div>
            <div class="col-md-6">
              <label for="email" class="form-label">Alamat Email</label>
              <input type="email" class="form-control" id="email" v-model="form.email" required disabled>
            </div>
            <div class="col-md-12">
              <label for="role" class="form-label">Role</label>
              <select id="role" class="form-select" v-model="form.role" required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="root">Root</option>
              </select>
            </div>
            <div class="col-12">
              <hr>
              <p class="text-muted small">Kosongkan password jika tidak ingin mengubahnya.</p>
            </div>
             <div class="col-md-6">
              <label for="password" class="form-label">Password Baru (Opsional)</label>
              <input type="password" class="form-control" id="password" v-model="form.password">
            </div>
          </div>

          <div class="mt-4 text-end">
            <NuxtLink to="/admin/users" class="btn btn-secondary me-2">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
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

const route = useRoute();
const router = useRouter();
const userId = Number(route.params.id);

const loading = ref(true);
const form = reactive({
  id: userId,
  name: '',
  email: '',
  role: 'user',
  password: '', // Password dikosongkan secara default
});

// SIMULASI PENGAMBILAN DATA USER DARI API
onMounted(() => {
  // // NANTI: Di sini Anda akan mengambil data user berdasarkan ID dari API
  // const { $apiBase } = useNuxtApp();
  // $apiBase.get(`/users/${userId}`).then(response => {
  //   form.name = response.data.name;
  //   form.email = response.data.email;
  //   form.role = response.data.role;
  //   loading.value = false;
  // }).catch(error => {
  //   console.error(error);
  //   loading.value = false;
  // });

  // Untuk sekarang, kita simulasi dengan data dummy
  setTimeout(() => {
    const dummyUsers = [
      { id: 1, name: 'Root User', email: 'root@example.com', role: 'root' },
      { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: 3, name: 'Regular User', email: 'user@example.com', role: 'user' },
    ];
    const userToEdit = dummyUsers.find(u => u.id === userId);
    if (userToEdit) {
      form.name = userToEdit.name;
      form.email = userToEdit.email;
      form.role = userToEdit.role;
    }
    loading.value = false;
  }, 500);
});

const handleSubmit = () => {
  // // NANTI: Kirim data 'form' yang sudah diubah ke API backend
  // const { $apiBase } = useNuxtApp();
  // $apiBase.put(`/users/${userId}`, form).then(() => { ... });

  console.log('Data user yang diupdate:', form);
  Swal.fire({
    title: 'Berhasil!',
    text: 'Data user telah diperbarui.',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  }).then(() => {
    router.push('/admin/users');
  });
};
</script>

<style scoped>
/* Style sama seperti halaman create */
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-primary);
}
.content-card {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}
.card-header {
  background-color: #fff;
  border-bottom: 1px solid #eff2f5;
  padding: 1rem 1.25rem;
}
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}
.breadcrumb a {
  text-decoration: none;
  color: var(--bs-secondary-color);
}
</style>