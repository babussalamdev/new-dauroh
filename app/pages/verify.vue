<template>
  <div class="auth-container">
    <div class="auth-overlay">
      <div class="auth-box">
        <div class="auth-content text-center">
          
          <div class="mb-4">
            <h2 class="auth-title">Verifikasi <span class="text-primary">Akun</span></h2>
            <p class="text-muted small">
              Masukkan kode OTP yang telah dikirim ke email:<br>
              <strong>{{ emailDisplay }}</strong>
            </p>
          </div>

          <div class="mb-4">
            <input 
              type="text" 
              class="form-control form-control-lg text-center fw-bold fs-4" 
              v-model="otpCode" 
              placeholder="X X X X X X"
              maxlength="6"
              style="letter-spacing: 0.5em;"
            >
          </div>

          <div class="d-grid gap-2">
            <button 
              class="btn btn-primary btn-lg" 
              @click="handleVerify" 
              :disabled="loading || !otpCode"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Verifikasi Sekarang
            </button>
          </div>

          <div class="mt-4">
             <small class="text-muted">Salah email? 
                <NuxtLink to="/register" class="text-decoration-none">Daftar Ulang</NuxtLink>
             </small>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useNuxtApp } from '#app';

definePageMeta({ 
  layout: "auth",
  auth: false,       // 👈 Tambahin ini (biasanya buat nandain public route)
  middleware: []     // 👈 Pastikan gak ada middleware auth yang jagain
});

const route = useRoute();
const router = useRouter();
const { $apiBase } = useNuxtApp();

const otpCode = ref('');
const loading = ref(false);
const storedData = ref<any>(null);

// Ambil email dari URL atau dari Storage
const emailDisplay = computed(() => {
  return (route.query.email as string) || storedData.value?.email || 'User';
});

onMounted(() => {
  // 1. Coba ambil data yang disimpen dari halaman Register
  const rawData = sessionStorage.getItem('temp_register_data');
  
  if (rawData) {
    storedData.value = JSON.parse(rawData);
  } else {
    // ⚠️ BAHAYA: Kalau user datang dari Login, data ini KOSONG.
    // Kita harus handle errornya nanti.
    console.warn("Data registrasi tidak ditemukan di session storage");
  }
});

const handleVerify = async () => {
  loading.value = true;
  
  try {
    // 2. CEK APAKAH DATA LENGKAP
    if (!storedData.value) {
        throw new Error("Data registrasi hilang. Mohon daftar ulang agar data lengkap.");
    }

    // 3. SUSUN PAYLOAD SESUAI REQUEST POSTMAN KAMU
    const payload = {
        email: storedData.value.email,
        code: otpCode.value,
        name: storedData.value.name,
        gender: storedData.value.gender,
        birtdate: storedData.value.birtdate, // ⚠️ Typo Backend diikuti
        phone_number: storedData.value.phone_number,
        username: storedData.value.username
    };

    console.log("Mengirim Payload:", payload); // Debugging

    // 4. TEMBAK API
    await $apiBase.post('/verify-email', payload);

    // 5. SUKSES
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Akun berhasil diverifikasi. Silakan login.',
      timer: 2000,
      showConfirmButton: false
    });

    // Bersihkan data sementara
    sessionStorage.removeItem('temp_register_data');
    
    router.push('/login');

  } catch (error: any) {
    console.error("Verify Error:", error);
    
    let msg = error.response?.data?.message || error.message || 'Verifikasi gagal.';
    
    // Kalau error karena data tidak lengkap (kasus dari Login -> Verify)
    if (error.message.includes('Data registrasi hilang')) {
        Swal.fire({
            icon: 'error',
            title: 'Data Tidak Lengkap',
            text: 'Sistem membutuhkan data registrasi ulang untuk verifikasi.',
            confirmButtonText: 'Daftar Ulang',
        }).then((res) => {
            if(res.isConfirmed) router.push('/register');
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