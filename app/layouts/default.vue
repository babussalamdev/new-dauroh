<template>
  <div class="main-layout-wrapper">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

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
</script>

<style scoped>
.main-layout-wrapper {
  position: relative;
  background-color: var(--color-bg);
  color: var(--color-text-dark);
  min-height: 100vh;
}

.main-content-scroll-area {
  padding-top: 20px;
  /* Memberi ruang agar konten tidak ketutup navbar */
}

/* PENAMBAHAN STYLE BARU UNTUK OVERLAY */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Latar belakang semi-transparan */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  /* Pastikan berada di paling atas */
}
</style>