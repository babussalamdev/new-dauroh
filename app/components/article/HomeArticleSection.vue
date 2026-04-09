<template>
  <div class="container py-5 mb-5">
    <div class="d-flex justify-content-between align-items-end mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Artikel</h3>
      </div>
    </div>

    <div class="row g-4">
      <div v-if="articleStore.articles.length === 0" class="col-12 text-center py-5 text-muted">
        Belum ada informasi terbaru.
      </div>
      
      <div 
        v-else
        v-for="item in articleStore.articles" 
        :key="item.SK" 
        class="col-md-6 col-lg-4"
      >
        <ArticleCard :article="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useArticleStore } from "~/stores/article";

const articleStore = useArticleStore(); 
</script>