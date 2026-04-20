<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none txt-caption text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Profil Saya</li>
      </ol>
    </nav>

    <div class="row g-4"> 
      
      <div class="col-lg-6"> 
        <div class="card content-card border-0 shadow-sm rounded-4 h-100"> 
          <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom">
            <h5 class="mb-0 txt-title text-dark">Informasi Profil</h5>
          </div>
          <div class="card-body p-3 px-md-4 d-flex flex-column"> 
            <form @submit.prevent="handleUpdateProfile" id="updateProfileForm" class="flex-grow-1">
              
              <div class="mb-3">
                <label for="adminName" class="form-label txt-label text-secondary">Nama Lengkap</label>
                <input type="text" class="form-control txt-body" id="adminName" v-model="profileForm.name" required>
              </div>
              
              <div class="mb-3">
                <label for="adminEmail" class="form-label txt-label text-secondary">Email</label>
                <input type="email" class="form-control txt-body bg-light" id="adminEmail" v-model="profileForm.email" required disabled>
                <div class="form-text txt-caption text-muted">Email tidak dapat diubah.</div>
              </div>

              <div class="mb-3">
                <label for="adminPhone" class="form-label txt-label text-secondary">No. Handphone</label>
                <input type="text" class="form-control txt-body" id="adminPhone" v-model="profileForm.phone_number" placeholder="08..." required>
              </div>

              <div class="mb-3">
                <label class="form-label txt-label text-secondary">Role</label>
                <input type="text" class="form-control bg-light txt-body text-capitalize" :value="profileForm.role" readonly>
              </div>

              <div v-if="profileError" class="alert alert-danger mt-3 txt-caption p-2">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ profileError }}
              </div>
            </form>
            
            <div class="text-end mt-auto pt-3"> 
              <button type="submit" form="updateProfileForm" class="btn btn-primary rounded-pill px-4 txt-body fw-medium" :disabled="profileLoading">
                <span v-if="profileLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-floppy-fill me-1"></i>
                {{ profileLoading ? 'Menyimpan...' : 'Simpan Info Profil' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6"> 
        <div class="card content-card border-0 shadow-sm rounded-4 h-100"> 
          <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom">
            <h5 class="mb-0 txt-title text-dark">Ubah Password</h5>
          </div>
          <div class="card-body p-3 px-md-4 d-flex flex-column"> 
            <p class="text-muted txt-caption mb-3">Kosongkan jika tidak ingin mengubah password.</p>
            
            <form @submit.prevent="handleChangePassword" class="flex-grow-1" id="changePasswordForm">
              
              <div class="mb-3">
                <label for="currentPassword" class="form-label txt-label text-secondary">Password Saat Ini</label>
                <div class="input-group">
                  <input 
                    :type="showOldPass ? 'text' : 'password'" 
                    class="form-control txt-body" 
                    id="currentPassword" 
                    v-model="passwordForm.oldPassword"
                    placeholder="Masukkan password lama"
                    :required="isChangingPassword"
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="showOldPass = !showOldPass">
                    <i :class="showOldPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label txt-label text-secondary">Password Baru</label>
                <div class="input-group">
                  <input 
                    :type="showNewPass ? 'text' : 'password'" 
                    class="form-control txt-body" 
                    id="newPassword" 
                    v-model="passwordForm.newPassword"
                    :class="{'is-invalid': isChangingPassword && !isPasswordValid && passwordForm.newPassword.length > 0, 'is-valid': isPasswordValid}"
                    placeholder="Min. 8 karakter, Besar, Kecil, Angka"
                    :required="isChangingPassword"
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="showNewPass = !showNewPass">
                    <i :class="showNewPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                  </button>
                </div>
                <div class="form-text txt-caption mt-1" :class="isPasswordValid ? 'text-success fw-bold' : 'text-muted'">
                  <i v-if="isPasswordValid" class="bi bi-check-circle-fill me-1"></i>
                  Syarat: Min. 8 Karakter, Huruf Besar, Huruf Kecil, & Angka.
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmNewPassword" class="form-label txt-label text-secondary">Konfirmasi Password Baru</label>
                <div class="input-group">
                  <input 
                    :type="showConfirmPass ? 'text' : 'password'" 
                    class="form-control txt-body" 
                    id="confirmNewPassword" 
                    v-model="passwordForm.confirmNewPassword"
                    :class="{'is-invalid': passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword}"
                    :required="isChangingPassword"
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="showConfirmPass = !showConfirmPass">
                    <i :class="showConfirmPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                  </button>
                </div>
              </div>

              <div v-if="passwordError" class="alert alert-danger mt-3 txt-caption p-2">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ passwordError }}
              </div>
            </form>
            
            <div class="text-end mt-auto pt-3"> 
              <button type="submit" form="changePasswordForm" class="btn btn-warning rounded-pill px-4 txt-body fw-bold" :disabled="passwordLoading || !isChangingPassword">
                 <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                 <i v-else class="bi bi-key-fill me-1"></i>
                {{ passwordLoading ? 'Menyimpan...' : 'Ubah Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div> 
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }
});

useHead({ title: 'Profil Admin' });

const { user, getUser } = useAuth();
const { $apiBase } = useNuxtApp() as any;

// Helper Format Phone (+62 -> 08)
const formatPhoneDisplay = (phone: string | null | undefined) => {
  if (!phone) return '';
  let str = String(phone).trim();
  if (str.startsWith('+62')) return '0' + str.slice(3);
  if (str.startsWith('62')) return '0' + str.slice(2);
  return str;
};

// Profile Form State
const profileForm = reactive({
  name: '',
  email: '',
  phone_number: '',
  role: ''
});
const profileLoading = ref(false);
const profileError = ref<string | null>(null);

// Password Form State
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});
const passwordLoading = ref(false);
const passwordError = ref<string | null>(null);

// Visibility Toggles
const showOldPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);

const isChangingPassword = computed(() => {
  return passwordForm.newPassword !== '' || passwordForm.confirmNewPassword !== '' || passwordForm.oldPassword !== '';
});

// Regex Rules
const isPasswordValid = computed(() => {
  const pwd = passwordForm.newPassword;
  if (!pwd) return false;
  
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);

  return hasMinLen && hasUpper && hasLower && hasNumber;
});
onMounted(async () => {
  if (!user.value) {
    try {
      await getUser(); 
    } catch (error) {
      console.error("Gagal memuat data user:", error);
      Swal.fire('Error', 'Gagal memuat data profil.', 'error');
    }
  }
  
  if (user.value) {
    profileForm.name = user.value.name || '';
    profileForm.email = user.value.email || '';
    profileForm.phone_number = formatPhoneDisplay(user.value.phone_number || user.value.Whatsapp || user.value.PhoneNumber);
    profileForm.role = user.value.role || user.value.Series || user.value.Role || 'user';
  }
});
const handleUpdateProfile = async () => {
  profileLoading.value = true;
  profileError.value = null;
  
  try {
    const accessToken = useCookie('AccessToken').value;
    if (!accessToken) throw new Error("Sesi kadaluarsa.");

    const payload = {
      name: profileForm.name,
      role: profileForm.role, 
      phone_number: profileForm.phone_number,
      AccessToken: accessToken
    };

    await $apiBase.put(`/update-account?email=${profileForm.email}&type=user-admin`, payload);

    if (user.value) {
        user.value.name = profileForm.name;
        user.value.phone_number = profileForm.phone_number;
    }

    Swal.fire('Berhasil', 'Profil Anda berhasil diperbarui.', 'success');

  } catch (err: any) {
    profileError.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal memperbarui profil.';
    console.error('Update profile error:', err);
  } finally {
    profileLoading.value = false;
  }
};
const handleChangePassword = async () => {
  if (!isChangingPassword.value) return;

  passwordLoading.value = true;
  passwordError.value = null;

  // 1. Validasi Match
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok.';
    passwordLoading.value = false;
    return;
  }

  // 2. Validasi Rules
  if (!isPasswordValid.value) {
    passwordError.value = 'Password baru tidak memenuhi syarat.';
    passwordLoading.value = false;
    return;
  }

  try {
    const accessToken = useCookie('AccessToken').value;
    if (!accessToken) throw new Error("Sesi kadaluarsa.");
    const payload = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      accessToken: accessToken
    };
    const response = await $apiBase.put('/change-password', payload);

    Swal.fire('Berhasil', 'Password berhasil diubah. Silakan login ulang.', 'success');
    
    // Reset
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';

  } catch (err: any) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal mengubah password.';
    
    if (msg.includes("Incorrect username or password") || msg.includes("NotAuthorizedException")) {
        passwordError.value = "Password lama yang Anda masukkan salah.";
    } else {
        passwordError.value = msg;
    }
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>