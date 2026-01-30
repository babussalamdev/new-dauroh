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
        <div class="card content-card h-100"> 
          <div class="card-header">
            <h5 class="mb-0">Informasi Profil</h5>
          </div>
          <div class="card-body d-flex flex-column"> 
            <form @submit.prevent="handleUpdateProfile" id="updateProfileForm" class="flex-grow-1">
              <div class="mb-3">
                <label for="adminName" class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" id="adminName" v-model="profileForm.name" required>
              </div>
              
              <div class="mb-3">
                <label for="adminEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="adminEmail" v-model="profileForm.email" required disabled>
                <small class="text-muted">Email tidak dapat diubah.</small>
              </div>

              <div class="mb-3">
                <label for="adminPhone" class="form-label">No. Handphone</label>
                <input type="text" class="form-control" id="adminPhone" v-model="profileForm.phone_number" placeholder="08..." required>
              </div>

              <div class="mb-3">
                <label class="form-label">Role</label>
                <input type="text" class="form-control bg-light" :value="profileForm.role" readonly>
              </div>

              <div v-if="profileError" class="alert alert-danger mt-3 small p-2">
                {{ profileError }}
              </div>
            </form>
            
            <div class="text-end mt-auto pt-3"> 
              <button type="submit" form="updateProfileForm" class="btn btn-primary" :disabled="profileLoading">
                <span v-if="profileLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{ profileLoading ? 'Menyimpan...' : 'Simpan Info Profil' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6"> 
        <div class="card content-card h-100"> 
          <div class="card-header">
            <h5 class="mb-0">Ubah Password</h5>
          </div>
          <div class="card-body d-flex flex-column"> 
            <p class="text-muted small mb-3">Kosongkan jika tidak ingin mengubah password.</p>
            <form @submit.prevent="handleChangePassword" class="flex-grow-1" id="changePasswordForm">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Password Saat Ini</label>
                <input type="password" class="form-control" id="currentPassword" v-model="passwordForm.oldPassword">
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">Password Baru</label>
                <input type="password" class="form-control" id="newPassword" v-model="passwordForm.newPassword">
              </div>
              <div class="mb-3">
                <label for="confirmNewPassword" class="form-label">Konfirmasi Password Baru</label>
                <input type="password" class="form-control" id="confirmNewPassword" v-model="passwordForm.confirmNewPassword">
              </div>
            </form>
            
            <div class="text-end mt-auto pt-3"> 
              <button type="submit" form="changePasswordForm" class="btn btn-warning" :disabled="passwordLoading">
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
      return navigateTo('/admin/login');
    }
  }
});

useHead({ title: 'Profil Admin' });

const { user, getUser } = useAuth();
const { $apiBase } = useNuxtApp() as any;
const router = useRouter();

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
    
    // Format No HP biar rapi (08xxx)
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
      role: profileForm.role, // Kita kirim balik role dia sendiri
      phone_number: profileForm.phone_number,
      AccessToken: accessToken
    };

   
    const response = await $apiBase.put(`/update-account?email=${profileForm.email}&type=user-admin`, payload);

    console.log('Update Success:', response);

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
   Swal.fire({
    title: 'Fitur Belum Tersedia',
    text: 'Mohon maaf, fitur ubah password sedang dalam pengembangan.',
    icon: 'info'
  });
  
  // Reset form
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmNewPassword = '';
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>