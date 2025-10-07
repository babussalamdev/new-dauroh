<template>
  <div class="admin-dashboard bg-light">
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
      </div> 

      <ul class="nav nav-tabs mb-3" id="adminTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="dauroh-tab" data-bs-toggle="tab" data-bs-target="#dauroh" type="button" role="tab">Tiket Dauroh</button>
        </li>
      </ul>

      <div class="tab-content" id="adminTabContent">
        <div class="tab-pane fade" id="dauroh" role="tabpanel">
          <AdminTiketDaurohManager />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth()
    // kalau belum login atau bukan admin, lempar ke /
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/')
    }
  }
})

import AdminTiketDaurohManager from '~/components/admin/TiketDaurohManager.vue'

const { isLoggedIn, userName } = useAuth()
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
}
.nav-tabs .nav-link {
  color: #6c757d;
}
.nav-tabs .nav-link.active {
  color: #0d6efd;
  font-weight: 500;
}
</style>