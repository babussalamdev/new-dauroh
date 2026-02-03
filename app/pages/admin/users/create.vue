<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item"><NuxtLink to="/admin/users">Manajemen User</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Tambah Baru</li>
      </ol>
    </nav>

    <div class="card content-card">
      <div class="card-header">
        <h5 class="mb-0">Formulir User Baru</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="fullName" class="form-label">Nama Lengkap</label>
              <input type="text" class="form-control" id="fullName" v-model="form.name" required>
            </div>
            <div class="col-md-6">
              <label for="email" class="form-label">Alamat Email</label>
              <input type="email" class="form-control" id="email" v-model="form.email" required>
            </div>

            <div class="col-md-6">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" v-model="form.username" required placeholder="Username unik">
            </div>
            <div class="col-md-6">
              <label for="phone" class="form-label">Nomor Telepon</label>
              <input type="tel" class="form-control" id="phone" v-model="form.phone_number" required placeholder="08...">
            </div>

            <div class="col-md-6">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" v-model="form.password" required minlength="6">
            </div>

            <div class="col-md-6">
              <label for="role" class="form-label">Role</label>
              <select id="role" class="form-select" v-model="form.role" required>
                <option v-for="roleOption in availableRoles" :key="roleOption.value" :value="roleOption.value">
                  {{ roleOption.label }}
                </option>
              </select>
              <div class="form-text text-primary">
                *Opsi role disesuaikan dengan hak akses Anda ({{ user?.role }}).
              </div>
            </div>
          </div>
          
          <div class="mt-4 text-end">
            <NuxtLink to="/admin/users" class="btn btn-secondary me-2" :class="{ disabled: store.loading }">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary" :disabled="store.loading">
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

// --- LOGIC HAK AKSES ---
const availableRoles = computed(() => {
  const myRole = user.value?.role;

  // 1. Jika ROOT
  if (myRole === 'root') {
    return [
      { label: 'Super Role (Admin Utama)', value: 'super role' },
      { label: 'Administrator', value: 'admin' },
      { label: 'Bendahara', value: 'bendahara' },
      { label: 'Petugas Registrasi (Scan QR)', value: 'registrasi' },
      // Update Label: User Biasa -> Client
      { label: 'Client', value: 'user' }
    ];
  }
  
  // 2. Jika SUPER ROLE / ADMIN / LAINNYA
  return [
    // Update Label: User Biasa -> Client
    { label: 'Client', value: 'user' }
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

watch(availableRoles, (newRoles) => {
  const isCurrentRoleValid = newRoles.find(r => r.value === form.role);
  if (!isCurrentRoleValid) {
    form.role = newRoles[0]?.value || 'user';
  }
}, { immediate: true });

const handleSubmit = async () => {
  const success = await store.addAccount(form);
  
  if (success) {
    form.name = '';
    form.email = '';
    form.username = '';
    form.phone_number = '';
    form.password = '';
    form.role = availableRoles.value[0]?.value || 'user';
    router.push('/admin/users');
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>