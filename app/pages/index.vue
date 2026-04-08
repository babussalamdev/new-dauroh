<template>
  <div class="homepage">
    <div class="container mt-4">
    </div>
    <HomeHeroSection />
    <EventTiketEvent />
  </div>
</template>

<script setup>
// 1. Wajib Import store-nya
import { useEventStore } from "~/stores/event";

// 2. Wajib diinisialisasi
const eventStore = useEventStore();

useHead({ title: 'Beranda' });
</script>
