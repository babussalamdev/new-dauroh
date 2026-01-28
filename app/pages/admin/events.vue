<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Manajemen Tiket</li>
      </ol>
    </nav>

    <AdminTiketDaurohManager />
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth';

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