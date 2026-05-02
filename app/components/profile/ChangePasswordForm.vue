<template>
  <div class="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
    <div class="card-header bg-white py-3 border-bottom-0 pt-4 px-4">
      <h5 class="mb-0 txt-subtitle fw-bold text-dark">Ubah Password</h5>
    </div>
    
    <div class="card-body p-4 pt-2 d-flex flex-column">
      <p class="text-muted txt-caption mb-4">Kosongkan jika tidak ingin mengubah password.</p>

      <form @submit.prevent="handleChangePassword" id="changePasswordForm" class="flex-grow-1">

        <div class="mb-3">
          <label for="currentPassword" class="form-label txt-label fw-bold text-secondary">Password Saat Ini</label>
          <div class="input-group">
            <input :type="showOldPass ? 'text' : 'password'" id="currentPassword"
              v-model="passwordForm.oldPassword" class="form-control txt-body" placeholder="Masukkan password lama"
              :required="isChangingPassword">
            <button class="btn btn-outline-secondary" type="button" @click="showOldPass = !showOldPass">
              <i :class="showOldPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label for="newPassword" class="form-label txt-label fw-bold text-secondary">Password Baru</label>
          <div class="input-group">
            <input :type="showNewPass ? 'text' : 'password'" id="newPassword"
              v-model="passwordForm.newPassword" class="form-control txt-body"
              :class="{ 'is-invalid': isChangingPassword && !isPasswordValid && passwordForm.newPassword.length > 0, 'is-valid': isPasswordValid }"
              placeholder="Min. 8 karakter, Besar, Kecil, Angka" :required="isChangingPassword">
            <button class="btn btn-outline-secondary" type="button" @click="showNewPass = !showNewPass">
              <i :class="showNewPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
            </button>
          </div>
          <div class="form-text txt-caption fw-bold mt-2" :class="isPasswordValid ? 'text-success' : 'text-muted'">
            <i v-if="isPasswordValid" class="bi bi-check-circle-fill me-1"></i>
            Syarat: Min. 8 Karakter, Huruf Besar, Huruf Kecil, & Angka.
          </div>
        </div>

        <div class="mb-3">
          <label for="confirmPassword" class="form-label txt-label fw-bold text-secondary">Konfirmasi Password Baru</label>
          <div class="input-group">
            <input :type="showConfirmPass ? 'text' : 'password'" id="confirmPassword"
              v-model="passwordForm.confirmNewPassword" class="form-control txt-body"
              :class="{ 'is-invalid': passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword }"
              :required="isChangingPassword">
            <button class="btn btn-outline-secondary" type="button"
              @click="showConfirmPass = !showConfirmPass">
              <i :class="showConfirmPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
            </button>
          </div>
        </div>

        <div v-if="passwordError" class="alert alert-danger mt-3 txt-caption fw-bold p-2 rounded-3 border-0">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ passwordError }}
        </div>
      </form>
      
      <div class="mt-auto pt-4 text-end border-top">
        <NuxtLink to="/dashboard" class="btn btn-light border txt-body fw-bold text-muted rounded-pill px-4 me-2">Batal</NuxtLink>
        <button type="submit" form="changePasswordForm" class="btn btn-warning txt-body fw-bold rounded-pill px-4 shadow-sm"
          :disabled="passwordLoading || !isChangingPassword"
          title="Isi password baru untuk mengaktifkan tombol ini">
          <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-1" role="status"
            aria-hidden="true"></span>
          {{ passwordLoading ? 'Menyimpan...' : 'Ubah Password' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useAlert } from '~/utils/swal';
import { useNuxtApp, useCookie } from '#app';

const { $apiBase } = useNuxtApp() as any;
const { alert: swalAlert } = useAlert();

// Password Form State
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});
const passwordLoading = ref(false);
const passwordError = ref<string | null>(null);

const showOldPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);

const isChangingPassword = computed(() => {
  return passwordForm.newPassword !== '' || passwordForm.confirmNewPassword !== '' || passwordForm.oldPassword !== '';
});

const isPasswordValid = computed(() => {
  const pwd = passwordForm.newPassword;
  if (!pwd) return false;
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  return hasMinLen && hasUpper && hasLower && hasNumber;
});

// --- CHANGE PASSWORD HANDLER ---
const handleChangePassword = async () => {
  if (!isChangingPassword.value) return;
  
  passwordLoading.value = true;
  passwordError.value = null;

  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok.';
    passwordLoading.value = false;
    return;
  }

  if (!isPasswordValid.value) {
    passwordError.value = 'Password baru tidak memenuhi syarat.';
    passwordLoading.value = false;
    return;
  }

  try {
    const accessToken = useCookie('AccessToken').value;
    if (!accessToken) throw new Error("Sesi kadaluarsa, silakan login ulang.");

    const payload = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      accessToken: accessToken
    };

    await $apiBase.put('/change-password', payload);

    // Notifikasi Berhasil
    swalAlert(
      'Berhasil!', 
      'Password berhasil diubah. Silakan login kembali dengan password baru Anda.', 
      'success'
    ).then(() => {
      // Force logout/redirect ke login
      window.location.href = '/auth';
    });

    // Reset form
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';

  } catch (err: any) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal mengubah password.';

    if (msg.includes("Incorrect username or password") || msg.includes("NotAuthorizedException")) {
      passwordError.value = "Password lama yang Anda masukkan salah.";
      swalAlert('Gagal', 'Password lama salah.', 'error');
    } else {
      passwordError.value = msg;
      swalAlert('Gagal', msg, 'error');
    }
    console.error('Change password error:', err);
  } finally {
    passwordLoading.value = false;
  }
};
</script>