<template>
  <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white stat-card">
    <div class="card-body p-4 d-flex align-items-center">
      <div 
        class="rounded-circle d-flex justify-content-center align-items-center me-3" 
        :class="iconBgClass"
        style="width: 55px; height: 55px;"
      >
        <i :class="['bi', icon, 'fs-3']"></i>
      </div>
      <div>
        <p class="small fw-bold mb-1 text-uppercase tracking-wide text-muted">
          {{ title }}
        </p>
        <h3 class="fw-bold mb-0 text-dark">{{ value }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  iconBgClass: { type: String, default: 'bg-primary bg-opacity-10 text-primary' }
});
</script>

<style scoped>
.tracking-wide { letter-spacing: 1px; }
.stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.stat-card:hover { 
  transform: translateY(-3px); 
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.10)!important; /* Shadow lebih halus */
}
</style>