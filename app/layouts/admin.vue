<template>
  <div class="admin-layout-wrapper" :class="{ 'sidebar-toggled': !isSidebarOpen }">
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="isSidebarOpen = false"></div>

    <LayoutAdminSidebar />

    <div class="main-content-wrapper">
      <LayoutAdminNavbar />

      <main class="content-fluid p-3 p-md-4">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useAdminSidebar } from '~/composables/useAdminSidebar';
const isSidebarOpen = useAdminSidebar();
</script>

<style>
body {
  background-color: #f8f9fa;
}

/* --- PERUBAHAN STYLE --- */
.main-content-wrapper {
  margin-left: 0 !important;
  width: 100%;
  transition: none;
}
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Hitam transparan */
  z-index: 1029;
  cursor: pointer;
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.admin-layout-wrapper.sidebar-toggled .admin-sidebar {
  transform: translateX(-100%);
}
.admin-layout-wrapper.sidebar-toggled .main-content-wrapper {
  margin-left: 0;
  width: 100%;
}
</style>