<template>
  <div>
    <div class="page-header mb-4">
      <h1 class="page-title">Edit User</h1>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
          <li class="breadcrumb-item"><NuxtLink to="/admin/users">Semua User</NuxtLink></li>
          <li class="breadcrumb-item active" aria-current="page">Edit User</li>
        </ol>
      </nav>
    </div>

    <div class="card content-card">
      <div class="card-header">
        <h5 class="mb-0">Formulir Edit User</h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <form v-else @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="fullName" class="form-label">Nama Lengkap</label>
              <input type="text" class="form-control" id="fullName" v-model="form.name" required>
            </div>

            <div class="col-md-6">
              <label for="email" class="form-label">Alamat Email (ID)</label>
              <input type="text" class="form-control" id="email" v-model="form.email" required disabled>
            </div>

            <div class="col-md-6">
              <label for="phone" class="form-label">No. Handphone</label>
              <input type="text" class="form-control" id="phone" v-model="form.phone_number" placeholder="08..." required>
            </div>

            <div class="col-md-6">
              <label for="role" class="form-label">Role</label>
              <select id="role" class="form-select" v-model="form.role" :disabled="!canEditRole" required>
                <option value="user">Client</option>
                <option value="admin">Admin</option>
                <option value="super_role">Super Role (Admin)</option>
                <option value="root">Root</option>
                <option value="bendahara">Bendahara</option>
                <option value="registrasi">Registrasi</option>
              </select>
              <small v-if="!canEditRole" class="text-danger">
                Hanya Root & Super Role yang dapat mengubah role.
              </small>
            </div>

            <div class="col-12">
              <hr>
              <p class="text-muted small">
                <i>Fitur ubah password user lain saat ini dinonaktifkan untuk keamanan. User harus mereset password mereka sendiri.</i>
              </p>
            </div>
          </div>

          <div class="mt-4 text-end">
            <NuxtLink to="/admin/users" class="btn btn-secondary me-2">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
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
const { user } = useAuth(); // Ambil data admin yang sedang login
const { $apiBase } = useNuxtApp() as any;

// Decode ID dari URL
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

// Helper Format Phone (+62 -> 08)
const formatPhoneDisplay = (phone: string | null | undefined) => {
  if (!phone) return '';
  let str = String(phone).trim();
  if (str.startsWith('+62')) return '0' + str.slice(3);
  if (str.startsWith('62')) return '0' + str.slice(2);
  return str;
};

// Computed: Cek Hak Akses Edit Role
const canEditRole = computed(() => {
  const myRole = user.value?.role || user.value?.series || ''; // Sesuaikan dengan properti role di object user Anda
  // Hanya 'root' dan 'super_role' yang boleh edit role
  return ['root', 'super_role'].includes(myRole);
});

onMounted(async () => {
  // 1. Pastikan data users ada di store
  if (store.users.length === 0) {
    try {
      await store.getListaccount('all', true); // Fetch semua user jika store kosong
    } catch (e) {
      console.error("Gagal load list users:", e);
    }
  }

  // 2. Cari user berdasarkan ID (Email/SK)
  const foundUser = store.users.find(u => u.SK === userId);

  if (foundUser) {
    form.name = foundUser.Name;
    form.email = foundUser.SK;
    form.phone_number = formatPhoneDisplay(foundUser.phone_number || foundUser.Whatsapp || foundUser.PhoneNumber);
    
    // Normalisasi Role
    let rawRole = foundUser.role || foundUser.Series || foundUser.Role || 'user';
    // Mapping nama role jika di DB beda dengan value select (misal 'super role' -> 'super_role')
    if (rawRole === 'super role') rawRole = 'super_role';
    
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
      store.getListaccount('all', true).then(() => {
        router.push('/admin/users');
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