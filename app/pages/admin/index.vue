<template>
  <div>
    <div class="page-header mb-4">
      <h1 class="page-title">Dashboard</h1>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
          <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
        </ol>
      </nav>
    </div>

    <ul class="nav nav-pills mb-3" id="adminTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="dauroh-tab" data-bs-toggle="tab" data-bs-target="#dauroh" type="button" role="tab">Tiket Dauroh</button>
      </li>
    </ul>
    <div class="tab-content" id="adminTabContent">
      <div class="tab-pane fade show active" id="dauroh" role="tabpanel">
        <AdminTiketDaurohManager />
      </div>
    </div>

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
/* Style ini tetap sama untuk menjaga konsistensi */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-primary);
}
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}
.breadcrumb a {
  text-decoration: none;
  color: var(--bs-secondary-color);
}
.breadcrumb a:hover {
  color: var(--bs-body-color);
}

.nav-pills .nav-link {
  color: #5a5a5a;
  background-color: transparent;
  font-weight: 500;
  border: 1px solid #dee2e6;
  margin-right: 8px;
  border-radius: 0.375rem;
}

.nav-pills .nav-link.active {
  color: #fff;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>