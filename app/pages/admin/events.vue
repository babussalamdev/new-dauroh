<template>
  <div>
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Manajemen Tiket'}]" />

    <AdminEventTiketEventManager />
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth';

useHead({
  title: 'Manajemen Event'
});
definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>