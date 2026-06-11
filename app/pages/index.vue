<template>
  <div class="homepage">
    <!-- <HomeHeroSection /> -->
    
    <div class="container mt-4 pt-3">
      <HomeEventCategoryFilter v-model="selectedCategory" />
    </div>

    <div v-if="eventStore.loading.tiketEvent" class="py-5 my-5 d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="text-muted mt-3 txt-caption fw-bold">Memuat daftar kajian...</p>
    </div>

    <div v-show="!eventStore.loading.tiketEvent">
      <EventTiketEvent :category="selectedCategory" />
    </div>
    <!-- <ArticleHomeArticleSection /> -->

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useEventStore } from "~/stores/event";

const eventStore = useEventStore();
const selectedCategory = ref('semua');

useHead({ title: 'Beranda' });
</script>
