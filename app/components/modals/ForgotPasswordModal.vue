<template>
  <div class="modal fade" id="forgotPasswordModal" tabindex="-1" aria-labelledby="forgotPasswordLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="forgotPasswordLabel">
            {{ step === 1 ? 'Lupa Password?' : 'Reset Password' }}
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            data-bs-dismiss="modal" 
            aria-label="Close" 
            @click="resetForm" 
            ref="closeModalBtn"
          ></button>
        </div>
        
        <div class="modal-body p-4">
          
          <div v-if="step === 1">
            <p class="text-muted small mb-4">
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan kode verifikasi untuk mereset password Anda.
            </p>
            <form @submit.prevent="handleSendCode">
              <div class="mb-3">
                <label for="forgotEmail" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="forgotEmail" 
                  v-model="form.email" 
                  placeholder="nama@email.com" 
                  required
                  :disabled="loading"
                >
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  {{ loading ? 'Mengirim...' : 'Kirim Kode Verifikasi' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else>
            <div class="alert alert-info small py-2 d-flex align-items-center">
              <i class="bi bi-envelope-check me-2"></i>
              <span>Kode telah dikirim ke <b>{{ form.email }}</b></span>
            </div>

            <form @submit.prevent="handleChangePassword">
              <div class="mb-3">
                <label for="verifyCode" class="form-label">Kode Verifikasi (OTP)</label>
                <input 
                  type="text" 
                  class="form-control text-center letter-spacing-2 fw-bold" 
                  id="verifyCode" 
                  v-model="form.code" 
                  placeholder="xxxxxx" 
                  required
                  :disabled="loading"
                >
              </div>

              <div class="mb-3">
                <label for="newPass" class="form-label">Password Baru</label>
                <div class="input-group">
                  <input 
                    :type="showPass ? 'text' : 'password'" 
                    class="form-control" 
                    id="newPass" 
                    v-model="form.newPassword" 
                    :class="{'is-invalid': form.newPassword && !isPasswordValid}"
                    placeholder="Min. 8 karakter"
                    required
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="showPass = !showPass">
                    <i :class="showPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                  </button>
                </div>
                 <div class="form-text small" :class="isPasswordValid ? 'text-success' : 'text-muted'">
                  <i v-if="isPasswordValid" class="bi bi-check-circle-fill me-1"></i>
                  Syarat: Min. 8 Karakter, Besar, Kecil, & Angka.
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPass" class="form-label">Konfirmasi Password</label>
                 <div class="input-group">
                   <input 
                    :type="showConfirmPass ? 'text' : 'password'" 
                    class="form-control" 
                    id="confirmPass" 
                    v-model="form.confirmPassword" 
                    :class="{'is-invalid': form.confirmPassword && form.newPassword !== form.confirmPassword}"
                    required
                  >
                   <button class="btn btn-outline-secondary" type="button" @click="showConfirmPass = !showConfirmPass">
                    <i :class="showConfirmPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                  </button>
                 </div>
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="loading || !isPasswordValid">
                   <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                   {{ loading ? 'Memproses...' : 'Ubah Password' }}
                </button>
                <button type="button" class="btn btn-link text-decoration-none btn-sm text-muted" @click="step = 1">
                  Kirim Ulang / Ganti Email
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import Swal from 'sweetalert2';

const { $apiBase } = useNuxtApp() as any;

// State
const step = ref(1);
const loading = ref(false);
const showPass = ref(false);
const showConfirmPass = ref(false);
const closeModalBtn = ref<HTMLButtonElement | null>(null); // Ref untuk tombol close

const form = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

// Validasi Password
const isPasswordValid = computed(() => {
  const pwd = form.newPassword;
  if (!pwd) return false;
  return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);
});

// --- STEP 1: REQUEST KODE ---
const handleSendCode = async () => {
  loading.value = true;
  try {
    await $apiBase.put('/forgot-password', 
      { email: form.email }, 
      { params: { forgotpassword: 'verify' } }
    );

    step.value = 2;
    Swal.fire({
      icon: 'success',
      title: 'Kode Terkirim!',
      text: 'Silakan cek email Anda untuk mendapatkan kode verifikasi.',
      timer: 3000,
      showConfirmButton: false
    });

  } catch (err: any) {
    console.error(err);
    const msg = err.response?.data?.message || "Email tidak ditemukan atau terjadi kesalahan.";
    Swal.fire('Gagal', msg, 'error');
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  if (form.newPassword !== form.confirmPassword) {
    Swal.fire('Error', 'Konfirmasi password tidak cocok.', 'error');
    return;
  }
  
  loading.value = true;
  try {
    const payload = {
      email: form.email,
      code: form.code,
      newPassword: form.newPassword
    };
    const response = await $apiBase.put('/forgot-password', payload, {
      params: { forgotpassword: 'change' }
    });
    if (closeModalBtn.value) {
      closeModalBtn.value.click();
    }
    const successMessage = response.data?.message

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: successMessage,
    });
    
    // Reset form
    setTimeout(() => resetForm(), 500);

  } catch (err: any) {
    console.error("Change Password Error:", err);
    const msg = err.response?.data?.message || "Kode salah atau kadaluarsa.";
    Swal.fire('Gagal', msg, 'error');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  setTimeout(() => {
    step.value = 1;
    form.email = '';
    form.code = '';
    form.newPassword = '';
    form.confirmPassword = '';
    loading.value = false;
  }, 500);
};
</script>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 2px;
}
</style>