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
                 <img
                    :src="dauroh.poster ? `${dauroh.poster}?t=${Date.now()}` : ''"
                    :alt="dauroh.Title"
                    width="50"
                    class="rounded poster-thumbnail"
                 />
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
               <td colspan="7" class="text-center text-muted py-4">
                 Belum ada data event dauroh.
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

// Fetch data saat komponen dimuat
onMounted(() => {
  daurohStore.fetchAdminTiketDauroh();
})

// Fungsi format mata uang
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) return 'Gratis'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

// Fungsi-fungsi untuk membuka/menutup modal
const openAddModal = () => {
  isEditing.value = false
  selectedDauroh.value = null
  showFormModal.value = true
}

const openUpdateModal = (dauroh: Dauroh) => {
  isEditing.value = true
  selectedDauroh.value = { ...dauroh } // Salin objek
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedDauroh.value = null
}

// 3. Handler untuk event @save dari AdminDaurohFormModal
//    Payload sudah berisi daurohData dan photoBase64
const handleSave = (payload: { daurohData: any, photoBase64: string | null }) => {
  if (isEditing.value && selectedDauroh.value?.id) {
      // Panggil action update dari store dengan payload yang diterima
      daurohStore.updateTiketDauroh(payload);
  } else {
      // Panggil action add dari store dengan payload yang diterima
      daurohStore.addTiketDauroh(payload);
  }
  closeFormModal(); // Tutup modal form setelah memanggil action
}

// Fungsi-fungsi untuk modal delete
const openDeleteModal = (dauroh: Dauroh) => {
  selectedDauroh.value = dauroh
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedDauroh.value = null
}

const confirmDelete = () => {
  if (selectedDauroh.value?.id) {
    daurohStore.deleteTiketDauroh(selectedDauroh.value.id);
  }
  closeDeleteModal();
}
</script>

<style scoped>
  .fs-sm { 
    font-size: 0.875rem; 
  }
  .btn-link { 
    text-decoration: none; 
    border: none; 
    background: none; 
    padding: 0.25rem; 
    line-height: 1; 
  }
  .btn-link:hover i { 
    opacity: 0.7; 
  }
  .text-capitalize { 
    text-transform: capitalize; 
  }
  .poster-thumbnail {
      object-fit: cover;
      height: 40px;
      width: auto;
  }
</style>