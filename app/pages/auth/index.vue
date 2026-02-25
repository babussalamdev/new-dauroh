<template>
  <div>
    <transition name="fade" mode="out-in">
      
      <AuthLoginForm 
        v-if="currentView === 'login'" 
        @switch="currentView = 'register'" 
      />
      
      <AuthRegisterForm 
        v-else-if="currentView === 'register'" 
        @switch="currentView = 'login'" 
      />

    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({ layout: 'auth' });

const route = useRoute();

const currentView = ref(route.query.view === 'register' ? 'register' : 'login');
</script>

<style scoped>
/* Animasi pergantian form */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>