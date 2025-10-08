<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Tiket Dauroh</h5>
      <button class="btn btn-success btn-sm" @click="openAddModal">
        <i class="bi bi-plus-lg me-1"></i>
        Tambah Dauroh
      </button>
    </div>
    <div class="card-body">
      <CommonLoadingSpinner v-if="daurohStore.loading.tiketDauroh" />

      <div v-else class="table-responsive">
        <table class="table table-bordered table-hover align-middle fs-sm">
          <thead class="table-light">
            <tr>
              <th scope="col" style="width: 5%;">ID</th>
              <th scope="col" style="width: 10%;">Poster</th>
              <th scope="col">Judul</th>
              <th scope="col">Genre/Kategori</th>
              <th scope="col" class="text-end" style="width: 15%;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dauroh in daurohStore.tiketDauroh" :key="dauroh.id || dauroh.title">
              <th scope="row">{{ dauroh.id }}</th>
              <td>
                <img :src="dauroh.poster" :alt="dauroh.title" width="50" class="rounded" />
              </td>
              <td>{{ dauroh.title }}</td>
              <td>{{ dauroh.genre }}</td>
              <td class="text-end">
                <button class="btn btn-primary btn-sm me-2">Edit</button>
                <button class="btn btn-danger btn-sm">Hapus</button>
              </td>
            </tr>
            <tr v-if="!daurohStore.loading.tiketDauroh && daurohStore.tiketDauroh.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Belum ada data Dauroh.</td>
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
    :dauroh="selectedDauroh || undefined"
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDaurohStore } from '@/stores/dauroh'
import AdminDaurohFormModal from '@/components/admin/AdminDaurohFormModal.vue'
import AdminDeleteConfirmationModal from '@/components/admin/AdminDeleteConfirmationModal.vue'
import CommonLoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Dauroh } from '@/stores/dauroh'

const daurohStore = useDaurohStore()

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const selectedDauroh = ref<Dauroh | null>(null)

onMounted(() => {
  daurohStore.fetchTiketDauroh()
})

const openAddModal = () => {
  isEditing.value = false
selectedDauroh.value = {
  id: null,
  title: '',
  genre: '',
  poster: ''
}
  showFormModal.value = true
}

const openUpdateModal = (dauroh: Dauroh) => {
  isEditing.value = true
  selectedDauroh.value = { ...dauroh }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
}

const handleSave = (daurohData: Dauroh) => {
  const payload: Dauroh = {
    id: daurohData.id ?? null,
    title: daurohData.title,
    genre: daurohData.genre,
    poster: daurohData.poster
  }

  if (isEditing.value) {
    console.log('Fitur edit belum diimplementasi', payload)
  } else {
    daurohStore.addTiketDauroh(payload)
  }
  showFormModal.value = false
}

const openDeleteModal = (dauroh: Dauroh) => {
  selectedDauroh.value = dauroh
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const confirmDelete = () => {
  console.log('Fitur delete belum diimplementasi untuk id', selectedDauroh.value?.id)
  showDeleteModal.value = false
}
</script>

<style scoped>
/* Menambahkan style untuk font size kecil di tabel */
.fs-sm {
  font-size: 0.875rem;
}

/* Mengatur agar tombol aksi tidak turun baris di layar kecil */
.btn-sm {
  white-space: nowrap;
}
</style>