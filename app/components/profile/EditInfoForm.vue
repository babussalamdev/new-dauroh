<template>
  <div class="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
    <div class="card-header bg-white py-3 border-bottom-0 pt-4 px-4">
      <h5 class="mb-0 txt-subtitle fw-bold text-dark">Informasi Profil</h5>
    </div>
    
    <div class="card-body p-4 pt-2 d-flex flex-column">
      <form @submit.prevent="handleUpdateProfile" id="updateProfileForm" class="flex-grow-1">
        
        <div class="mb-3">
          <label for="fullName" class="form-label txt-label fw-bold text-secondary">Nama Lengkap</label>
          <input type="text" id="fullName" v-model="profileForm.name" class="form-control txt-body" required>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label txt-label fw-bold text-secondary">Email</label>
          <input type="email" id="email" v-model="profileForm.email" class="form-control txt-body bg-light" required disabled>
          <span class="text-muted txt-caption d-block mt-1">Email tidak dapat diubah.</span>
        </div>

        <div class="mb-3">
          <label for="phoneNumber" class="form-label txt-label fw-bold text-secondary">No. Handphone (WhatsApp)</label>
          <input type="text" id="phoneNumber" v-model="profileForm.phone_number" class="form-control txt-body"
            placeholder="08..." required>
        </div>

        <div class="mb-3">
          <label for="birthDate" class="form-label txt-label fw-bold text-secondary">Tanggal Lahir</label>
          <input type="date" id="birthDate" v-model="profileForm.birth_date" class="form-control txt-body" required>
        </div>

        <div class="mb-3">
          <label for="gender" class="form-label txt-label fw-bold text-secondary">Jenis Kelamin</label>
          <select id="gender" v-model="profileForm.gender" class="form-select txt-body" required>
            <option value="" disabled>Pilih Gender</option>
            <option value="male">Ikhwan (Laki-laki)</option>
            <option value="female">Akhwat (Perempuan)</option>
          </select>
        </div>

        <div v-if="profileError" class="alert alert-danger mt-3 txt-caption fw-bold p-2 rounded-3 border-0">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ profileError }}
        </div>
        
      </form>
      
      <div class="mt-auto pt-4 text-end border-top">
        <button type="submit" form="updateProfileForm" class="btn btn-primary rounded-pill txt-body fw-bold px-4 shadow-sm" :disabled="profileLoading">
          <span v-if="profileLoading" class="spinner-border spinner-border-sm me-2" role="status"
            aria-hidden="true"></span>
          {{ profileLoading ? 'Menyimpan...' : 'Simpan Info Profil' }}
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue';
import { useAlert } from '~/utils/swal';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';
import { useNuxtApp, useCookie } from '#app'; // Ditambahin import standard Nuxt

const router = useRouter();
const { user, getUser } = useAuth();
const { $apiBase } = useNuxtApp() as any;
const { alert: swalAlert } = useAlert();

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
      
      swalAlert('Error', 'Gagal memuat data profil. Silakan login ulang.', 'error').then(() => {
        router.push('/auth');
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

    const payload = {
      name: profileForm.name,
      birth_date: profileForm.birth_date,
      gender: profileForm.gender,
      phone_number: profileForm.phone_number,
      AccessToken: accessToken
    };

    await $apiBase.put(`/update-account?email=${profileForm.email}&type=user-client`, payload);

    // Update local state agar navbar ikut berubah namanya secara real-time
    if (user.value) {
      user.value.name = profileForm.name;
      user.value.birth_date = profileForm.birth_date;
      user.value.gender = profileForm.gender;
      user.value.phone_number = profileForm.phone_number;
    }

    // 🟢 Notifikasi Berhasil yang Halus
    swalAlert('Berhasil', 'Informasi profil berhasil diperbarui.', 'success');

  } catch (err: any) {
    profileError.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal memperbarui profil.';
    console.error('Update profile error:', err);
    // 🟢 Munculin juga pop-up error biar user sadar ada masalah
    swalAlert('Gagal', profileError.value ?? 'Terjadi kesalahan sistem', 'error');
  } finally {
    profileLoading.value = false;
  }
};
</script>