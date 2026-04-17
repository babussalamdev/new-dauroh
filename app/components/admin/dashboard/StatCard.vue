<template>
  <div class="card border-0 rounded-4 stat-card-base">
    <div class="card-body p-3 d-flex align-items-center">
      
      <div 
        class="rounded-circle d-flex justify-content-center align-items-center me-3 flex-shrink-0" 
        :class="iconBgClass"
        style="width: 40px; height: 40px;"
      >
        <i :class="['bi', icon]" style="font-size: 1.1rem;"></i>
      </div>

      <div>
        <p class="fw-bold mb-0 text-uppercase text-muted" style="font-size: 0.65rem; letter-spacing: 0.5px;">
          {{ title }}
        </p>
        <h5 class="fw-bold mb-0 text-dark mt-1" style="font-size: 1.1rem;">{{ value }}</h5>
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
.stat-card-base {
  transition: all 0.2s ease;
}
.stat-card-base:hover {
  background-color: #ffffff !important; /* Balik ke putih pas di-hover */
  border-color: #dee2e6 !important;
  transform: translateY(-2px);
}
</style>