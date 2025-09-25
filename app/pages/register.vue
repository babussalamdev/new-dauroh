<template>
  <div class="register-container">
    <div class="register-overlay">
      <div class="register-box">
        <div class="register-content">
          <div class="text-center mb-4">
            <img src="~/assets/img/Logo-Mahad.png" alt="Logo Dauroh" style="height: 60px;" class="mb-3">
            <h1 class="register-title">
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
              <button type="submit" class="btn btn-primary btn-lg">
                Daftar
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
  layout: 'auth' // Menggunakan layout yang sama dengan login
});

useHead({
  title: 'Daftar Akun'
});

const router = useRouter();

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const error = ref(null);

const handleRegister = () => {
  error.value = null; // Reset error setiap kali submit

  // Validasi frontend sederhana
  if (form.password !== form.confirmPassword) {
    error.value = 'Password dan konfirmasi password tidak cocok.';
    return;
  }

  // --- SIMULASI REGISTRASI BERHASIL ---
  // Nantinya, di sini Anda akan memanggil API backend
  console.log('Data Pendaftaran:', form);

  Swal.fire({
    title: 'Pendaftaran Berhasil!',
    text: 'Anda akan diarahkan ke halaman login.',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  }).then(() => {
    router.push('/login'); // Arahkan ke halaman login setelah berhasil
  });
};
</script>

<style scoped>
/* Menggunakan style yang mirip dengan halaman login untuk konsistensi */
.register-container {
  display: flex;
  min-height: 100vh;
  background: url('~/assets/img/city-rain.jpg') no-repeat center center/cover;
}

.register-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  padding: 2rem 1rem;
  background-color: rgba(0, 0, 0, 0.55);
}

.register-box {
  width: 100%;
  max-width: 480px;
}

.register-content {
  background-color: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.register-title {
  font-weight: 600;
  font-size: 1.8rem;
  color: #333;
}

.form-label {
  font-weight: 500;
  color: #555;
  margin-bottom: 0.25rem;
}

.form-control {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
}
</style>