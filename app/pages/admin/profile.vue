<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Profil Saya</li>
      </ol>
    </nav>

    <div class="row g-4"> 
      <div class="col-lg-6"> 
        <div class="card content-card h-100"> <div class="card-header">
            <h5 class="mb-0">Informasi Profil</h5>
          </div>
          <div class="card-body d-flex flex-column"> <form @submit.prevent="handleUpdateProfile" class="flex-grow-1">
              <div class="mb-3">
                <label for="adminName" class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" id="adminName" v-model="profileForm.name" required>
              </div>
              <div class="mb-3">
                <label for="adminEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="adminEmail" v-model="profileForm.email" required disabled>
              </div>
              <div v-if="profileError" class="alert alert-danger mt-3 small p-2">
                {{ profileError }}
              </div>
               </form>
             <div class="text-end mt-auto pt-3"> <button type="submit" form="updateProfileForm" class="btn btn-primary" :disabled="profileLoading">
                  <span v-if="profileLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {{ profileLoading ? 'Menyimpan...' : 'Simpan Info Profil' }}
                </button>
              </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6"> 
        <div class="card content-card h-100"> <div class="card-header">
            <h5 class="mb-0">Ubah Password</h5>
          </div>
          <div class="card-body d-flex flex-column"> <form @submit.prevent="handleChangePassword" class="flex-grow-1" id="changePasswordForm">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Password Saat Ini</label>
                <input type="password" class="form-control" id="currentPassword" v-model="passwordForm.oldPassword" required>
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">Password Baru</label>
                <input type="password" class="form-control" id="newPassword" v-model="passwordForm.newPassword" required>
              </div>
              <div class="mb-3">
                <label for="confirmNewPassword" class="form-label">Konfirmasi Password Baru</label>
                <input type="password" class="form-control" id="confirmNewPassword" v-model="passwordForm.confirmNewPassword" required>
              </div>
               <div v-if="passwordError" class="alert alert-danger mt-3 small p-2">
                {{ passwordError }}
              </div>
               </form>
             <div class="text-end mt-auto pt-3"> <button type="submit" form="changePasswordForm" class="btn btn-warning" :disabled="passwordLoading">
                   <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
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
import { reactive, ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      // Redirect non-admin or unauthenticated users
      return navigateTo('/admin/login'); // Redirect to admin login or home
    }
  }
});

useHead({
  title: 'Profil Admin'
});

const { user, getUser } = useAuth(); // Get user state and fetch function
const { $apiBase } = useNuxtApp();
const router = useRouter();

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

// Fetch user data on mount if not already loaded
onMounted(async () => {
  if (!user.value) {
    try {
      await getUser(); // Fetch user data if it's missing
    } catch (error) {
      console.error("Gagal memuat data user:", error);
      Swal.fire('Error', 'Gagal memuat data profil.', 'error');
      // Maybe redirect or show an error state
    }
  }
  // Populate form after user data is potentially fetched
  if (user.value) {
    profileForm.name = user.value.name || '';
    profileForm.email = user.value.email || '';
  }
});

// Update Profile Info Handler
const handleUpdateProfile = async () => {
  profileLoading.value = true;
  profileError.value = null;
  try {
    // // Untuk bagian integrasi BE: Panggil API update profile (misalnya endpoint /update-profile)
    // const accessToken = useCookie('AccessToken').value; // <-- PERBAIKAN KONSISTENSI
    // await $apiBase.put('/update-profile', { // Ganti dengan endpoint yang benar
    //   name: profileForm.name,
    //   accessToken: accessToken // Sesuaikan payload jika perlu
    // });

    // --- Simulasi Sukses ---
    console.log('Update info profil:', { name: profileForm.name });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulasi delay
    // Update user state lokal setelah sukses
    if (user.value) {
        user.value.name = profileForm.name;
    }
    // --- Akhir Simulasi ---

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
  passwordLoading.value = true;
  passwordError.value = null;

  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok.';
    passwordLoading.value = false;
    return;
  }
   if (passwordForm.newPassword.length < 6) { // Contoh validasi minimal panjang password
    passwordError.value = 'Password baru minimal harus 6 karakter.';
    passwordLoading.value = false;
    return;
  }

  try {
    // // Untuk bagian integrasi BE: Panggil API change password
    const accessToken = useCookie('AccessToken').value; // <-- PERBAIKAN KONSISTENSI
    // if (!accessToken) {
    //   throw new Error('Autentikasi gagal, token tidak ditemukan.');
    // }

    // const payload = {
    //   oldPassword: passwordForm.oldPassword,
    //   newPassword: passwordForm.newPassword,
    //   accessToken: accessToken // Sertakan access token sesuai kebutuhan API Anda
    // };
    // await $apiBase.post('/change-password', payload); // Ganti dengan endpoint yang benar

    // --- Simulasi Sukses ---
    console.log('Mengubah password...');
    console.log('Payload (simulasi):', {
       oldPassword: passwordForm.oldPassword,
       newPassword: passwordForm.newPassword,
       accessToken: accessToken || 'SIMULATED_ACCESS_TOKEN' // Ganti dengan token asli saat integrasi
    });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay
    // --- Akhir Simulasi ---


    Swal.fire('Berhasil', 'Password berhasil diubah.', 'success');
    // Reset form password
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
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}
.breadcrumb a {
  text-decoration: none;
  color: var(--bs-secondary-color);
}
/* Menambahkan style agar tinggi kartu konsisten saat berdampingan */
.row > [class*='col-'] > .card {
  display: flex;
  flex-direction: column;
}
</style>