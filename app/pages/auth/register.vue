<template>
  <div class="auth-container">
    <div class="auth-overlay">
      <div class="auth-box">
        <div class="auth-content">
          <div class="text-center mb-4">
            <img src="~/assets/img/Logo-Mahad.png" alt="Logo Event" style="height: 60px;" class="mb-3">
            <h1 class="auth-title">Buat Akun Baru</h1>
            <p class="text-muted small">Daftar untuk menjadi peserta event</p>
          </div>

          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label for="fullName" class="form-label">Nama Lengkap</label>
              <input type="text" id="fullName" v-model="form.name" class="form-control"
                placeholder="Masukkan nama lengkap Anda" required />
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" v-model="form.email" class="form-control"
                placeholder="contoh: peserta@event.com" required />
            </div>

            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" id="username" v-model="form.username" class="form-control"
                placeholder="Username untuk login" required />
            </div>

            <div class="mb-3">
              <label for="phone" class="form-label">Nomor HP</label>
              <input type="tel" id="phone" v-model="form.phone_number" class="form-control" placeholder="08..."
                required />
            </div>

            <div class="mb-3">
              <label for="gender" class="form-label">Jenis Kelamin</label>
              <select id="gender" v-model="form.gender" class="form-control" required>
                <option value="" disabled>Pilih Jenis Kelamin</option>
                <option value="Male">Ikhwan (Laki-laki)</option>
                <option value="Female">Akhwat (Perempuan)</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="birthDate" class="form-label">Tanggal Lahir</label>
              <input type="date" id="birthDate" v-model="form.birthDate" class="form-control" required />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <div class="password-wrapper">
                <input :type="showPassword ? 'text' : 'password'" v-model="form.password" class="form-control"
                  placeholder="Masukkan password" required />
                <span @click="showPassword = !showPassword" class="password-toggle-icon">
                  <i :class="showPassword ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                </span>
              </div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Konfirmasi Password</label>
              <div class="password-wrapper">
                <input :type="showConfirmPassword ? 'text' : 'password'" v-model="form.confirmPassword"
                  class="form-control" placeholder="Ulangi password" required />
                <span @click="showConfirmPassword = !showConfirmPassword" class="password-toggle-icon">
                  <i :class="showConfirmPassword ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                </span>
              </div>
            </div>

            <div v-if="error" class="alert alert-danger mt-3 small p-2">
              {{ error }}
            </div>

            <div class="d-grid gap-2 mt-4">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                {{ loading ? 'Memproses...' : 'Daftar' }}
              </button>
            </div>

            <div class="text-center mt-4 pt-3 border-top">
              <p class="text-muted small mb-1">Sudah punya akun?</p>
              <NuxtLink to="/auth/login" class="text-decoration-none fw-bold">Login di sini</NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

definePageMeta({ layout: 'auth' });
useHead({ title: 'Daftar Akun' });

const router = useRouter();
const { $apiBase } = useNuxtApp();

const form = reactive({
  name: '',
  email: '',
  username: '',
  phone_number: '',
  gender: '',
  birthDate: '',
  password: '',
  confirmPassword: ''
});

const error = ref(null);
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleRegister = async () => {
  error.value = null;

  if (form.password !== form.confirmPassword) {
    error.value = 'Password dan konfirmasi password tidak cocok.';
    return;
  }

  loading.value = true;

  // Siapkan data untuk disimpan
  const userData = {
    email: form.email,
    name: form.name,
    username: form.username,
    phone_number: form.phone_number,
    gender: form.gender,
    birtdate: form.birthDate,
    password: form.password
  };

  try {
    // 1. Tembak API Register
    await $apiBase.post('/signup-account?type=user-client', userData);

    // 2. Jika Sukses (200 OK) -> Simpan Session & Redirect
    sessionStorage.setItem('temp_register_data', JSON.stringify(userData));

    Swal.fire({
      title: 'Berhasil!',
      text: 'Kode OTP telah dikirim ke email Anda.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      router.push({ path: '/verify', query: { email: form.email } });
    });

  } catch (err) {
    console.error(err);

    const msg = err.response?.data?.message || err.response?.data?.error || 'Terjadi kesalahan.';
    const msgLower = msg.toLowerCase();

    // 3. HANDLING "ACCOUNT ALREADY EXISTS"
    // Sesuai request: Anggap ini sebagai "Resend OTP" dan langsung redirect ke verify
    if (msgLower.includes('already exists') || msgLower.includes('sudah terdaftar')) {

      // Tetap simpan data form ke session agar verify.vue bisa ambil untuk resend
      sessionStorage.setItem('temp_register_data', JSON.stringify(userData));

      await Swal.fire({
        icon: 'info',
        title: 'Akun Sudah Terdaftar',
        text: 'Mengirim ulang kode OTP ke email Anda...',
        timer: 1500,
        showConfirmButton: false
      });

      router.push({ path: '/verify', query: { email: form.email } });

    } else {
      error.value = msg;
    }

  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/auth/style.css");
</style>