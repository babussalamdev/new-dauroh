<template>
  <div class="auth-container">
    <div class="auth-overlay">
      <div class="auth-box">
        <div class="auth-content">
          
          <div class="text-center mb-4">
            <img src="~/assets/img/Logo-Mahad.png" alt="Logo Event" style="height: 60px;" class="mb-3">
            <h1 class="auth-title txt-title fw-bold">Buat Akun Baru</h1>
            <p class="text-muted txt-caption mb-0">Daftar untuk menjadi peserta event</p>
          </div>

          <form @submit.prevent="handleRegister">
            
            <div class="mb-3">
              <label for="fullName" class="form-label txt-label fw-bold text-secondary">Nama Lengkap</label>
              <input type="text" id="fullName" v-model="form.name" class="form-control txt-body"
                placeholder="Masukkan nama lengkap Anda" required />
            </div>

            <div class="mb-3">
              <label for="email" class="form-label txt-label fw-bold text-secondary">Email</label>
              <input type="email" id="email" v-model="form.email" class="form-control txt-body"
                placeholder="contoh: peserta@event.com" required />
            </div>

            <div class="mb-3">
              <label for="username" class="form-label txt-label fw-bold text-secondary">Username</label>
              <input type="text" id="username" v-model="form.username" class="form-control txt-body"
                placeholder="Username untuk login" autocomplete="username" required />
            </div>

            <div class="mb-3">
              <label for="phone" class="form-label txt-label fw-bold text-secondary">Nomor HP</label>
              <input type="tel" id="phone" v-model="form.phone_number" class="form-control txt-body" placeholder="08..."
                required />
            </div>

            <div class="mb-3">
              <label for="gender" class="form-label txt-label fw-bold text-secondary">Jenis Kelamin</label>
              <select id="gender" v-model="form.gender" class="form-control txt-body" required>
                <option value="" disabled>Pilih Jenis Kelamin</option>
                <option value="Male">Ikhwan (Laki-laki)</option>
                <option value="Female">Akhwat (Perempuan)</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="birthDate" class="form-label txt-label fw-bold text-secondary">Tanggal Lahir</label>
              <input type="date" id="birthDate" v-model="form.birthDate" class="form-control txt-body" required />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label txt-label fw-bold text-secondary">Password</label>
              <div class="password-wrapper">
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" class="form-control txt-body"
                  placeholder="Masukkan password" autocomplete="new-password" required />
                <span @click="showPassword = !showPassword" class="password-toggle-icon">
                  <i :class="showPassword ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                </span>
              </div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label txt-label fw-bold text-secondary">Konfirmasi Password</label>
              <div class="password-wrapper">
                <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="form.confirmPassword"
                  class="form-control txt-body" placeholder="Ulangi password" autocomplete="new-password" required />
                <span @click="showConfirmPassword = !showConfirmPassword" class="password-toggle-icon">
                  <i :class="showConfirmPassword ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                </span>
              </div>
            </div>

            <div v-if="error" class="alert alert-danger mt-3 txt-caption fw-bold p-2">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ error }}
            </div>

            <div class="d-grid gap-2 mt-4">
              <button type="submit" class="btn btn-primary btn-lg txt-body fw-bold rounded-pill" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                {{ loading ? 'Memproses...' : 'Daftar' }}
              </button>
            </div>

            <div class="text-center mt-4 pt-3 border-top">
              <p class="text-muted txt-caption mb-1">Sudah punya akun?</p>
              <a href="#" @click.prevent="$emit('switch', 'login')" class="text-decoration-none txt-body fw-bold text-primary">Login di sini</a>
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
import { useAlert } from '~/utils/swal';
import Swal from 'sweetalert2';
import { useRegistrationStore } from '~/stores/registration';

useHead({ title: 'Daftar Akun' });

defineEmits(['switch']);

const router = useRouter();
const { $apiBase } = useNuxtApp();
const { alert: swalAlert } = useAlert();

const registrationStore = useRegistrationStore();
const form = registrationStore.formData;

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
    // API Register
    await $apiBase.post('/signup-account?type=user-client', userData);

    // Jika Sukses -> Simpan Session & Redirect
    sessionStorage.setItem('temp_register_data', JSON.stringify(userData));
    sessionStorage.removeItem('otp_expiry_time');

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
  const msg = err.response?.data?.message || err.response?.data?.error || 'Terjadi kesalahan.';
  const msgLower = msg.toLowerCase();

  // Handle Username
  if (msgLower.includes('username cannot be of email format')) {
    swalAlert(
      'Format Username Salah',
      'Username tidak boleh menyerupai format email (mengandung @). Silakan gunakan huruf dan angka.',
      'error'
    );
  }
  // 2Handle Nomor HP/WA Sudah Ada
  else if (msgLower.includes('nomor') || msgLower.includes('whatsapp')) {
    swalAlert('Nomor Sudah Digunakan', msg, 'error');
  } 
  // Handle Email/User Sudah Terdaftar
  else if (msgLower.includes('already exists') || msgLower.includes('sudah terdaftar') || msgLower.includes('email already')) {
    swalAlert(
      'Email Sudah Terdaftar', 
      'Email ini sudah memiliki akun. Silakan login atau gunakan email lain.', 
      'warning'
    );
  } 
  // Handle Error Lainnya
  else {
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