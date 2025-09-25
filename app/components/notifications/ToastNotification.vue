<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div 
      :class="['toast', 'align-items-center', 'text-white', `bg-${toastStore.type}`, 'border-0', { show: toastStore.show }]" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          {{ toastStore.message }}
        </div>
        <button 
          type="button" 
          class="btn-close btn-close-white me-2 m-auto" 
          @click="toastStore.show = false" 
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToastStore } from '~/stores/toast';
const toastStore = useToastStore();
</script>

<style scoped>
.toast-container {
  z-index: 1100; /* Pastikan di atas modal backdrop */
}
</style>