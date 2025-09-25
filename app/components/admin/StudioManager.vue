<template>
  <div class="card shadow-sm mt-4">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Studio</h5>
      <button class="btn btn-success btn-sm" @click="openAddModal">+ Tambah Studio</button>
    </div>
    <div class="card-body">
      <div v-if="daurohStore.isLoadingStudios" class="text-center">
        <p>Memuat data...</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">#ID</th>
              <th scope="col">Gambar</th>
              <th scope="col">Judul</th>
              <th scope="col">Teks</th>
              <th scope="col" class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="card in daurohStore.studioCards" :key="card.id">
              <th scope="row">{{ card.id }}</th>
              <td><img :src="card.image" :alt="card.title" width="80" class="rounded"></td>
              <td>{{ card.title }}</td>
              <td>{{ card.text }}</td>
              <td class="text-end">
                <button class="btn btn-primary btn-sm me-2" @click="openUpdateModal(card)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(card.id)">Hapus</button>
              </td>
            </tr>
            <tr v-if="daurohStore.studioCards.length === 0">
              <td colspan="5" class="text-center text-muted">Belum ada data Studio.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal untuk Tambah/Edit Studio -->
  <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Studio' : 'Tambah Studio Baru' }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="cardTitle" class="form-label">Judul Studio</label>
            <input type="text" class="form-control" id="cardTitle" v-model="editableCard.title">
          </div>
          <div class="mb-3">
            <label for="cardText" class="form-label">Teks Deskripsi</label>
            <textarea class="form-control" id="cardText" v-model="editableCard.text" rows="3"></textarea>
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
</template>

<script setup>
// // components/admin/StudioManager.vue
import { ref, reactive, onMounted } from 'vue';
import { useDaurohStore } from '~/stores/dauroh';

const daurohStore = useDaurohStore();
const showModal = ref(false);
const isEditing = ref(false);
const editableCard = reactive({
  id: null,
  title: '',
  text: ''
});

onMounted(() => {
  // Pastikan data studio sudah ter-load saat komponen ini muncul
  if (daurohStore.studioCards.length === 0) {
    daurohStore.fetchStudioCards();
  }
});

const openAddModal = () => {
  isEditing.value = false;
  editableCard.id = null;
  editableCard.title = '';
  editableCard.text = '';
  showModal.value = true;
};

const openUpdateModal = (card) => {
  isEditing.value = true;
  editableCard.id = card.id;
  editableCard.title = card.title;
  editableCard.text = card.text;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSave = () => {
  const payload = {
    title: editableCard.title,
    text: editableCard.text
  };
  if (isEditing.value) {
    daurohStore.updateStudioCard(editableCard.id, payload);
  } else {
    daurohStore.addStudioCard(payload);
  }
  closeModal();
};

const handleDelete = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus kartu studio ini?')) {
    daurohStore.deleteStudioCard(id);
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
.table-responsive {
  min-height: 200px;
}
</style>