<template>
  <nav class="admin-navbar navbar navbar-expand navbar-light bg-white sticky-top shadow-sm">
    <div class="container-fluid">
      <button class="btn btn-link" id="sidebarToggle" @click="toggleSidebar">
        <i class="bi bi-list fs-4"></i>
      </button>

      <div class="ms-auto d-flex align-items-center">
        <span class="navbar-text me-3 d-none d-sm-block" v-if="userName">
          Halo, {{ userName }}
        </span>
        <div class="dropdown" ref="dropdownRef">
          <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" @click.prevent="isDropdownOpen = !isDropdownOpen" :aria-expanded="isDropdownOpen">
            <i class="bi bi-person-circle fs-3"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end text-small shadow" :class="{ show: isDropdownOpen }">
            <li>
              <NuxtLink class="dropdown-item" to="/admin/profile" @click="isDropdownOpen = false">Profil</NuxtLink> 
              </li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" @click.prevent="handleLogout(); isDropdownOpen = false">Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useAdminSidebar } from '~/composables/useAdminSidebar';
import Swal from 'sweetalert2';
import { useGlobalEventStore } from '~/stores/globalEvent';
import { useFinanceStore } from '~/stores/finance';
import { onClickOutside } from '@vueuse/core';

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

onClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false;
});

const { user, logout } = useAuth();
const isSidebarOpen = useAdminSidebar();

// Ambil nama user dari state
const userName = computed(() => user.value?.name || '');

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = async () => {
  // 🟢 PANGGIL STORE
  const globalStore = useGlobalEventStore();
  const financeStore = useFinanceStore();

  Swal.fire({
    background: 'transparent',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    await logout();
    
    // 🟢 EKSEKUSI RESET DATA SEBELUM PINDAH HALAMAN
    globalStore.resetStore();
    financeStore.resetStore();

    await new Promise(resolve => setTimeout(resolve, 800));
    Swal.close();
    navigateTo('/'); 

  } catch (error) {
    Swal.close();
    console.error("Logout gagal:", error);
  }
};
</script>

<style scoped>
.admin-navbar {
  height: 60px; /* Atur tinggi navbar */
}
#sidebarToggle {
  color: #333;
}
.dropdown-menu-end.show {
  right: 0;
  left: auto;
  position: absolute;
}
</style>