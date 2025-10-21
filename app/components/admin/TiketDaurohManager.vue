// app/components/admin/TiketDaurohManager.vue
<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Event Dauroh</h5>
      <button class="btn btn-success btn-sm" @click="openAddModal">
        <i class="bi bi-plus-lg me-1"></i>
        Tambah Event
      </button>
    </div>
    <div class="card-body">
      <CommonLoadingSpinner v-if="daurohStore.loading.adminTiketDauroh" />

      <div v-else class="table-responsive">
        <table class="table table-bordered table-hover align-middle fs-sm">
          <thead class="table-light">
            <tr>
              <th scope="col" style="width: 5%;">ID</th>
              <th scope="col" style="width: 10%;">Poster</th>
              <th scope="col">Judul Event</th>
              <th scope="col">Tempat</th>
              <th scope="col">Gender</th>
              <th scope="col">Harga</th>
              <th scope="col" class="text-center" style="width: 10%;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dauroh in daurohStore.filteredAdminTiketDauroh" :key="dauroh.id || dauroh.Title">
              <th scope="row">{{ dauroh.id }}</th>
              <td>
                <img :src="dauroh.poster || 'https://via.placeholder.com/300x450.png?text=No+Poster'" :alt="dauroh.Title" width="50" class="rounded" />
              </td>
              <td>{{ dauroh.Title }}</td>
              <td>{{ dauroh.place }}</td>
              <td class="text-capitalize">{{ dauroh.Gender }}</td>
              <td>{{ formatCurrency(dauroh.price) }}</td>
              <td class="text-center">
                <button class="btn btn-link text-primary p-1" @click="openUpdateModal(dauroh)" title="Edit">
                  <i class="bi bi-pencil-square fs-5"></i>
                </button>
                <button class="btn btn-link text-danger p-1" @click="openDeleteModal(dauroh)" title="Hapus">
                  <i class="bi bi-trash fs-5"></i>
                </button>
              </td>
            </tr>
             <tr v-if="!daurohStore.loading.adminTiketDauroh && daurohStore.adminTiketDauroh.length === 0">
              <td colspan="7" class="text-center py-5">
                <i class="bi bi-x-circle fs-3 text-muted"></i>
                <h6 class="mt-2 mb-1">Belum Ada Data Event</h6>
                <p class="text-muted small">Silakan tambahkan event baru untuk memulai.</p>
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
    :dauroh="selectedDauroh || undefined"
    @close="closeFormModal"
    @save="handleSave"
  />

  <AdminDeleteConfirmationModal
    v-if="showDeleteModal"
    :show="showDeleteModal"
    :item-name="selectedDauroh ? selectedDauroh.Title : ''"
    @close="closeDeleteModal"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDaurohStore } from '@/stores/dauroh'
import type { Dauroh } from '@/stores/dauroh'

const daurohStore = useDaurohStore()

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const selectedDauroh = ref<Dauroh | null>(null)

onMounted(() => {
  // Panggil action untuk data admin
  daurohStore.fetchAdminTiketDauroh();
})

const formatCurrency = (value: number) => {
  if (!value && value !== 0) return 'Gratis' // Handle 0 price correctly
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

const openAddModal = () => {
  isEditing.value = false
  selectedDauroh.value = null
  showFormModal.value = true
}

const openUpdateModal = (dauroh: Dauroh) => {
  isEditing.value = true
  // Pastikan membuat salinan objek agar tidak terjadi mutasi langsung
  selectedDauroh.value = { ...dauroh }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedDauroh.value = null // Reset selected dauroh
}

// handleSave sudah benar memanggil action admin
const handleSave = (payload: { daurohData: any }) => {
  if (isEditing.value && selectedDauroh.value?.id) {
     // Logika update (perlu implementasi API call di store)
     console.log("Updating dauroh:", selectedDauroh.value.id, payload.daurohData);
     daurohStore.updateTiketDauroh({ daurohData: { ...payload.daurohData, id: selectedDauroh.value.id }, file: null });
  } else {
    daurohStore.addTiketDauroh(payload);
  }
  closeFormModal();
}

const openDeleteModal = (dauroh: Dauroh) => {
  selectedDauroh.value = dauroh
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedDauroh.value = null // Reset selected dauroh
}

const confirmDelete = () => {
  if (selectedDauroh.value?.id) {
    daurohStore.deleteTiketDauroh(selectedDauroh.value.id);
  }
  closeDeleteModal(); // closeDeleteModal sudah mereset selectedDauroh
}
</script>

<style scoped>
  /* Style tetap sama */
  .fs-sm { font-size: 0.875rem; }
  .btn-link { text-decoration: none; border: none; background: none; padding: 0.25rem; line-height: 1; }
  .btn-link:hover i { opacity: 0.7; }
  .text-capitalize { text-transform: capitalize; }
</style>