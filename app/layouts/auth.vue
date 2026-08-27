<template>
  <div 
    class="auth-layout-wrapper" 
    @mousemove="updateMouse"
    :style="{ '--mouse-x': mouseX + 'px', '--mouse-y': mouseY + 'px' }"
  >
    <div class="spotlight-bg"></div>
    
    <!-- Konten halaman login / register -->
    <div class="auth-content-wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mouseX = ref(-1000); // Default di luar layar biar nggak tiba-tiba muncul di pojok
const mouseY = ref(-1000);

const updateMouse = (e) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};
</script>

<style scoped>
.auth-layout-wrapper {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background-color: #f8f9fa; /* Warna dasar sangat terang / putih tulang */
}

.spotlight-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Biar nggak ngeblokir klik ke form */
  /* Warna utama 13, 110, 253 dibuat jadi pastel transparan (opacity 0.08) */
  background: radial-gradient(
    800px circle at var(--mouse-x) var(--mouse-y),
    rgba(13, 110, 253, 0.08),
    transparent 80%
  );
  z-index: 0;
  transition: background 0.1s ease;
}

.auth-content-wrapper {
  position: relative;
  z-index: 1; /* Pastikan konten ada di atas spotlight */
}
</style>