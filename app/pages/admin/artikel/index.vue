<template>
  <div>
    <AdminArticleManager />
  </div>
</template>

<script setup lang="ts">

useHead({ title: 'Manajemen Artikel' });
definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }
});


</script>