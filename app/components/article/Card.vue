<template>
    <NuxtLink :to="`/artikel/${encodeURIComponent(article.SK)}`" class="text-decoration-none">
    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition article-card">
      
      <div class="position-relative picture-wrapper bg-light">
        <NuxtImg 
          v-if="article.Picture" 
          :src="article.Picture" 
          class="w-100 h-100 object-fit-cover" 
          :alt="article.Title" 
          loading="lazy" 
        />
        <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
          <i class="bi bi-image fs-1 opacity-25"></i>
        </div>
        
        <div class="position-absolute top-0 start-0 m-3">
          <span class="badge bg-white text-primary rounded-pill shadow-sm px-3 py-2 fw-bold small">
            Informasi
          </span>
        </div>
      </div>

      <div class="card-body p-4 d-flex flex-column">
        <h5 class="fw-bold text-dark mb-2 text-truncate-2" style="line-height: 1.4;">
          {{ article.Title }}
        </h5>
        
        <div class="text-muted small mt-auto pt-3 d-flex align-items-center">
          <i class="bi bi-calendar3 me-2"></i>
          {{ formatDate(article.Created_At) }}
        </div>
      </div>

    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Article } from '~/types/article'; // Pastiin path type-nya bener
import dayjs from 'dayjs';
import 'dayjs/locale/id'; // Biar format bulannya bahasa Indonesia

// Menerima data artikel dari halaman yang manggil komponen ini
const props = defineProps<{
  article: Article
}>();

// Fungsi buat nge-format tanggal
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return dayjs(dateStr).locale('id').format('DD MMMM YYYY');
};
</script>

<style scoped>
.picture-wrapper {
  height: 220px; /* Tinggi standar gambar artikel */
}

.article-card {
  background-color: #ffffff;
}

.hover-shadow:hover {
  transform: translateY(-5px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1) !important;
}

.transition {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.text-truncate-2 {
  display: -webkit-box;
  line-clamp: 2; /* Maksimal 2 baris, sisanya jadi titik-titik (...) */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>