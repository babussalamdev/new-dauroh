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
                   <div v-if="profileError" class="alert alert-danger mt-3 small p-2">
                    {{ profileError }}
                  </div>
                </form>
                 <div class="mt-auto pt-3 text-end"> <button type="submit" form="updateProfileForm" class="btn btn-primary" :disabled="profileLoading">
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

        </div> </div>
    </div>
  </div>
</template>

<script setup lang="ts"> // Ubah ke lang="ts" jika belum
import { reactive, ref, onMounted, computed } from 'vue'; // Import computed
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';

useHead({
  title: 'Edit Profil'
});

// Middleware untuk memastikan user sudah login (jika diperlukan, sesuaikan)
definePageMeta({
  middleware: () => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) {
      return navigateTo('/login');
    }
  }
});

const router = useRouter();
const { user, getUser } = useAuth(); // Tambahkan getUser
const { $apiBase } = useNuxtApp(); // Tambahkan ini

// Profile Form State
const profileForm = reactive({
  name: '',
  email: ''
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

// Computed property untuk mengecek apakah user sedang mencoba mengubah password
const isChangingPassword = computed(() => {
  return passwordForm.newPassword !== '' || passwordForm.confirmNewPassword !== '' || passwordForm.oldPassword !== '';
});

// Fetch user data on mount if not already loaded
onMounted(async () => {
    if (!user.value) {
        try {
        await getUser(); // Fetch user data if it's missing
        } catch (error) {
        console.error("Gagal memuat data user:", error);
        Swal.fire('Error', 'Gagal memuat data profil. Silakan login ulang.', 'error').then(() => {
            router.push('/login'); // Arahkan ke login jika gagal fetch
        });
        }
    }
    // Populate form after user data is potentially fetched
    if (user.value) {
        profileForm.name = user.value.name || '';
        profileForm.email = user.value.email || '';
    }
});


// Update Profile Info Handler (Sama seperti admin, sesuaikan endpoint jika beda)
const handleUpdateProfile = async () => {
  profileLoading.value = true;
  profileError.value = null;
  try {
    // // Untuk bagian integrasi BE: Panggil API update profile user (misalnya endpoint /update-user-profile)
    // const accessToken = localStorage.getItem("IdToken");
    // await $apiBase.put('/update-user-profile', { // Ganti dengan endpoint yang benar
    //   name: profileForm.name,
    //   accessToken: accessToken // Sesuaikan payload
    // });

    // --- Simulasi Sukses ---
    console.log('Update info profil user:', { name: profileForm.name });
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (user.value) { user.value.name = profileForm.name; }
    // --- Akhir Simulasi ---

    Swal.fire('Berhasil', 'Informasi profil berhasil diperbarui.', 'success');

  } catch (err: any) {
    profileError.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal memperbarui profil.';
    console.error('Update profile error:', err);
  } finally {
    profileLoading.value = false;
  }
};

// Change Password Handler (Sama seperti admin, gunakan endpoint yang sama '/change-password')
const handleChangePassword = async () => {
  // Hanya proses jika user memang mengisi field password
  if (!isChangingPassword.value) {
      // Jika tombol ter-trigger tanpa mengisi, mungkin ada bug, abaikan saja.
      // Atau berikan notifikasi halus jika diperlukan.
      return;
  }

  passwordLoading.value = true;
  passwordError.value = null;

  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok.';
    passwordLoading.value = false;
    return;
  }
   if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'Password baru minimal harus 6 karakter.';
    passwordLoading.value = false;
    return;
  }
   if (!passwordForm.oldPassword) {
       passwordError.value = 'Password saat ini wajib diisi untuk mengubah password.';
       passwordLoading.value = false;
       return;
   }

  try {
    // // Untuk bagian integrasi BE: Panggil API change password (endpoint sama dengan admin)
    const accessToken = localStorage.getItem("AccessToken"); // Ambil AccessToken
    // if (!accessToken) {
    //   throw new Error('Autentikasi gagal, token tidak ditemukan.');
    // }
    // const payload = {
    //   oldPassword: passwordForm.oldPassword,
    //   newPassword: passwordForm.newPassword,
    //   accessToken: accessToken
    // };
    // await $apiBase.post('/change-password', payload);

    // --- Simulasi Sukses ---
     console.log('Mengubah password user...');
     console.log('Payload (simulasi):', {
       oldPassword: passwordForm.oldPassword,
       newPassword: passwordForm.newPassword,
       accessToken: 'SIMULATED_ACCESS_TOKEN' // Ganti dengan token asli saat integrasi
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    // --- Akhir Simulasi ---

    Swal.fire('Berhasil', 'Password berhasil diubah.', 'success');
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';

  } catch (err: any) {
    passwordError.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal mengubah password.';
    console.error('Change password error:', err);
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
/* Style mirip admin profile */
.content-card {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.card-header {
  background-color: #fff;
  border-bottom: 1px solid #eff2f5;
  padding: 1rem 1.25rem;
}
.row > [class*='col-'] > .card {
  display: flex;
  flex-direction: column;
}
</style>