<template>
  <div class="auth-container">
    <div class="auth-overlay">
      <div class="auth-box">
        <div class="auth-content">
          <div class="text-center mb-4">
            <img src="~/assets/img/Logo-Mahad.png" alt="Logo Dauroh" style="height: 60px;" class="mb-3">
            <h1 class="auth-title">
              Buat Akun Baru
            </h1>
            <p class="text-muted small">Daftar untuk menjadi peserta dauroh</p>
          </div>
          
          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label for="fullName" class="form-label">Nama Lengkap</label>
              <input type="text" id="fullName" v-model="form.name" class="form-control" placeholder="Masukkan nama lengkap Anda" required />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" v-model="form.email" class="form-control" placeholder="contoh: peserta@dauroh.com" required />
            </div>
             <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" id="username" v-model="form.username" class="form-control" placeholder="Username unik" required />
            </div>
             <div class="mb-3">
              <label for="phone" class="form-label">Nomor HP</label>
              <input type="tel" id="phone" v-model="form.phone_number" class="form-control" placeholder="08..." required />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" v-model="form.password" id="password" placeholder="Masukkan password" class="form-control" required />
            </div>
             <div class="mb-3">
              <label for="confirmPassword" class="form-label">Konfirmasi Password</label>
              <input type="password" v-model="form.confirmPassword" id="confirmPassword" placeholder="Ulangi password" class="form-control" required />
            </div>

            <div v-if="error" class="alert alert-danger mt-3 small p-2">
              {{ error }}
            </div>

            <div class="d-grid gap-2 mt-4">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                 <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ loading ? 'Memproses...' : 'Daftar' }}
              </button>
            </div>
            
            <div class="text-center mt-4 pt-3 border-top">
              <p class="text-muted small mb-1">Sudah punya akun?</p>
              <NuxtLink to="/login" class="text-decoration-none fw-bold">Login di sini</NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'auth'
});

useHead({
  title: 'Daftar Akun'
});

const router = useRouter();
const { $apiBase } = useNuxtApp();

const form = reactive({
  name: '',
  email: '',
  username: '',
  phone_number: '',
  password: '',
  confirmPassword: ''
});

const error = ref(null);
const loading = ref(false);

const handleRegister = async () => {
  error.value = null;
  
  // Validasi password
  if (form.password !== form.confirmPassword) {
    error.value = 'Password dan konfirmasi password tidak cocok.';
    return;
  }

  loading.value = true;

  try {
    // --- INTEGRASI API ---
    const response = await $apiBase.post('/signup-account?type=user-client', {
      email: form.email,
      password: form.password,
      name: form.name,
      username: form.username,
      phone_number: form.phone_number
    });
    Swal.fire({
      title: 'Pendaftaran Berhasil!',
      text: 'Silakan login dengan akun baru Anda.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      router.push('/login');
    });

  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || err.response?.data?.error || 'Terjadi kesalahan saat mendaftar.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
 @import url("~/assets/css/auth/style.css");
</style>