<template>
  <div class="card shadow-sm mt-4">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Dauroh (Poster Carousel)</h5>
      <button class="btn btn-success btn-sm" @click="openAddModal">+ Tambah Dauroh</button>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <tbody>
            <tr v-for="dauroh in daurohStore.nowPlayingDauroh" :key="dauroh.id">
              <th scope="row">{{ dauroh.id }}</th>
              <td><img :src="dauroh.poster" :alt="dauroh.title" width="50" class="rounded"></td>
              <td>{{ dauroh.title }}</td>
              <td>{{ dauroh.genre }}</td>
              <td class="text-end">
                <button class="btn btn-primary btn-sm me-2" @click="openUpdateModal(dauroh)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="openDeleteModal(dauroh)">Hapus</button>
              </td>
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
// ... (script setup tidak ada perubahan) ...
import { ref, onMounted } from 'vue';
import { useDaurohStore } from '~/stores/dauroh';
import AdminDaurohFormModal from '~/components/admin/AdminDaurohFormModal.vue';
import AdminDeleteConfirmationModal from '~/components/admin/AdminDeleteConfirmationModal.vue';

const daurohStore = useDaurohStore();
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedDauroh = ref(null);

onMounted(() => {
  if (daurohStore.nowPlayingDauroh.length === 0) {
    // daurohStore.fetchDaurohs();
  }
});

const openAddModal = () => {
  isEditing.value = false;
  // Saat menambah, kita kirim objek kosong, bukan null
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
  if (isEditing.value) {
    daurohStore.updateNowPlayingDauroh(daurohData.id, daurohData);
  } else {
    daurohStore.addNowPlayingDauroh(daurohData);
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
    daurohStore.deleteNowPlayingDauroh(selectedDauroh.value.id);
  }
};
</script>

<style scoped>
.table-responsive {
  min-height: 200px;
}
</style>