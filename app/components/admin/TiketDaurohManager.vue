<template>
  <div class="card shadow-sm mt-4">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Tiket Dauroh</h5>
      <button class="btn btn-success btn-sm" @click="openAddModal">+ Tambah Dauroh</button>
    </div>
    <div class="card-body">
      <CommonLoadingSpinner v-if="daurohStore.isLoadingTiketDauroh" />

      <div v-else class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Poster</th>
              <th scope="col">Judul</th>
              <th scope="col">Genre/Kategori</th>
              <th scope="col" class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dauroh in daurohStore.tiketDauroh" :key="dauroh.id">
              <th scope="row">{{ dauroh.id }}</th>
              <td><img :src="dauroh.poster" :alt="dauroh.title" width="50" class="rounded"></td>
              <td>{{ dauroh.title }}</td>
              <td>{{ dauroh.genre }}</td>
              <td class="text-end">
                <button class="btn btn-primary btn-sm me-2" @click="openUpdateModal(dauroh)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="openDeleteModal(dauroh)">Hapus</button>
              </td>
            </tr>
            <tr v-if="!daurohStore.isLoadingTiketDauroh && daurohStore.tiketDauroh.length === 0">
              <td colspan="5" class="text-center text-muted">Belum ada data Dauroh.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <AdminDaurohFormModal
    v-if="showFormModal"
    :show="showFormModal"
    :is-editing="isEditing"
    :dauroh="selectedDauroh"
    @close="closeFormModal"
    @save="handleSave"
  />

  <AdminDeleteConfirmationModal
    v-if="showDeleteModal"
    :show="showDeleteModal"
    :item-name="selectedDauroh ? selectedDauroh.title : ''"
    @close="closeDeleteModal"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDaurohStore } from '~/stores/dauroh';
import AdminDaurohFormModal from '~/components/admin/AdminDaurohFormModal.vue';
import AdminDeleteConfirmationModal from '~/components/admin/AdminDeleteConfirmationModal.vue';
// Import spinner
import CommonLoadingSpinner from '~/components/common/LoadingSpinner.vue';

const daurohStore = useDaurohStore();

const showFormModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedDauroh = ref(null);

onMounted(() => {
  // Panggil fungsi fetch untuk simulasi loading
  // Kita asumsikan data selalu di-fetch ulang saat komponen dibuka
  daurohStore.fetchTiketDauroh();
});

// ... (semua fungsi modal lainnya tidak perlu diubah)
const openAddModal = () => {
  isEditing.value = false;
  selectedDauroh.value = { title: '', genre: '', poster: '' };
  showFormModal.value = true;
};

const openUpdateModal = (dauroh) => {
  isEditing.value = true;
  selectedDauroh.value = { ...dauroh };
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

const handleSave = (daurohData) => {
  const payload = {
    title: daurohData.title,
    genre: daurohData.genre,
    poster: daurohData.poster
  };
  if (isEditing.value) {
    daurohStore.updateTiketDauroh(daurohData.id, payload);
  } else {
    daurohStore.addTiketDauroh(payload);
  }
};

const openDeleteModal = (dauroh) => {
  selectedDauroh.value = dauroh;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const confirmDelete = () => {
  if (selectedDauroh.value) {
    daurohStore.deleteTiketDauroh(selectedDauroh.value.id);
  }
};
</script>

<style scoped>
.table-responsive {
  min-height: 200px;
}
</style>