<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">

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