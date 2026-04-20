<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>
        <li class="breadcrumb-item active txt-caption fw-bold text-secondary" aria-current="page">
          Manajemen Tiket
        </li>
      </ol>
    </nav>

    <AdminEventTiketEventManager />
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