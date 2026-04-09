<template>
  <div class="article-detail-page bg-light-subtle min-vh-100 pb-5">
    
    <div class="bg-white border-bottom pt-4 pb-3 mb-4">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item">
              <NuxtLink to="/" class="text-decoration-none text-muted">Beranda</NuxtLink>
            </li>
            <li class="breadcrumb-item text-muted">Informasi</li>
            <li class="breadcrumb-item active text-truncate" style="max-width: 200px;" aria-current="page">
              {{ article?.Title || 'Memuat...' }}
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3 text-muted fw-medium small">Memuat informasi...</p>
      </div>

      <div v-else-if="article" class="row justify-content-center">
        <div class="col-lg-8">
          
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div class="position-relative bg-light" style="height: 400px;">
              <NuxtImg 
                v-if="article.Picture" 
                :src="article.Picture" 
                class="w-100 h-100 object-fit-cover" 
                :alt="article.Title" 
              />
              <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                <i class="bi bi-image" style="font-size: 4rem; opacity: 0.2;"></i>
              </div>
            </div>

            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-medium">
                  Informasi Yayasan
                </span>
                <span class="text-muted small">
                  <i class="bi bi-calendar3 me-1"></i> {{ formatDate(article.Created_At) }}
                </span>
              </div>

              <h1 class="fw-bold text-dark mb-4" style="line-height: 1.3;">
                {{ article.Title }}
              </h1>

              <div class="article-content text-dark" v-html="article.Description"></div>
              
              <div class="mt-5 pt-4 border-top d-flex justify-content-between align-items-center">
                <span class="fw-bold text-dark small">Bagikan informasi ini:</span>
                <div class="d-flex gap-2">
                  <button class="btn btn-light rounded-circle text-success"><i class="bi bi-whatsapp"></i></button>
                  <button class="btn btn-light rounded-circle text-primary"><i class="bi bi-facebook"></i></button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <div v-else class="text-center py-5">
        <i class="bi bi-file-earmark-x display-1 text-muted opacity-50 mb-3"></i>
        <h4 class="fw-bold text-dark">Informasi tidak ditemukan</h4>
        <p class="text-muted">Artikel yang Anda cari mungkin sudah dihapus atau link tidak valid.</p>
        <NuxtLink to="/" class="btn btn-primary rounded-pill px-4 mt-2 fw-bold">Kembali ke Beranda</NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useArticleStore } from '~/stores/article';
import type { Article } from '~/types/article';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const route = useRoute();
const articleStore = useArticleStore();

// Nangkep ID/SK dari URL (misal: /artikel/ART123 -> dapet 'ART123')
const articleSK = String(route.params.id);

const article = ref<Article | null>(null);
const isLoading = ref(true);

onMounted(() => {
  // Nyari data di store dummy kita berdasarkan ID yang di URL
  // Nanti kalau API udah siap, ini diganti pakai fungsi fetch detail dari API ya
  setTimeout(() => {
    const foundArticle = articleStore.articles.find(a => a.SK === articleSK);
    if (foundArticle) {
      article.value = foundArticle;
      useHead({ title: foundArticle.Title }); // Ubah title tab browser
    }
    isLoading.value = false;
  }, 300); // Simulasi loading bentar
});

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return dayjs(dateStr).locale('id').format('DD MMMM YYYY');
};
</script>

<style scoped>
/* Biar hasil ketikan admin di Quill Editor (HTML) tampilnya rapi di sini */
:deep(.article-content p) {
  margin-bottom: 1.2rem;
  line-height: 1.8;
  font-size: 1.05rem;
  color: #343a40;
}

:deep(.article-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1.5rem 0;
}

:deep(.article-content h1, .article-content h2, .article-content h3) {
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #212529;
}
</style>