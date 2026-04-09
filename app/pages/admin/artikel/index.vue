<template>
  <div class="container-fluid py-4">
    <AdminArticleManager />
  </div>
</template>

<script setup lang="ts">
// 🟢 Pengecekan layout dan hak akses admin tetep ditaruh di sini
definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }
});

useHead({ title: 'Manajemen Informasi' });
</script>