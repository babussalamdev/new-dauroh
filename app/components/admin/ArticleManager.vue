<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Informasi Yayasan</h5>
      <button class="btn btn-primary btn-sm" @click="navigateToAdd">
        <i class="bi bi-plus-lg me-1"></i>
        Tambah Informasi
      </button>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-sm align-middle fs-sm">
          <thead class="table-light">
            <tr>
              <th scope="col" style="width: 15%" class="text-center">Tanggal Rilis</th>
              <th scope="col" style="width: 10%" class="text-center">Picture</th>
              <th scope="col" style="width: 45%">Judul Informasi</th>
              <th scope="col" class="text-center" style="width: 15%">Status</th>
              <th scope="col" class="text-center">Aksi</th>
            </tr>
          </thead>
          
          <tbody v-if="!articleStore.loading && articleStore.articles.length > 0">
            <tr v-for="article in articleStore.articles" :key="article.SK">

              <th scope="row" class="fw-normal text-center text-muted">
                {{ formatDate(article.Created_At) }}
              </th>

              <td class="text-center">
                <img 
                  v-if="article.Picture"
                  :src="article.Picture"
                  :alt="article.Title" 
                  width="45" height="45"
                  class="rounded Picture-thumbnail object-fit-cover border"
                  @error="($event.target as HTMLImageElement).style.display = 'none'" 
                />
                <span v-else class="text-muted small">N/A</span>
              </td>
              
              <td class="fw-medium">{{ article.Title }}</td>

              <td class="text-center">
                <span v-if="article.Status === 'active'"
                  class="badge bg-success bg-opacity-10 text-success rounded-pill border border-success px-3">
                  Dipublikasi
                </span>
                <span v-else class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill border border-secondary px-3">
                  Draft
                </span>
              </td>

              <td class="text-center">
                <button class="btn btn-link text-info p-1" @click="navigateToDetail(article)" :disabled="!article.SK"
                  title="Lihat Detail & Edit">
                  <i class="bi bi-search fs-5"></i>
                </button>
                <button class="btn btn-link text-danger p-1" @click="openDeleteModal(article)" title="Hapus">
                  <i class="bi bi-trash fs-5"></i>
                </button>
              </td>
            </tr>
          </tbody>
          
          <tbody v-else-if="!articleStore.loading && articleStore.articles.length === 0">
            <tr>
              <td colspan="5" class="text-center text-muted py-4">Belum ada data informasi/artikel.</td>
            </tr>
          </tbody>
          
          <tbody v-else>
            <tr>
              <td colspan="5" class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  </template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useArticleStore } from "@/stores/article";
import type { Article } from "@/types/article";

const router = useRouter();
const articleStore = useArticleStore();

const showDeleteModal = ref(false);
const selectedArticleForDelete = ref<Article | null>(null);

onMounted(() => {
  // Nanti ganti dengan fungsi fetch API dari backend
  // articleStore.fetchAdminArticles();
});

// Format Tanggal simple
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

// Navigasi ke Halaman Tambah Baru
const navigateToAdd = () => {
  router.push('/admin/artikel/create');
};

// Navigasi ke Halaman Edit/Detail Admin
const navigateToDetail = (article: Article) => {
  if (article && article.SK) {
    // Encode komponen URL buat ngehindarin masalah simbol # kayak tadi
    router.push(`/admin/artikel/${encodeURIComponent(article.SK)}`);
  }
};

// Logic Modal Delete
const openDeleteModal = (article: Article) => {
  selectedArticleForDelete.value = article;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedArticleForDelete.value = null;
};

const confirmDelete = () => {
  // Nanti panggil fungsi delete dari store
  // if (selectedArticleForDelete.value?.SK) {
  //   articleStore.deleteArticle(selectedArticleForDelete.value.SK);
  // }
  closeDeleteModal();
};
</script>

<style scoped>
/* Pake style yang sama persis kayak event lu */
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

.Picture-thumbnail {
  background-color: #f8f9fa;
  display: inline-block; 
  vertical-align: middle;
}
</style>