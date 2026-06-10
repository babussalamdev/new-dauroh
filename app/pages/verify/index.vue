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
              placeholder="X X X X X X" maxlength="6" style="letter-spacing: 0.5em;" :disabled="countdown <= 0">
          </div>

          <div class="d-grid gap-2">
            <button class="btn btn-primary btn-lg" @click="handleVerify" :disabled="loading || !otpCode || countdown <= 0">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
            </button>
          </div>

          <div class="mt-4 pt-3 border-top">
            <div v-if="countdown > 0" class="text-muted small">
              Belum terima kode? Kirim ulang dalam <span class="fw-bold text-danger">{{ formatTime(countdown) }}</span>
            </div>

            <div v-else>
              <div class="alert alert-danger py-2 mb-2 small fw-bold">
                <i class="bi bi-clock-history me-1"></i> Kode OTP telah kedaluwarsa.
              </div>
              <small class="text-muted">Silakan kirim ulang kode baru untuk melanjutkan.</small>
              <br>
              <button @click="handleResendOtp" class="btn btn-outline-primary btn-sm fw-bold mt-2 px-4 rounded-pill"
                :disabled="resendLoading">
                {{ resendLoading ? 'Mengirim...' : 'Kirim Ulang Kode' }}
              </button>
            </div>
          </div>

          <div class="mt-3">
            <small class="text-muted">Salah email?
              <NuxtLink :to="{ path: '/auth', query: { mode: 'register' } }" class="text-decoration-none">Daftar Ulang</NuxtLink>
            </small>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Verifikasi Sertifikat' });
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useNuxtApp } from '#app';
import { useAlert } from '~/utils/swal';
import { useRegistrationStore } from '~/stores/registration'; // Sesuaikan lokasi file store lu



definePageMeta({
  layout: "auth",
  auth: false,
  middleware: []
});

const route = useRoute();
const router = useRouter();
const { alert: swalAlert } = useAlert();
const { $apiBase } = useNuxtApp();
const registrationStore = useRegistrationStore();

const otpCode = ref('');
const loading = ref(false);
const resendLoading = ref(false); 
const storedData = ref<any>(null);

// --- 1. LOGIKA TIMER (PERSISTENT / ANTI REFRESH) ---
const countdown = ref(0); 
let timerInterval: any = null;

const startTimer = (isFresh = false) => {
  if (timerInterval) clearInterval(timerInterval);

  const duration = 180; // 3 menit = 180 detik
  const now = Math.floor(Date.now() / 1000); 
  let expiryTimeStr = sessionStorage.getItem('otp_expiry_time');
  let expiryTime = parseInt(expiryTimeStr || '0');

  // Bikin timer baru HANYA JIKA:
  // 1. isFresh = true (User klik Kirim Ulang)
  // 2. Belum ada otp_expiry_time di sessionStorage (Baru pertama kali masuk page verify)
  if (isFresh || !expiryTimeStr) {
    expiryTime = now + duration;
    sessionStorage.setItem('otp_expiry_time', expiryTime.toString());
  }

  // Kalkulasi sisa waktu (pakai Math.max supaya nggak jadi angka minus)
  countdown.value = Math.max(0, expiryTime - Math.floor(Date.now() / 1000));

  // Kalau masih ada waktu, jalankan interval
  if (countdown.value > 0) {
    timerInterval = setInterval(() => {
      const currentNow = Math.floor(Date.now() / 1000);
      const remaining = expiryTime - currentNow;

      if (remaining > 0) {
        countdown.value = remaining;
      } else {
        countdown.value = 0;
        clearInterval(timerInterval);
      }
    }, 1000);
  }
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

onMounted(async () => { // Tambahkan async
  // 1. Ambil data dari session storage (jika ada)
  const rawData = sessionStorage.getItem('temp_register_data');
  if (rawData) {
    storedData.value = JSON.parse(rawData);
  } 
  
  // 2. BACKUP: Jika session kosong tapi ada email di URL (kasus user langsung login)
  if (!storedData.value && route.query.email) {
    storedData.value = { email: route.query.email };
  }

  // 3. LOGIKA OTOMATIS RESEND
  if (route.query.resend === 'true') {
    await handleResendOtp();
    router.replace({ 
      path: '/verify', 
      query: { email: route.query.email } 
    });
  } else {
    startTimer();
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// --- 3. HANDLE RESEND OTP ---
const handleResendOtp = async () => {
  if (!storedData.value) {
    swalAlert('Error', 'Data sesi hilang. Silakan daftar ulang.', 'error');
    return;
  }

  resendLoading.value = true;
  otpCode.value = '';

  try {
    await $apiBase.post('/signup-account?type=user-client', storedData.value);

    // Paksa reset timer dari awal dengan isFresh = true
    startTimer(true); 
    
    swalAlert('Terkirim!', 'Kode OTP baru telah dikirim ke email Anda.', 'success');

  } catch (error: any) {
    console.error("Resend Error:", error);
    const msg = error.response?.data?.message || 'Gagal mengirim ulang kode.';
    
    if (msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('sudah terdaftar')) {
      startTimer(true);
      swalAlert('Terkirim!', 'Kode OTP baru telah dikirim (Akun Terdaftar).', 'success');
    } else {
      swalAlert('Gagal', msg, 'error');
    }
  } finally {
    resendLoading.value = false;
  }
};

const handleVerify = async () => {
  // kalau user maksa eksekusi lewat cara lain pas waktu habis
  if (countdown.value <= 0) {
    swalAlert('Kedaluwarsa', 'Kode OTP telah habis masa berlakunya. Silakan kirim ulang kode baru.', 'warning');
    return;
  }

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
    
    swalAlert('Berhasil!', 'Akun Anda telah aktif.', 'success')
    .then(() => {
      registrationStore.$reset(); 
      
      sessionStorage.removeItem('temp_register_data');
      sessionStorage.removeItem('otp_expiry_time');
      router.push('/auth');
    });

  } catch (error: any) {
    console.error("Verify Error:", error);
    let msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Verifikasi gagal.';
    let msgLower = msg.toLowerCase();
    
    if (msgLower.includes('data registrasi hilang')) {
      swalAlert('Sesi Habis', 'Data registrasi tidak ditemukan. Silakan daftar ulang.', 'error')
        .then(() => {
          router.push({ path: '/auth', query: { mode: 'register' } }); 
        });
    }
    else if (msgLower.includes('invalid verification code')) {
      swalAlert(
        'Kode Tidak Valid', 
        'Kode OTP yang Anda masukkan salah. Silakan periksa kembali dan coba lagi.', 
        'error'
      );
    } 
    else {
      swalAlert('Gagal', msg, 'error');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/auth/style.css");
</style>