<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">

useHead({
  titleTemplate: '%s - Event',
  meta: [
    { name: 'description', content: 'Web pendaftaran event' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.ico' }
  ]
});
</script>