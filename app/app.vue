<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Tidak perlu import onMounted atau useRouter kalau tidak dipakai langsung di sini
// useHead sudah auto-import di Nuxt 3

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