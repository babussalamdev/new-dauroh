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
  --color-card-bg: #FFFFFF;
  --navbar-height: 60px;
}


</style>