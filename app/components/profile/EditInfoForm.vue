<template>
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
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';
import { useNuxtApp, useCookie } from '#app'; // Ditambahin import standard Nuxt

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
</script>