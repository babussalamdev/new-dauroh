<template>
  <div class="card border-0 shadow-sm rounded-4">
    <div class="card-body p-4">
      <h6 class="fw-bold mb-3">
        <i class="bi bi-people-fill text-info me-2"></i>Demografi Pengguna
      </h6>
      <div class="progress rounded-pill mb-3" style="height: 20px;">
        <div class="progress-bar bg-info" :style="{ width: ikhwanPct + '%' }"></div>
        <div class="progress-bar bg-warning" :style="{ width: akhwatPct + '%' }"></div>
      </div>
      <div class="d-flex justify-content-between small fw-medium">
        <span class="text-info"><i class="bi bi-circle-fill me-1"></i>Ikhwan: {{ ikhwan }}</span>
        <span class="text-warning"><i class="bi bi-circle-fill me-1"></i>Akhwat: {{ akhwat }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ ikhwan: number, akhwat: number }>();

const total = computed(() => props.ikhwan + props.akhwat);
const ikhwanPct = computed(() => Math.round((props.ikhwan / total.value) * 100) || 0);
const akhwatPct = computed(() => Math.round((props.akhwat / total.value) * 100) || 0);
</script>