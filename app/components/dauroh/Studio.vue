<template>
  <div class="container mt-5">
    <!-- Form Tambah Studio sudah dihapus dari sini -->

    <div class="row g-4 justify-content-center">
      <div class="col-md-4" v-for="card in daurohStore.getStudioCards" :key="card.id">
        <div class="card hover-card h-100">
          <img class="card-img-top" :src="card.image" :alt="card.title" />
          <div class="card-img-overlay text-overlay">
            <h4 class="card-title">{{ card.title }}</h4>
            <p class="card-text">{{ card.text }}</p>
            <a :href="card.link" class="btn btn-primary">Lihat Detail</a>
            <!-- Tombol Edit & Hapus sudah dihapus dari sini -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDaurohStore } from '~/stores/dauroh';
const daurohStore = useDaurohStore();

// Logika untuk CRUD (newTitle, handleAdd, handleUpdate, handleDelete) sudah dihapus
</script>

<style scoped>
/* CSS Anda tidak diubah, hanya bagian .actions yang tidak terpakai lagi */
.card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  cursor: pointer;
}
.card-img-top {
  filter: brightness(0.6);
  transition: filter 0.3s ease;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hover-card:hover .card-img-top {
  filter: brightness(0.4);
}
.text-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}
.hover-card:hover .text-overlay {
  opacity: 1;
}
.card-title,
.card-text {
  margin-bottom: 0.5rem;
}
</style>