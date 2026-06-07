<template>
  <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Artikel'}]" />
  <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
  
  <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
    <h6 class="mb-0 fw-bold txt-subtitle text-dark text-truncate w-100">Artikel</h6>
  </div>

  <div class="d-flex flex-shrink-0 flex-wrap">
    <button class="btn btn-primary rounded-pill px-3 py-1 shadow-sm txt-caption fw-medium" @click="navigateToAdd">
      Tambah Informasi
    </button>
  </div>

</div>
    
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0" style="min-width: 800px;">
          <thead>
            <tr>
              <th class="text-center ps-4 txt-label" style="width: 15%">TANGGAL RILIS</th>
              <th class="text-center txt-label" style="width: 10%">PIC</th>
              <th class="txt-label" style="width: 45%">JUDUL INFORMASI</th>
              <th class="text-center txt-label" style="width: 15%">STATUS</th>
              <th class="text-center pe-4 txt-label" style="width: 15%">AKSI</th>
            </tr>
          </thead>
          
          <tbody v-if="!articleStore.loading && articleStore.articles.length > 0">
            <tr v-for="article in articleStore.articles" :key="article.SK">

              <td class="text-center fw-bold txt-body text-muted ps-4">
                {{ formatDate(article.Created_At) }}
              </td>

              <td class="text-center">
                <img 
                  v-if="article.Picture"
                  :src="article.Picture"
                  :alt="article.Title" 
                  width="45" height="45"
                  class="rounded Picture-thumbnail object-fit-cover shadow-sm"
                  @error="($event.target as HTMLImageElement).style.display = 'none'" 
                />
                <span v-else class="text-muted txt-caption fw-bold">N/A</span>
              </td>
              
              <td class="fw-bold txt-body text-dark">{{ article.Title }}</td>

              <td class="text-center">
                <span v-if="article.Status === 'active'" class="badge bg-success bg-opacity-10 text-success rounded-pill border border-success px-3 txt-label">
                  Dipublikasi
                </span>
                <span v-else class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill border border-secondary px-3 txt-label">
                  Draft
                </span>
              </td>

              <td class="text-center pe-4">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm text-primary p-0 border-0 bg-transparent shadow-none" @click="navigateToDetail(article)" :disabled="!article.SK" title="Lihat Detail & Edit">
                    <i class="bi bi-pencil-square fs-5"></i>
                  </button>
                  <button class="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none" @click="openDeleteModal(article)" title="Hapus">
                    <i class="bi bi-trash fs-5"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          
          <tbody v-else-if="!articleStore.loading && articleStore.articles.length === 0">
            <tr>
              <td colspan="5" class="text-center text-muted py-5">
                <i class="bi bi-newspaper fs-1 d-block mb-2 opacity-50"></i>
                <span class="txt-body fw-bold">Belum ada data informasi/artikel.</span>
              </td>
            </tr>
          </tbody>
          
          <tbody v-else>
            <tr>
              <td colspan="5" class="py-5 text-center">
                 <CommonLoadingSpinner />
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
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

.Picture-thumbnail {
  background-color: #f8f9fa;
  display: inline-block; 
  vertical-align: middle;
}
</style>