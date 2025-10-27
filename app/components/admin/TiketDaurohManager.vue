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
        <table class="table table-bordered table-hover table-sm align-middle fs-sm">
          <thead class="table-light">
            <tr>
              <th scope="col" style="width: 5%;">ID</th>
              <th scope="col" style="width: 10%;">Poster</th>
              <th scope="col">Judul Event</th>
              <th scope="col">Tempat</th>
              <th scope="col">Gender</th>
              <th scope="col">Harga</th>
              <th scope="col" class="text-center" style="width: 15%;">Aksi</th> </tr>
          </thead>
          <tbody>
            <tr v-for="dauroh in daurohStore.filteredAdminTiketDauroh" :key="dauroh.sk || dauroh.Title">
              <th scope="row">{{ dauroh.sk }}</th>
              <td>
                 <img
                    :src="dauroh.poster ? `${dauroh.poster}?t=${Date.now()}` : ''"
                    :alt="dauroh.Title"
                    width="40"
                    height="60"
                    class="rounded poster-thumbnail"
                    style="object-fit: cover;"
                 />
              </td>
              <td>{{ dauroh.Title }}</td>
              <td>{{ dauroh.Place || '-' }}</td>
              <td class="text-capitalize">{{ dauroh.Gender || 'Umum' }}</td>
              <td>{{ formatCurrency(dauroh.Price) }}</td>
              <td class="text-center">
                 <NuxtLink :to="`/admin/dauroh/detail/${dauroh.sk}`" class="btn btn-link text-info p-1" title="Lihat/Edit Detail Lanjutan">
                  <i class="bi bi-search fs-5"></i>
                </NuxtLink>
                <button class="btn btn-link text-primary p-1" @click="openUpdateModal(dauroh)" title="Edit Info Dasar">
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
    :Dauroh="selectedDauroh"
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
import type { Dauroh } from '@/stores/dauroh' // Import interface Dauroh

const daurohStore = useDaurohStore()

// State untuk modal form & delete
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const selectedDauroh = ref<Partial<Dauroh> | null>(null) // Hanya perlu Partial untuk edit dasar

// Fetch data saat komponen dimuat
onMounted(() => {
  if (daurohStore.adminTiketDauroh.length === 0) {
    daurohStore.fetchAdminTiketDauroh();
  }
})

// Fungsi format mata uang (tidak berubah)
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) return 'Gratis'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

// --- Fungsi untuk Modal Form (Tambah/Edit Dasar) ---
const openAddModal = () => {
  isEditing.value = false
  selectedDauroh.value = null // Kosongkan data
  showFormModal.value = true
}

const openUpdateModal = (dauroh: Dauroh) => {
  isEditing.value = true
  // Salin hanya data dasar yang relevan untuk modal edit
  selectedDauroh.value = {
      sk: dauroh.sk,
      Title: dauroh.Title,
      Place: dauroh.Place,
      Gender: dauroh.Gender,
      Price: dauroh.Price,
      // Tidak perlu menyalin Date atau poster ke modal dasar ini
  }; // Tidak perlu type assertion jika pakai Partial<Dauroh>
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedDauroh.value = null
}

// Handler untuk event @save dari modal form (AdminDaurohFormModal)
// Payload HANYA berisi data dasar
const handleSave = async (payload: { daurohData: Omit<Dauroh, 'Date' | 'poster' | 'kuota' | 'description' | 'pemateri'>, photoBase64: null }) => {
  let success = false;
  if (isEditing.value && payload.daurohData.sk) {
    // Panggil action update basic dari store
    success = await daurohStore.updateTiketDaurohBasic(payload.daurohData);
  } else {
    // Panggil action add basic dari store
    success = await daurohStore.addTiketDaurohBasic(payload.daurohData);
  }

  // Tutup modal jika berhasil (store sudah handle fetch ulang)
  if (success) {
      closeFormModal();
  }
  // Jika gagal, toast error akan muncul dari store, modal tetap terbuka
}


// --- Fungsi untuk Modal Delete (Tetap Sama) ---
const openDeleteModal = (dauroh: Dauroh) => {
  selectedDauroh.value = dauroh // Berisi Dauroh lengkap
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedDauroh.value = null
}

const confirmDelete = () => {
  // Pastikan selectedDauroh memiliki id sebelum menghapus
  if (selectedDauroh.value?.sk) {
    daurohStore.deleteTiketDauroh(selectedDauroh.value.sk);
  }
  closeDeleteModal(); // Selalu tutup modal setelah konfirmasi
}
</script>

<style scoped>
  /* Styling tidak berubah */
  .fs-sm {
    font-size: 0.875rem;
  }
  .table-sm th, .table-sm td {
    padding: 0.4rem;
  }
  .btn-link {
    text-decoration: none;
    border: none;
    background: none;
    padding: 0.25rem;
    line-height: 1;
    font-size: 0.9rem;
    vertical-align: middle;
    margin: 0 0.15rem;
  }
  .btn-link:hover i, .btn-link:hover {
    opacity: 0.7;
  }
  .text-capitalize {
    text-transform: capitalize;
  }
  .poster-thumbnail {
      object-fit: cover;
      height: 60px;
      width: 40px;
  }
</style>