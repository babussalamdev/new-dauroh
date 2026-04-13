<template>
  <div class="homepage">
    <HomeHeroSection />
    <EventTiketEvent />
    <!-- <ArticleHomeArticleSection /> -->

  </div>
</template>

<script setup>
import { useEventStore } from "~/stores/event";

const eventStore = useEventStore();

useHead({ title: 'Beranda' });
</script>
