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
            <tr v-for="dauroh in daurohStore.tiketDauroh" :key="dauroh.id || dauroh.title">
              <th scope="row">{{ dauroh.id }}</th>
              <td>
                <img :src="dauroh.poster" :alt="dauroh.title" width="50" class="rounded" />
              </td>
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

  <!-- Modal tambah/edit -->
  <AdminDaurohFormModal
    v-if="showFormModal"
    :show="showFormModal"
    :is-editing="isEditing"
    :dauroh="selectedDauroh || undefined"
    @close="closeFormModal"
    @save="handleSave"
  />

  <!-- Modal hapus -->
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
import { useDaurohStore } from '@/stores/dauroh' // ✅ pakai @ alias
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
  title: '',       // kasih string kosong juga
  genre: '',
  poster: ''
}
  showFormModal.value = true
}

const openUpdateModal = (dauroh: Dauroh) => {
  // untuk sekarang belum ada update di store, jadi kita hanya simpan state
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
    // TODO: buat action updateTiketDauroh di store kalau mau edit
    console.log('Fitur edit belum diimplementasi', payload)
  } else {
    // contoh BE: await daurohStore.addTiketDaurohAPI(payload)
    daurohStore.addTiketDauroh(payload) // ✅ ini sudah ada di store
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
  // TODO: buat action deleteTiketDauroh di store kalau mau hapus
  console.log('Fitur delete belum diimplementasi untuk id', selectedDauroh.value?.id)
  showDeleteModal.value = false
}
</script>

<style scoped>
.table-responsive {
  min-height: 200px;
}
</style>
