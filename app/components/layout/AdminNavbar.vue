<template>
  <nav class="admin-navbar navbar navbar-expand navbar-light bg-white sticky-top shadow-sm">
    <div class="container-fluid">
      <button class="btn btn-link" id="sidebarToggle" @click="toggleSidebar">
        <i class="bi bi-list fs-4"></i>
      </button>

      <div class="ms-auto d-flex align-items-center">
        <span class="navbar-text me-3 d-none d-sm-block txt-body fw-medium text-dark" v-if="userName">
          Halo, {{ userName }}
        </span>
        <div class="dropdown">
          <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle fs-3"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end text-small shadow">
            <li>
              <NuxtLink class="dropdown-item txt-body py-2" to="/admin/profile">
                <i class="bi bi-person me-2"></i>Profil
              </NuxtLink> 
            </li>
            <li><hr class="dropdown-divider"></li>
            <a class="dropdown-item txt-body text-danger py-2" href="#" @click.prevent="handleLogout">
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </a>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth';
import { useAdminSidebar } from '~/composables/useAdminSidebar';

const { user, logout } = useAuth();
const isSidebarOpen = useAdminSidebar();

// Ambil nama user dari state
const userName = computed(() => user.value?.name || '');

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = async () => {
  await logout();
};
</script>

<style scoped>
.admin-navbar {
  height: 60px; /* Atur tinggi navbar */
}
#sidebarToggle {
  color: #333;
}
</style>