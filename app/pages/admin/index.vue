<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
      </ol>
    </nav>

    <AdminTiketDaurohManager />
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth';
import AdminTiketDaurohManager from '~/components/admin/TiketDaurohManager.vue';

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
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}
.breadcrumb a {
  text-decoration: none;
  color: var(--bs-secondary-color);
}
.breadcrumb a:hover {
  color: var(--bs-body-color);
}
</style>