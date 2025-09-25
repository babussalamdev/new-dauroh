<template>
  <div class="card shadow-sm mt-4">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Top Daurohs</h5>
      <button class="btn btn-success btn-sm" @click="openAddModal">+ Tambah Top Dauroh</button>
    </div>
    <div class="card-body">
      <div v-if="daurohStore.isLoadingTopDaurohs" class="text-center">
        <p>Memuat data...</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">#ID</th>
              <th scope="col">Poster</th>
              <th scope="col">Judul</th>
              <th scope="col">Genre</th>
              <th scope="col" class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dauroh in daurohStore.topDauroh" :key="dauroh.id">
              <th scope="row">{{ dauroh.id }}</th>
              <td><img :src="dauroh.poster" :alt="dauroh.title" width="50" class="rounded"></td>
              <td>{{ dauroh.title }}</td>
              <td>{{ dauroh.genre }}</td>
              <td class="text-end">
                <!-- Tombol Edit sekarang membuka modal -->
                <button class="btn btn-primary btn-sm me-2" @click="openUpdateModal(dauroh)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(dauroh.id)">Hapus</button>
              </td>
            </tr>
            <tr v-if="daurohStore.topDauroh.length === 0">
              <td colspan="5" class="text-center text-muted">Belum ada data Top Daurohs.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ====================================================== -->
  <!-- MODAL BARU UNTUK TAMBAH/EDIT -->
  <!-- ====================================================== -->
  <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Top Dauroh' : 'Tambah Top Dauroh Baru' }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="daurohTitle" class="form-label">Judul</label>
            <input type="text" class="form-control" id="daurohTitle" v-model="editableDauroh.title">
          </div>
          <div class="mb-3">
            <label for="daurohGenre" class="form-label">Genre/Kategori</label>
            <input type="text" class="form-control" id="daurohGenre" v-model="editableDauroh.genre">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
          <button type="button" class="btn btn-primary" @click="handleSave">Simpan</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-backdrop fade show"></div>
  <!-- ====================================================== -->
</template>

<script setup>
// // components/admin/TopDaurohManager.vue
import { ref, reactive, onMounted } from 'vue';
import { useDaurohStore } from '~/stores/dauroh';

const daurohStore = useDaurohStore();

// ======================================================
// LOGIKA CRUD YANG BARU DENGAN MODAL
// ======================================================
const showModal = ref(false);
const isEditing = ref(false);
const editableDauroh = reactive({
  id: null,
  title: '',
  genre: ''
});

onMounted(() => {
  // Pastikan data sudah ter-load
  if (daurohStore.topDauroh.length === 0) {
    // Anda mungkin perlu menambahkan fetchTopDaurohs jika belum ada
    // daurohStore.fetchTopDaurohs(); 
  }
});

const openAddModal = () => {
  isEditing.value = false;
  editableDauroh.id = null;
  editableDauroh.title = '';
  editableDauroh.genre = '';
  showModal.value = true;
};

const openUpdateModal = (dauroh) => {
  isEditing.value = true;
  editableDauroh.id = dauroh.id;
  editableDauroh.title = dauroh.title;
  editableDauroh.genre = dauroh.genre;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSave = () => {
  const payload = {
    title: editableDauroh.title,
    genre: editableDauroh.genre
  };
  if (isEditing.value) {
    daurohStore.updateTopDauroh(editableDauroh.id, payload);
  } else {
    daurohStore.addTopDauroh(payload);
  }
  closeModal();
};

const handleDelete = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus film ini?')) {
    daurohStore.deleteTopDauroh(id);
  }
};
// ======================================================
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
.table-responsive {
  min-height: 200px;
}
</style>

