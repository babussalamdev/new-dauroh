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
                    <label for="phoneNumber" class="form-label">No. Handphone</label>
                    <input type="text" id="phoneNumber" v-model="profileForm.phone_number" class="form-control" placeholder="08..." required>
                  </div>

                  <div class="mb-3">
                    <label for="birthDate" class="form-label">Tanggal Lahir</label>
                    <input type="date" id="birthDate" v-model="profileForm.birth_date" class="form-control" required>
                  </div>

                  <div class="mb-3">
                    <label for="gender" class="form-label">Jenis Kelamin</label>
                    <select id="gender" v-model="profileForm.gender" class="form-select" required>
                      <option value="" disabled>Pilih Gender</option>
                      <option value="male">Laki-laki (Male)</option>
                      <option value="female">Perempuan (Female)</option>
                    </select>
                  </div>

                   <div v-if="profileError" class="alert alert-danger mt-3 small p-2">
                    {{ profileError }}
                  </div>
                </form>
                 <div class="mt-auto pt-3 text-end"> 
                    <button type="submit" form="updateProfileForm" class="btn btn-primary" :disabled="profileLoading">
                       <span v-if="profileLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
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
                    <input type="password" id="currentPassword" v-model="passwordForm.oldPassword" class="form-control" placeholder="Diperlukan jika mengubah password" :required="isChangingPassword">
                  </div>
                  <div class="mb-3">
                    <label for="newPassword" class="form-label">Password Baru</label>
                    <input type="password" id="newPassword" v-model="passwordForm.newPassword" class="form-control" :required="isChangingPassword">
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Konfirmasi Password Baru</label>
                   <input type="password" id="confirmPassword" v-model="passwordForm.newPassword" class="form-control" :required="isChangingPassword">
                  </div>

                  <div v-if="passwordError" class="alert alert-danger mt-3 small p-2">
                    {{ passwordError }}
                  </div>
                </form>
                 <div class="mt-auto pt-3 text-end"> <NuxtLink to="/dashboard" class="btn btn-secondary me-2">Batal</NuxtLink>
                    <button type="submit" form="changePasswordForm" class="btn btn-warning" :disabled="passwordLoading || !isChangingPassword" title="Isi password baru untuk mengaktifkan tombol ini">
                       <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
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
import { reactive, ref, onMounted, computed, watch } from 'vue'; // Tambah 'watch'
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';

useHead({ title: 'Edit Profil' });

definePageMeta({
  middleware: () => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) {
      return navigateTo('/login');
    }
  }
});

const router = useRouter();
const { user, getUser } = useAuth();
const { $apiBase } = useNuxtApp() as any; 

// --- 1. Fungsi Helper Format Nomor HP (+62 -> 08) ---
const formatPhoneDisplay = (phone: string | null | undefined) => {
  if (!phone) return '';
  let str = String(phone).trim();
  
  // Kalau diawali +62, ganti jadi 0
  if (str.startsWith('+62')) return '0' + str.slice(3);
  
  // Kalau diawali 62 (tanpa plus), ganti jadi 0
  if (str.startsWith('62')) return '0' + str.slice(2);
  
  // Kalau udah 08 atau format lain, biarin aja
  return str;
};

// Profile Form State
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

const isChangingPassword = computed(() => {
  return passwordForm.newPassword !== '' || passwordForm.confirmNewPassword !== '' || passwordForm.oldPassword !== '';
});

// Fungsi untuk isi form (biar rapi & bisa dipanggil ulang)
const populateForm = (userData: any) => {
    if (!userData) return;
    
    profileForm.name = userData.name || '';
    profileForm.email = userData.email || '';
    
    // --- 2. Pake formatternya di sini ---
    profileForm.phone_number = formatPhoneDisplay(userData.phone_number || userData.PhoneNumber); 
    
    profileForm.birth_date = userData.birth_date || userData.Birth_Date || ''; 
    profileForm.gender = userData.gender || userData.Gender || '';
};

// Fetch user data on mount
onMounted(async () => {
    if (!user.value) {
        try {
            await getUser();
        } catch (error) {
            console.error("Gagal memuat data user:", error);
            Swal.fire('Error', 'Gagal memuat data profil. Silakan login ulang.', 'error').then(() => {
                router.push('/login');
            });
        }
    }
    // Isi form saat awal buka
    populateForm(user.value);
});

// --- 3. Watcher: Jaga-jaga kalau data 'user' telat masuk dari API ---
watch(user, (newVal) => {
    populateForm(newVal);
});

// Update Profile Info Handler (CLIENT)
const handleUpdateProfile = async () => {
  profileLoading.value = true;
  profileError.value = null;

  try {
    const accessToken = useCookie('AccessToken').value;
    if (!accessToken) throw new Error("Sesi kadaluarsa, silakan login ulang.");

    // Payload
    const payload = {
      name: profileForm.name,
      birth_date: profileForm.birth_date,
      gender: profileForm.gender,
      phone_number: profileForm.phone_number, // Kirim format 08 (biasanya backend nerima2 aja)
      AccessToken: accessToken
    };

    const response = await $apiBase.put(`/update-account?email=${profileForm.email}&type=user-client`, payload);
    
    // Update state user lokal
    if (user.value) {
        user.value.name = profileForm.name;
        user.value.phone_number = profileForm.phone_number;
        user.value.birth_date = profileForm.birth_date;
        user.value.gender = profileForm.gender;
    }

    Swal.fire('Berhasil', 'Informasi profil berhasil diperbarui.', 'success');

  } catch (err: any) {
    profileError.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal memperbarui profil.';
    console.error('Update profile error:', err);
  } finally {
    profileLoading.value = false;
  }
};

// Change Password Handler
const handleChangePassword = async () => {
  if (!isChangingPassword.value) return;

  passwordLoading.value = true;
  passwordError.value = null;

  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok.';
    passwordLoading.value = false;
    return;
  }

  try {
    // Simulasi sementara
    await new Promise(resolve => setTimeout(resolve, 1500));
    Swal.fire('Info', 'Fitur ubah password belum tersedia saat ini.', 'info');
    
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';

  } catch (err: any) {
    passwordError.value = err.message || 'Gagal mengubah password.';
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>