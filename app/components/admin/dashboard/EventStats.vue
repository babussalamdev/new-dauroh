<template>
  <div>
    <div class="bg-white rounded-4 shadow-sm p-3 mb-3 d-flex align-items-center">
      <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
        <i class="bi bi-bar-chart-fill fs-5"></i>
      </div>
      <h6 class="fw-bold m-0 text-dark">Statistik Event Terpilih</h6>
    </div>

    <div class="row g-3">
      <div class="col-12 col-md-4">
        <StatCard 
          title="Total Kuota Tiket" 
          :value="stats.totalQuota" 
          icon="bi-people"
          iconBgClass="bg-primary bg-opacity-10 text-primary" 
        />
      </div>
      <div class="col-12 col-md-4">
        <StatCard 
          title="Tiket Terjual (Lunas)" 
          :value="stats.sold" 
          icon="bi-check-circle"
          iconBgClass="bg-success bg-opacity-10 text-success"
        />
      </div>
      <div class="col-12 col-md-4">
        <StatCard 
          title="Tiket Tersedia (Sisa)" 
          :value="stats.available" 
          icon="bi-ticket-perforated"
          iconBgClass="bg-warning bg-opacity-10 text-warning"
        />
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