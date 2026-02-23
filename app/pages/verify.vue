<template>
  <div class="auth-container">
    <div class="auth-overlay">
      <div class="auth-box">
        <div class="auth-content text-center">

          <div class="mb-4">
            <h2 class="auth-title">Verifikasi <span class="text-primary">Akun</span></h2>
            <p class="text-muted small">
              Masukkan kode OTP yang telah dikirim ke email:<br>
              <strong class="text-dark fs-6">{{ emailDisplay }}</strong>
            </p>
          </div>

          <div class="mb-4">
            <input type="text" class="form-control form-control-lg text-center fw-bold fs-4" v-model="otpCode"
              placeholder="X X X X X X" maxlength="6" style="letter-spacing: 0.5em;">
          </div>

          <div class="d-grid gap-2">
            <button class="btn btn-primary btn-lg" @click="handleVerify" :disabled="loading || !otpCode">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
            </button>
          </div>

          <div class="mt-4 pt-3 border-top">
            <div v-if="countdown > 0" class="text-muted small">
              Belum terima kode? Kirim ulang dalam <span class="fw-bold text-danger">{{ formatTime(countdown) }}</span>
            </div>

            <div v-else>
              <small class="text-muted">Belum terima kode?</small>
              <button @click="handleResendOtp" class="btn btn-link text-decoration-none btn-sm fw-bold p-0 ms-1"
                :disabled="resendLoading">
                {{ resendLoading ? 'Mengirim...' : 'Kirim Ulang' }}
              </button>
            </div>
          </div>

          <div class="mt-3">
            <small class="text-muted">Salah email?
              <NuxtLink to="/auth/register" class="text-decoration-none">Daftar Ulang</NuxtLink>
            </small>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useNuxtApp } from '#app';

definePageMeta({
  layout: "auth",
  auth: false,
  middleware: []
});

const route = useRoute();
const router = useRouter();
const { $apiBase } = useNuxtApp();

const otpCode = ref('');
const loading = ref(false);
const resendLoading = ref(false); // Loading khusus tombol resend
const storedData = ref<any>(null);

// --- 1. LOGIKA TIMER 3 MENIT ---
const countdown = ref(180); // 180 detik = 3 menit
let timerInterval: any = null;

const startTimer = () => {
  countdown.value = 180; // Reset ke 3 menit
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timerInterval); // Stop jika 0
    }
  }, 1000);
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' + s : s}`;
};
const emailDisplay = computed(() => {
  if (route.query.email && typeof route.query.email === 'string') {
    return route.query.email;
  }
  if (storedData.value && storedData.value.email) {
    return storedData.value.email;
  }
  return 'Email tidak ditemukan';
});

onMounted(() => {
  const rawData = sessionStorage.getItem('temp_register_data');
  if (rawData) {
    storedData.value = JSON.parse(rawData);
  }
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// --- 3. HANDLE RESEND OTP ---
const handleResendOtp = async () => {
  if (!storedData.value) {
    Swal.fire('Error', 'Data sesi hilang. Silakan daftar ulang.', 'error');
    return;
  }

  resendLoading.value = true;
  try {
    // Tembak API Signup lagi (menggunakan data dari session storage)
    await $apiBase.post('/signup-account?type=user-client', storedData.value);

    // Jika sukses (200 OK)
    startTimer(); // Reset timer
    Swal.fire({
      icon: 'success',
      title: 'Terkirim!',
      text: 'Kode OTP baru telah dikirim.',
      timer: 2000, showConfirmButton: false
    });

  } catch (error: any) {
    console.error("Resend Error:", error);
    const msg = error.response?.data?.message || 'Gagal mengirim ulang kode.';
    if (msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('sudah terdaftar')) {
      startTimer(); // Reset timer
      Swal.fire({
        icon: 'success',
        title: 'Terkirim!',
        text: 'Kode OTP baru telah dikirim (Akun Terdaftar).',
        timer: 2000, showConfirmButton: false
      });
    } else {
      Swal.fire('Gagal', msg, 'error');
    }
  } finally {
    resendLoading.value = false;
  }
};
const handleVerify = async () => {
  loading.value = true;

  try {
    if (!storedData.value) {
      throw new Error("Data registrasi hilang. Mohon daftar ulang agar data lengkap.");
    }

    const payload = {
      email: storedData.value.email,
      code: otpCode.value,
      name: storedData.value.name,
      gender: storedData.value.gender,
      birtdate: storedData.value.birtdate,
      phone_number: storedData.value.phone_number,
      username: storedData.value.username
    };

    await $apiBase.post('/verify-email', payload);

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Akun berhasil diverifikasi. Silakan login.',
      timer: 2000,
      showConfirmButton: false
    });

    sessionStorage.removeItem('temp_register_data');
    router.push('/auth/login');

  } catch (error: any) {
    console.error("Verify Error:", error);
    let msg = error.response?.data?.message || error.message || 'Verifikasi gagal.';
    if (error.message.includes('Data registrasi hilang')) {
      Swal.fire({
        icon: 'error',
        title: 'Sesi Habis',
        text: 'Data registrasi tidak ditemukan. Silakan daftar ulang.',
        confirmButtonText: 'Daftar Ulang',
      }).then((res) => {
        if (res.isConfirmed) router.push('/register');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: msg
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