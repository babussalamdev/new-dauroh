<template>
  <div class="admin-dashboard bg-light">
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <span v-if="isLoggedIn" class="badge bg-primary fs-6">Halo, {{ userName }}</span>
      </div> 

      <ul class="nav nav-tabs mb-3" id="adminTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="now-playing-tab" data-bs-toggle="tab" data-bs-target="#now-playing" type="button" role="tab">Now Playing</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="top-movies-tab" data-bs-toggle="tab" data-bs-target="#top-movies" type="button" role="tab">Top Carousel</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="dauroh-tab" data-bs-toggle="tab" data-bs-target="#dauroh" type="button" role="tab">Tiket Dauroh</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="promos-tab" data-bs-toggle="tab" data-bs-target="#promos" type="button" role="tab">Promo</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="studios-tab" data-bs-toggle="tab" data-bs-target="#studios" type="button" role="tab">Studios</button>
        </li>
      </ul>

      <div class="tab-content" id="adminTabContent">
        <div class="tab-pane fade show active" id="now-playing" role="tabpanel">
          <AdminPosterCarouselManager />
        </div>
        <div class="tab-pane fade" id="top-movies" role="tabpanel">
          <AdminTopCarouselManager />
        </div>
        <div class="tab-pane fade" id="dauroh" role="tabpanel">
          <AdminTiketDaurohManager />
        </div>
        <div class="tab-pane fade" id="promos" role="tabpanel">
          <AdminPromoCarouselManager />
        </div>
        <div class="tab-pane fade" id="studios" role="tabpanel">
          <AdminStudioManager />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import AdminPosterCarouselManager from '~/components/admin/PosterCarouselManager.vue';
import AdminTopCarouselManager from '~/components/admin/TopCarouselManager.vue';
import AdminTiketDaurohManager from '~/components/admin/TiketDaurohManager.vue';
import AdminPromoCarouselManager from '~/components/admin/PromoCarouselManager.vue';
import AdminStudioManager from '~/components/admin/StudioManager.vue';
import { useAuth } from '~/composables/useAuth';

const { isLoggedIn, userName } = useAuth();
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