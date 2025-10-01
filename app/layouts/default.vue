<template>
<div>
  <!-- overlay spinner -->
   <div
      v-if="loading"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
    <div class="main-layout-wrapper">
      <LayoutNavbar />
      <main class="main-content-scroll-area">
        <NuxtPage />
      </main>
      <LayoutFooter />

      <NotificationsToastNotification />
    </div>
</template>

<script setup>
const loading = useLoading() // ambil state global loading

import LayoutNavbar from '../components/layout/Navbar.vue';
import  NotificationsToastNotification  from '~/components/notifications/ToastNotification.vue';
</script>

<style scoped>
.main-layout-wrapper {
  position: relative;
  background-color: var(--color-bg);
  color: var(--color-text-dark);
  min-height: 100vh;
}
.main-content-scroll-area {
    padding-top: 20px; /* Memberi ruang agar konten tidak ketutup navbar */
}
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>