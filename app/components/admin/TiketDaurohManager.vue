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
            <tr v-for="dauroh in daurohStore.filteredAdminTiketDauroh" :key="dauroh.id || dauroh.Title">
              <th scope="row">{{ dauroh.id }}</th>
              <td>
                 <img
                    :src="dauroh.poster ? `${dauroh.poster}?t=${Date.now()}` : '/assets/img/placeholder-poster.png'"
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
                 <NuxtLink :to="`/admin/dauroh/detail/${dauroh.id}`" class="btn btn-link text-info p-1" title="Lihat/Edit Detail Lanjutan">
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

// State untuk modal form & delete
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false) // Untuk membedakan mode modal form (tambah/edit)
const selectedDauroh = ref<Dauroh | null>(null)

// Fetch data saat komponen dimuat
onMounted(() => {
  if (daurohStore.adminTiketDauroh.length === 0) {
    daurohStore.fetchAdminTiketDauroh();
  }
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

// --- Fungsi untuk Modal Form (Tambah/Edit Dasar) ---
const openAddModal = () => {
  isEditing.value = false
  selectedDauroh.value = null // Kosongkan data
  showFormModal.value = true
}

const openUpdateModal = (dauroh: Dauroh) => {
  isEditing.value = true
  // Salin data dasar yang relevan untuk modal edit
  selectedDauroh.value = {
      id: dauroh.id,
      Title: dauroh.Title,
      Place: dauroh.Place,
      Gender: dauroh.Gender,
      Price: dauroh.Price,
      // Tidak perlu menyalin Date atau poster ke modal ini
  } as Dauroh; // Type assertion jika perlu
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedDauroh.value = null
}

// Handler untuk event @save dari modal form
// Payload HANYA berisi data dasar
const handleSave = async (payload: { daurohData: Omit<Dauroh, 'Date' | 'poster' | 'scheduleDays'>, photoBase64: null }) => {
  // Panggil action store yang sesuai (hanya data dasar)
  let success = false;
  if (isEditing.value && payload.daurohData.id) {
    // Panggil action update basic (akan dibuat di store)
    success = await daurohStore.updateTiketDaurohBasic(payload.daurohData);
  } else {
    // Panggil action add basic (akan dibuat/disesuaikan di store)
    success = await daurohStore.addTiketDaurohBasic(payload.daurohData);
  }

  // Tutup modal jika berhasil
  if (success) {
      closeFormModal();
      // Store akan handle fetch ulang jika perlu
  }
  // Jika gagal, toast error akan muncul dari store, modal tetap terbuka
}


// --- Fungsi untuk Modal Delete (Tetap Sama) ---
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
  /* Styling (termasuk table-sm) dari implementasi sebelumnya */
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
    font-size: 0.9rem; /* Sedikit diperbesar agar ikon tidak terlalu kecil */
    vertical-align: middle; /* Jaga agar ikon sejajar */
    margin: 0 0.15rem; /* Beri sedikit jarak antar tombol */
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