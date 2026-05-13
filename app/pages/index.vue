<template>
  <div class="homepage">
    <HomeHeroSection />


    <div v-if="eventStore.loading.tiketEvent" class="py-5 my-5 d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="text-muted mt-3 txt-caption fw-bold">Memuat daftar kajian...</p>
    </div>

    <div v-show="!eventStore.loading.tiketEvent">
      <EventTiketEvent />
    </div>
    <!-- <ArticleHomeArticleSection /> -->

  </div>
</template>

<script setup>
import { useEventStore } from "~/stores/event";

const eventStore = useEventStore();

useHead({ title: 'Beranda' });
</script>
