<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

useHead({
  titleTemplate: '%s - Dauroh',
  meta: [
    { name: 'description', content: 'Web pendaftaran dauroh' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.ico' }
  ]
});
</script>

<style>
/* CSS GLOBAL */
:root {
  --color-primary: #004754;
  --color-text-dark: #374151;
  --color-text-muted: #6B7280;
  --color-card-bg: #FFFFFF;
  --navbar-height: 60px;
}

body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* Background gradasi */
  background: linear-gradient(180deg, #e7eaf1 100%, #dcf0ff 100%);
  color: var(--color-text-dark);
  overflow-x: hidden;
}
.btn-primary {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}
.btn-primary:hover {
    background-color: #A03162 !important;
    border-color: #A03162 !important;
}
.card {
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>