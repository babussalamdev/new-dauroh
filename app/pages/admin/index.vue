<template>
  <div class="dashboard-container">
    <div class="card shadow-sm border-0">
      <div class="card-body p-5 text-center">
        <h2 class="fw-bold mb-3">Ahlan wa Sahlan, {{ user?.name }}!</h2>
        <p class="text-muted fs-5 mb-4">
          Anda login sebagai <span class="badge bg-primary rounded-pill">{{ userRoleLabel }}</span>
        </p>

        <div class="alert alert-info d-inline-block">
          <i class="bi bi-info-circle me-2"></i>
          Pilih menu <strong>"Manajemen Event > Tiket Event"</strong> di samping untuk mengelola event.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

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

const userRoleLabel = computed(() => {
  const role = user.value?.role;
  const roles: Record<string, string> = {
    root: 'Super Root',
    super_role: 'Super Admin',
    admin: 'Administrator',
    bendahara: 'Bendahara',
    registrasi: 'Petugas Registrasi',
    user: 'User'
  };

  // Cek: kalau role ada di daftar, ambil labelnya. Kalau gak ada/null, default 'User'
  return (role && roles[role]) ? roles[role] : 'User';
});
</script>