<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h1 class="mb-0 text-center">Edit Profil</h1>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="handleUpdateProfile">
              <div class="mb-3">
                <label for="fullName" class="form-label">Nama Lengkap</label>
                <input type="text" id="fullName" v-model="form.name" class="form-control" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" v-model="form.email" class="form-control" required>
              </div>
              
              <hr class="my-4">
              
              <p class="text-muted">Ubah Password (opsional)</p>
              <div class="mb-3">
                <label for="newPassword" class="form-label">Password Baru</label>
                <input type="password" id="newPassword" v-model="form.newPassword" class="form-control" placeholder="Isi jika ingin mengubah password">
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Konfirmasi Password Baru</label>
                <input type="password" id="confirmPassword" v-model="form.confirmPassword" class="form-control" placeholder="Ulangi password baru">
              </div>

              <div v-if="error" class="alert alert-danger mt-3 small p-2">
                {{ error }}
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <NuxtLink to="/dashboard" class="btn btn-secondary">Batal</NuxtLink>
                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth'

useHead({
  title: 'Edit Profil'
});

const router = useRouter(); 
const { user } = useAuth()

const form = reactive({
  name: user.value?.name || '',
  email: user.value?.email || '',
  newPassword: '',
  confirmPassword: ''
});

const error = ref(null);

const handleUpdateProfile = () => {
  error.value = null;

  // Validasi password jika diisi
  if (form.newPassword && form.newPassword !== form.confirmPassword) {
    error.value = 'Password baru dan konfirmasi tidak cocok.';
    return;
  }

  // --- SIMULASI UPDATE BERHASIL ---
  // Nantinya, di sini Anda akan memanggil API backend untuk update
  console.log('Data profil yang akan diupdate:', form);

  Swal.fire({
    title: 'Berhasil!',
    text: 'Profil Anda telah diperbarui.',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  }).then(() => {
    router.push('/dashboard'); // Arahkan kembali ke dasbor
  });
};
</script>

<style scoped>
/* Anda bisa menambahkan style khusus jika perlu */
</style>