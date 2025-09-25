<template>
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
</style>