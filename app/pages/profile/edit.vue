<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <h1 class="mb-4 text-center">Edit Profil</h1>

        <div class="row g-4">

          <div class="col-lg-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0">Informasi Profil</h5>
              </div>
              <div class="card-body p-4 d-flex flex-column">
                <form @submit.prevent="handleUpdateProfile" id="updateProfileForm" class="flex-grow-1">
                  <div class="mb-3">
                    <label for="fullName" class="form-label">Nama Lengkap</label>
                    <input type="text" id="fullName" v-model="profileForm.name" class="form-control" required>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" v-model="profileForm.email" class="form-control" required disabled>
                    <small class="text-muted">Email tidak dapat diubah.</small>
                  </div>

                  <div class="mb-3">
                    <label for="phoneNumber" class="form-label">No. Handphone (WhatsApp)</label>
                    <input type="text" id="phoneNumber" v-model="profileForm.phone_number" class="form-control"
                      placeholder="08..." required>
                  </div>

                  <div class="mb-3">
                    <label for="birthDate" class="form-label">Tanggal Lahir</label>
                    <input type="date" id="birthDate" v-model="profileForm.birth_date" class="form-control" required>
                  </div>

                  <div class="mb-3">
                    <label for="gender" class="form-label">Jenis Kelamin</label>
                    <select id="gender" v-model="profileForm.gender" class="form-select" required>
                      <option value="" disabled>Pilih Gender</option>
                      <option value="male">Ikhwan (Laki-laki)</option>
                      <option value="female">Akhwat (Perempuan)</option>
                    </select>
                  </div>

                  <div v-if="profileError" class="alert alert-danger mt-3 small p-2">
                    {{ profileError }}
                  </div>
                </form>
                <div class="mt-auto pt-3 text-end">
                  <button type="submit" form="updateProfileForm" class="btn btn-primary" :disabled="profileLoading">
                    <span v-if="profileLoading" class="spinner-border spinner-border-sm me-1" role="status"
                      aria-hidden="true"></span>
                    {{ profileLoading ? 'Menyimpan...' : 'Simpan Info Profil' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0">Ubah Password</h5>
              </div>
              <div class="card-body p-4 d-flex flex-column">
                <p class="text-muted small mb-3">Kosongkan jika tidak ingin mengubah password.</p>

                <form @submit.prevent="handleChangePassword" id="changePasswordForm" class="flex-grow-1">

                  <div class="mb-3">
                    <label for="currentPassword" class="form-label">Password Saat Ini</label>
                    <div class="input-group">
                      <input :type="showOldPass ? 'text' : 'password'" id="currentPassword"
                        v-model="passwordForm.oldPassword" class="form-control" placeholder="Masukkan password lama"
                        :required="isChangingPassword">
                      <button class="btn btn-outline-secondary" type="button" @click="showOldPass = !showOldPass">
                        <svg v-if="showOldPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                          fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                          <path
                            d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                          class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                          <path
                            d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                          <path
                            d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="newPassword" class="form-label">Password Baru</label>
                    <div class="input-group">
                      <input :type="showNewPass ? 'text' : 'password'" id="newPassword"
                        v-model="passwordForm.newPassword" class="form-control"
                        :class="{ 'is-invalid': isChangingPassword && !isPasswordValid && passwordForm.newPassword.length > 0, 'is-valid': isPasswordValid }"
                        placeholder="Min. 8 karakter, Besar, Kecil, Angka" :required="isChangingPassword">
                      <button class="btn btn-outline-secondary" type="button" @click="showNewPass = !showNewPass">
                        <svg v-if="showNewPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                          fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                          <path
                            d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                          class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                          <path
                            d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                          <path
                            d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                        </svg>
                      </button>
                    </div>
                    <div class="form-text small" :class="isPasswordValid ? 'text-success' : 'text-muted'">
                      <i v-if="isPasswordValid" class="bi bi-check-circle-fill me-1"></i>
                      Syarat: Min. 8 Karakter, Huruf Besar, Huruf Kecil, & Angka.
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Konfirmasi Password Baru</label>
                    <div class="input-group">
                      <input :type="showConfirmPass ? 'text' : 'password'" id="confirmPassword"
                        v-model="passwordForm.confirmNewPassword" class="form-control"
                        :class="{ 'is-invalid': passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword }"
                        :required="isChangingPassword">
                      <button class="btn btn-outline-secondary" type="button"
                        @click="showConfirmPass = !showConfirmPass">
                        <svg v-if="showConfirmPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                          fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                          <path
                            d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                          class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                          <path
                            d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                          <path
                            d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div v-if="passwordError" class="alert alert-danger mt-3 small p-2">
                    {{ passwordError }}
                  </div>
                </form>
                <div class="mt-auto pt-3 text-end">
                  <NuxtLink to="/dashboard" class="btn btn-secondary me-2">Batal</NuxtLink>
                  <button type="submit" form="changePasswordForm" class="btn btn-warning"
                    :disabled="passwordLoading || !isChangingPassword"
                    title="Isi password baru untuk mengaktifkan tombol ini">
                    <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-1" role="status"
                      aria-hidden="true"></span>
                    {{ passwordLoading ? 'Menyimpan...' : 'Ubah Password' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';

useHead({ title: 'Edit Profil' });

definePageMeta({
  middleware: () => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) {
      return navigateTo('/auth/login');
    }
  }
});

const router = useRouter();
const { user, getUser } = useAuth();
const { $apiBase } = useNuxtApp() as any;

// --- Helper: Format Phone (Convert +62/62 to 0) ---
const formatPhoneDisplay = (phone: string | null | undefined) => {
  if (!phone) return '';
  let p = String(phone).trim();
  if (p.startsWith('+62')) return '0' + p.slice(3);
  if (p.startsWith('62')) return '0' + p.slice(2);
  return p;
};

// Form State
const profileForm = reactive({
  name: '',
  email: '',
  phone_number: '',
  birth_date: '',
  gender: ''
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

// --- Visibility Toggles (Icon Mata) ---
const showOldPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);

const isChangingPassword = computed(() => {
  return passwordForm.newPassword !== '' || passwordForm.confirmNewPassword !== '' || passwordForm.oldPassword !== '';
});

// --- Validasi Regex Password (Aturan: Min 8, Lower, Upper, Number) ---
const isPasswordValid = computed(() => {
  const pwd = passwordForm.newPassword;
  if (!pwd) return false;

  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd); // \d itu digit (angka)

  return hasMinLen && hasUpper && hasLower && hasNumber;
});

// Populate Form Logic
const populateForm = (userData: any) => {
  if (!userData) return;
  profileForm.name = userData.name || '';
  profileForm.email = userData.email || '';
  profileForm.phone_number = formatPhoneDisplay(userData.phone_number || userData.PhoneNumber || '');
  profileForm.birth_date = userData.birth_date || userData.Birth_Date || '';
  profileForm.gender = userData.gender || userData.Gender || '';
};

onMounted(async () => {
  if (!user.value) {
    try {
      await getUser();
    } catch (error) {
      console.error("Gagal memuat data user:", error);
      Swal.fire('Error', 'Gagal memuat data profil. Silakan login ulang.', 'error').then(() => {
        router.push('/auth/login');
      });
    }
  }
  populateForm(user.value);
});

watch(user, (newVal) => {
  populateForm(newVal);
});

// --- UPDATE PROFILE HANDLER ---
const handleUpdateProfile = async () => {
  profileLoading.value = true;
  profileError.value = null;

  try {
    const accessToken = useCookie('AccessToken').value;
    if (!accessToken) throw new Error("Sesi kadaluarsa, silakan login ulang.");

    // Payload Update Profile
    const payload = {
      name: profileForm.name,
      birth_date: profileForm.birth_date,
      gender: profileForm.gender,
      phone_number: profileForm.phone_number,
      AccessToken: accessToken
    };

    await $apiBase.put(`/update-account?email=${profileForm.email}&type=user-client`, payload);

    // Update local state
    if (user.value) {
      user.value.name = profileForm.name;
      user.value.birth_date = profileForm.birth_date;
      user.value.gender = profileForm.gender;
      user.value.phone_number = profileForm.phone_number;
    }

    Swal.fire('Berhasil', 'Informasi profil berhasil diperbarui.', 'success');

  } catch (err: any) {
    profileError.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal memperbarui profil.';
    console.error('Update profile error:', err);
  } finally {
    profileLoading.value = false;
  }
};

// --- CHANGE PASSWORD HANDLER ---
const handleChangePassword = async () => {
  if (!isChangingPassword.value) return;

  passwordLoading.value = true;
  passwordError.value = null;

  // 1. Cek Kecocokan Konfirmasi
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok.';
    passwordLoading.value = false;
    return;
  }

  // 2. Cek Rule Password (Regex)
  if (!isPasswordValid.value) {
    passwordError.value = 'Password baru tidak memenuhi syarat (Min. 8 karakter, Huruf Besar, Huruf Kecil, dan Angka).';
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

    const response = await $apiBase.put('/change-password', payload);

    console.log('Change Password Success:', response);

    Swal.fire('Berhasil', 'Password berhasil diubah. Silakan login ulang dengan password baru.', 'success').then(() => {
      // Optional: Logout kalau mau aman
    });

    // Reset form
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

    console.error('Change password error:', err);
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>