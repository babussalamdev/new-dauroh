<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item"><NuxtLink to="/admin/users" class="text-decoration-none text-muted">Manajemen User</NuxtLink></li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Tambah Baru</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4">
      <div class="card-header bg-white py-3 px-4 border-bottom">
        <h5 class="mb-0 fw-bold text-dark"><i class="bi bi-person-plus-fill text-primary me-2"></i>Formulir User Baru</h5>
      </div>
      <div class="card-body p-4">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="fullName" class="form-label small fw-bold text-muted">Nama Lengkap</label>
              <input type="text" class="form-control bg-light border-0" id="fullName" v-model="form.name" required>
            </div>
            <div class="col-md-6">
              <label for="email" class="form-label small fw-bold text-muted">Alamat Email</label>
              <input type="email" class="form-control bg-light border-0" id="email" v-model="form.email" required>
            </div>

            <div class="col-md-6">
              <label for="username" class="form-label small fw-bold text-muted">Username</label>
              <input type="text" class="form-control bg-light border-0" id="username" v-model="form.username" required placeholder="Username untuk login">
            </div>
            <div class="col-md-6">
              <label for="phone" class="form-label small fw-bold text-muted">Nomor Telepon</label>
              <input type="tel" class="form-control bg-light border-0" id="phone" v-model="form.phone_number" required placeholder="08...">
            </div>

            <div class="col-md-6">
              <label for="password" class="form-label small fw-bold text-muted">Password</label>
              <input type="password" class="form-control bg-light border-0" id="password" v-model="form.password" required minlength="6">
            </div>

            <div class="col-md-6">
              <label for="role" class="form-label small fw-bold text-muted">Role (Hak Akses)</label>
              <select id="role" class="form-select bg-light border-0" v-model="form.role" required>
                <option v-for="roleOption in availableRoles" :key="roleOption.value" :value="roleOption.value">
                  {{ roleOption.label }}
                </option>
              </select>
              <div class="form-text text-primary small mt-1">
                <i class="bi bi-info-circle me-1"></i> Pilihan role disesuaikan dengan tingkat otoritas Anda (<strong>{{ formatRoleName(user?.role) }}</strong>).
              </div>
            </div>
          </div>
          
          <hr class="border-secondary border-opacity-25 my-4">

          <div class="d-flex justify-content-end gap-2">
            <NuxtLink to="/admin/users" class="btn btn-light border px-4 fw-medium" :class="{ disabled: store.loading }">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary px-4 fw-medium" :disabled="store.loading">
              <span v-if="store.loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ store.loading ? 'Menyimpan...' : 'Simpan User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useAdminUserStore } from '~/stores/adminUser';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});

const { user } = useAuth();
const store = useAdminUserStore();
const router = useRouter();

// --- HELPER BUAT NAMPILIN ROLE CANTIK DI TEXT BAWAH ---
const formatRoleName = (roleStr: string | null | undefined) => {
  if (!roleStr) return 'Admin';
  const role = roleStr.toLowerCase();
  if (role === 'root') return 'Root (Highest)';
  if (role === 'super_role' || role === 'super role') return 'Super Role';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// --- LOGIC HAK AKSES ROLE BARU ---
const availableRoles = computed(() => {
  const myRole = (user.value?.role || user.value?.Series || '').toLowerCase();

  // 1. Jika yang login adalah ROOT, SUPER ROLE lama, atau ADMIN
  // Cuma bisa bikin Admin Standar dan ke bawahnya (Super Role dihilangkan)
  if (myRole === 'root' || myRole === 'super_role' || myRole === 'super role' || myRole === 'admin') {
    return [
      { label: 'Admin Standar', value: 'admin' },
      { label: 'Bendahara (Keuangan)', value: 'bendahara' },
      { label: 'Petugas Registrasi (Check-in)', value: 'registrasi' },
      { label: 'Client (User Biasa)', value: 'user' }
    ];
  }

  // 2. Jika Bendahara/Registrasi somehow nyasar ke sini
  // Cuma bisa bikin client doang
  return [
    { label: 'Client (User Biasa)', value: 'user' }
  ];
});

const form = reactive({ 
  name: '', 
  email: '', 
  username: '', 
  phone_number: '', 
  password: '', 
  role: availableRoles.value[0]?.value || 'user' 
});

// Auto-adjust form.role kalau pilihan yg ada sekarang ilang gara-gara ganti user
watch(availableRoles, (newRoles) => {
  const isCurrentRoleValid = newRoles.find(r => r.value === form.role);
  if (!isCurrentRoleValid) {
    form.role = newRoles[0]?.value || 'user';
  }
}, { immediate: true });

const handleSubmit = async () => {
  const success = await store.addAccount(form);
  
  if (success) {
    // Balik ke halaman sesuai role yang baru dibikin biar enak
    const targetTab = form.role === 'user' ? 'client' : 'admin';
    router.push(`/admin/users?type=${targetTab}`);
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>