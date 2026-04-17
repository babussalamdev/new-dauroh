<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
    <div class="card-body p-0">
      
      <div class="p-3 px-4 d-flex align-items-center border-bottom bg-white">
        <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 32px; height: 32px;">
          <i class="bi bi-bar-chart-fill" style="font-size: 0.85rem;"></i>
        </div>
        <h6 class="fw-bold m-0 text-dark" style="font-size: 0.9rem;">Statistik Event Terpilih</h6>
      </div>

      <div class="p-3">
        <div class="row g-2"> <div class="col-12 col-md-4">
            <StatCard 
              title="Total Kuota Tiket" 
              :value="stats.totalQuota" 
              icon="bi-people"
              iconBgClass="bg-primary bg-opacity-10 text-primary" 
              class="inner-stat-card"
            />
          </div>
          <div class="col-12 col-md-4">
            <StatCard 
              title="Tiket Terjual (Lunas)" 
              :value="stats.sold" 
              icon="bi-check-circle"
              iconBgClass="bg-success bg-opacity-10 text-success"
              class="inner-stat-card"
            />
          </div>
          <div class="col-12 col-md-4">
            <StatCard 
              title="Tiket Tersedia (Sisa)" 
              :value="stats.available" 
              icon="bi-ticket-perforated"
              iconBgClass="bg-warning bg-opacity-10 text-warning"
              class="inner-stat-card"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import StatCard from './StatCard.vue';

defineProps<{
  stats: {
    totalQuota: number;
    sold: number;
    available: number;
  }
}>();
</script>

<style scoped>
/* Kasih warna background dikit buat card di dalem biar ga "ngambang" */
.inner-stat-card {
  background-color: #f8f9fa !important; /* Abu-abu sangat muda */
  border: 1px solid #f1f3f5 !important;
  box-shadow: none !important; /* Hapus shadow biar ga tabrakan sama shadow luar */
}
</style>