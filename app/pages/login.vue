<template>
  <div class="auth-container">
    <div class="auth-overlay">
      <div class="auth-box">
        <div class="auth-content">
          <div class="text-center mb-4">
            <img src="~/assets/img/Logo-Mahad.png" alt="Logo Dauroh" style="height: 60px;" class="mb-3">
            <h1 class="auth-title">Sign<span class="text-primary">In</span></h1>
            <p class="text-muted small">Silakan masuk untuk melanjutkan</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="username" class="form-label">Email/Username</label>
              <input
                type="text"
                id="username"
                v-model="form.email"
                placeholder="Masukkan username atau email"
                class="form-control form-control-lg"
                required
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <div class="password-wrapper">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  id="password"
                  placeholder="Masukkan password"
                  class="form-control form-control-lg"
                  required
                />
                <span @click="togglePasswordVisibility" class="password-toggle-icon">
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                  </svg>
                </span>
              </div>
            </div>

            <div class="d-flex justify-content-end mb-4">
              <a href="#" @click.prevent="openForgotPasswordModal" class="text-decoration-none small">Lupa password?</a>
            </div>

            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading" >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Login
              </button>
            </div>

            <div class="text-center mt-4">
              <NuxtLink to="/" class="d-block text-decoration-none">Saya hanya pengunjung</NuxtLink>
            </div>

            <div class="text-center mt-4 pt-3 border-top">
              <p class="text-muted small mb-1">Belum punya akun?</p>
              <NuxtLink to="/register" class="text-decoration-none fw-bold">Daftar Sekarang</NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>

    <ModalsForgotPasswordModal :show="showForgotModal" @close="closeForgotPasswordModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router"; 
import Swal from "sweetalert2";         
import { useAuth } from "~/composables/useAuth";
import ModalsForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';

definePageMeta({ layout: "auth" });

const router = useRouter(); 

// 👇 PERBAIKAN DISINI: Hapus 'loading' dari useAuth
const { login } = useAuth();

// 👇 KITA BIKIN VARIABLE LOADING SENDIRI
const loading = ref(false);

const form = reactive({ email:'', password:'' })
const showPassword = ref(false);

// ==== State untuk modal Lupa Password ====
const showForgotModal = ref(false);
const openForgotPasswordModal = () => { showForgotModal.value = true; };
const closeForgotPasswordModal = () => { showForgotModal.value = false; };
// ==== Akhir State Modal ====

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

const handleLogin = async () => {
  // 👇 Set loading nyala manual
  loading.value = true; 
  
  try {
    // 1. Tembak API Login 
    await login({ 
      email: form.email, 
      password: form.password 
    });

    // 2. Kalau sukses, redirect ke dashboard/home
    Swal.fire({ icon: 'success', title: 'Login Berhasil', timer: 1500, showConfirmButton: false });
    router.push('/'); 

  } catch (error: any) {
   
        // Prioritas: response.data.error > response.data.message > message biasa
    let errMsg = "Gagal Login";
    if (error.response && error.response.data) {
        errMsg = error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
    } else {
        errMsg = error.message || "Terjadi kesalahan jaringan";
    }

    const errLower = errMsg.toLowerCase();

    // 2. 🔥 DETEKSI USER BELUM VERIFIKASI 🔥
    // Kita tambahkan kata kunci lain buat jaga-jaga
    if (errLower.includes('not verified') || errLower.includes('belum verifikasi') || errLower.includes('verification')) {
      
      Swal.fire({
        icon: 'warning',
        title: 'Akun Belum Aktif',
        text: 'Email Anda belum diverifikasi. Silakan masukkan kode OTP.',
        showCancelButton: true,
        confirmButtonText: 'Verifikasi Sekarang',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Nanti Saja',
        cancelButtonColor: '#d33',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          // 👉 LEMPAR KE HALAMAN VERIFY
          router.push({ 
            path: '/verify', 
            query: { email: form.email } 
          });
        }
      });

    } else {
      // Error biasa
      Swal.fire({
        icon: 'error',
        title: 'Gagal Masuk',
        text: errMsg // Tampilkan pesan asli biar user tau kenapa
      });
    }

  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
 @import url("~/assets/css/auth/style.css");
</style>