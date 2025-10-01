<template>
  <div class="homepage">
    <HeroSection />
    <TiketDauroh />
  </div>
</template>

<script setup>
useHead({ title: 'Beranda' });

import TiketDauroh from '~/components/dauroh/TiketDauroh.vue';
import HeroSection from '~/components/home/HeroSection.vue';
</script>
