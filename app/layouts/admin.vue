<template>
  <div class="admin-layout-wrapper" :class="{ 'sidebar-toggled': !isSidebarOpen }">
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

.main-content-wrapper {
  margin-left: 250px; /* Sesuaikan dengan lebar sidebar */
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - 250px);
}

/* State ketika sidebar ditutup */
.admin-layout-wrapper.sidebar-toggled .admin-sidebar {
  transform: translateX(-100%);
}

.admin-layout-wrapper.sidebar-toggled .main-content-wrapper {
  margin-left: 0;
  width: 100%;
}
</style>