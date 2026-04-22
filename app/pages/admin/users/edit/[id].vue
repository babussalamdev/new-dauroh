<template>
  <div>
    <div class="page-header mb-4">
      <h1 class="page-title txt-title">Edit User</h1>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none txt-caption text-muted">Home</NuxtLink></li>
          <li class="breadcrumb-item"><NuxtLink to="/admin/users" class="text-decoration-none txt-caption text-muted">Manajemen User</NuxtLink></li>
          <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Edit User</li>
        </ol>
      </nav>
    </div>

    <div class="card content-card border-0 shadow-sm rounded-4">
      <div class="card-header bg-white py-3 px-4 border-bottom">
        <h5 class="mb-0 txt-subtitle text-dark"><i class="bi bi-pencil-square text-primary me-2"></i>Formulir Edit User</h5>
      </div>
      
      <div class="card-body p-4">
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div v-else-if="isRootTarget" class="text-center py-5">
          <i class="bi bi-shield-lock-fill text-danger fs-1"></i>
          <h5 class="txt-subtitle mt-3 text-dark">Akses Ditolak</h5>
          <p class="text-muted txt-body">Akun dengan otoritas Root tidak dapat diubah oleh siapapun melalui halaman ini.</p>
          <NuxtLink to="/admin/users" class="btn btn-outline-secondary mt-2 txt-body rounded-pill px-4 fw-medium">Kembali ke Daftar User</NuxtLink>
        </div>

        <form v-else @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="fullName" class="form-label txt-label text-secondary">Nama Lengkap</label>
              <input type="text" class="form-control bg-light border-0 txt-body" id="fullName" v-model="form.name" required>
            </div>

            <div class="col-md-6">
              <label for="email" class="form-label txt-label text-secondary">Alamat Email (ID)</label>
              <input type="text" class="form-control bg-light border-0 txt-body" id="email" v-model="form.email" required disabled>
            </div>

            <div class="col-md-6">
              <label for="phone" class="form-label txt-label text-secondary">No. Handphone</label>
              <input type="text" class="form-control bg-light border-0 txt-body" id="phone" v-model="form.phone_number" placeholder="08..." required>
            </div>

            <div class="col-md-6">
              <label for="role" class="form-label txt-label text-secondary">Role (Hak Akses)</label>
              <select id="role" class="form-select bg-light border-0 txt-body" v-model="form.role" :disabled="!canEditRole" required>
                <option v-for="roleOption in availableRoles" :key="roleOption.value" :value="roleOption.value">
                  {{ roleOption.label }}
                </option>
                <option v-if="!availableRoles.find(r => r.value === form.role)" :value="form.role" disabled>
                   {{ formatRoleName(form.role) }} (Tidak punya akses untuk mengubah role ini)
                </option>
              </select>
              <div v-if="!canEditRole" class="form-text text-danger txt-caption mt-1 fw-medium">
                <i class="bi bi-exclamation-circle me-1"></i> Level otoritas Anda (<strong>{{ formatRoleName(user?.role) }}</strong>) tidak mengizinkan perubahan role user.
              </div>
              <div v-else class="form-text text-primary txt-caption mt-1 fw-medium">
                <i class="bi bi-info-circle me-1"></i> Pilihan role dibatasi sesuai tingkat otoritas Anda.
              </div>
            </div>

            <div class="col-12 mt-4">
              <div class="bg-light p-3 rounded-3 border">
                <p class="text-muted txt-caption mb-0">
                  <i class="bi bi-shield-check me-2 text-success"></i>
                  <strong>Catatan Keamanan:</strong> Fitur ubah password user saat ini dinonaktifkan. Gunakan tombol berlogo <i class="bi bi-key-fill text-warning"></i> pada tabel Manajemen User untuk melakukan <i>Force Reset Password</i>.
                </p>
              </div>
            </div>
          </div>

          <hr class="border-secondary border-opacity-25 my-4">

          <div class="d-flex justify-content-end gap-2">
            <NuxtLink to="/admin/users" class="btn btn-light border px-4 txt-body fw-bold rounded-pill" :class="{ disabled: submitting }">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary px-4 txt-body fw-bold rounded-pill" :disabled="submitting || isRootTarget">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-floppy-fill me-1"></i>
              {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useAdminUserStore } from '~/stores/adminUser';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});

const route = useRoute();
const router = useRouter();
const store = useAdminUserStore();
const { user } = useAuth(); 
const { $apiBase } = useNuxtApp() as any;

const userId = decodeURIComponent(route.params.id as string);

const loading = ref(true);
const submitting = ref(false);

const form = reactive({
  id: userId,
  name: '',
  email: '',
  phone_number: '',
  role: 'user',
});

// Helper
const formatPhoneDisplay = (phone: string | null | undefined) => {
  if (!phone) return '';
  let str = String(phone).trim();
  if (str.startsWith('+62')) return '0' + str.slice(3);
  if (str.startsWith('62')) return '0' + str.slice(2);
  return str;
};

const formatRoleName = (roleStr: string | null | undefined) => {
  if (!roleStr) return 'Admin';
  const role = roleStr.toLowerCase();
  if (role === 'root') return 'Root';
  if (role === 'user') return 'Client';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// --- LOGIKA HAK AKSES ROLE (Sama kayak halaman Create) ---
const availableRoles = computed(() => {
  const myRole = (user.value?.role || user.value?.Series || '').toLowerCase();

  // Root bisa ubah jadi Admin, Bendahara, Registrasi
  if (myRole === 'root') {
    return [
      { label: 'Admin Standar', value: 'admin' },
      { label: 'Bendahara (Keuangan)', value: 'bendahara' },
      { label: 'Petugas Registrasi (Check-in)', value: 'registrasi' }
    ];
  }
  
  // Admin cuma bisa ubah jadi Bendahara atau Registrasi
  if (myRole === 'admin') {
    return [
      { label: 'Bendahara (Keuangan)', value: 'bendahara' },
      { label: 'Petugas Registrasi (Check-in)', value: 'registrasi' }
    ];
  }

  return [];
});

// Cek apakah akun yg mau diedit adalah ROOT
const isRootTarget = computed(() => {
  return form.role === 'root';
});

// Cek hak Edit Role
const canEditRole = computed(() => {
  const myRole = (user.value?.role || user.value?.Series || '').toLowerCase();
  
  // 1. Root BISA ganti role siapa aja (kecuali sesama root karena isRootTarget bakal ngeblok duluan)
  if (myRole === 'root') return true;
  
  // 2. Admin BISA ganti role bawahan, TAPI GAK BISA ganti role root atau sesama admin
  if (myRole === 'admin') {
     return !['root', 'admin'].includes(form.role);
  }

  return false;
});


onMounted(async () => {
  if (store.users.length === 0) {
    try {
      await store.getListaccount('all', true); 
    } catch (e) {
      console.error("Gagal load list users:", e);
    }
  }

  const foundUser = store.users.find(u => u.SK === userId);

if (foundUser) {
    form.name = foundUser.Name;
    form.email = foundUser.SK;
    form.phone_number = formatPhoneDisplay(foundUser.phone_number || foundUser.Whatsapp || foundUser.PhoneNumber);
    
    let rawRole = foundUser.role || foundUser.Series || foundUser.Role || 'user';
    form.role = rawRole.toLowerCase();
    
    loading.value = false;
  } else {
    Swal.fire({
      title: 'User Tidak Ditemukan',
      text: `Data user dengan ID ${userId} tidak ditemukan.`,
      icon: 'error',
    }).then(() => {
      router.push('/admin/users');
    });
  }
});

const handleSubmit = async () => {
  submitting.value = true;
  
  try {
    const accessToken = useCookie('AccessToken').value;
    if (!accessToken) throw new Error("Sesi admin kadaluarsa.");
    const payload = {
      name: form.name,
      role: form.role,
      phone_number: form.phone_number,
      AccessToken: accessToken
    };

    await $apiBase.put(`/update-account?email=${form.email}&type=user-admin`, payload);

    Swal.fire({
      title: 'Berhasil!',
      text: 'Data user telah diperbarui.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      // Tembak API biar data di store fresh, trs redirect sesuai role
      store.getListaccount('all', true).then(() => {
        const targetTab = form.role === 'user' ? 'client' : 'admin';
        router.push(`/admin/users?type=${targetTab}`);
      });
    });

  } catch (error: any) {
    console.error('Gagal mengupdate user:', error);
    Swal.fire({
      title: 'Gagal Update',
      text: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan.',
      icon: 'error',
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-primary);
}
</style>