<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div 
      :class="['toast', 'align-items-center', 'text-white', `bg-${toastStore.type}`, 'border-0', { show: toastStore.show }]" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-icon d-flex align-items-center justify-content-center px-3">
          <i :class="['bi', iconClass, 'fs-4']"></i>
        </div>
        
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
import { computed } from 'vue'; // Import `computed`
import { useToastStore } from '~/stores/toast';
const toastStore = useToastStore();

//  Buat computed property untuk menentukan class icon
const iconClass = computed(() => {
  switch (toastStore.type) {
    case 'success':
      return 'bi-check-circle-fill';
    case 'danger':
      return 'bi-x-circle-fill';
    case 'info':
      return 'bi-info-circle-fill';
    default:
      return 'bi-info-circle-fill'; // Default ke 'info'
  }
});
</script>

<style scoped>
.toast-container {
  z-index: 1100;
}
/* Style tambahan agar icon dan body rapi */
.toast-body {
  flex-grow: 1; /* Pastikan body pesan mengisi ruang */
}
.btn-close {
  align-self: center; /* Jaga agar tombol close tetap di tengah vertikal */
}
</style>