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
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-sm align-middle fs-sm">
          <thead class="table-light">
            <tr>
              <th scope="col" style="width: 5%">SK</th>
              <th scope="col" style="width: 10%" class="text-center">Picture</th>
              <th scope="col">Judul Event</th>
              <th scope="col">Tempat</th>
              <th scope="col">Gender</th>
              <th scope="col">Harga</th>
              <th scope="col" class="text-center" style="width: 15%">Aksi</th>
            </tr>
          </thead>
          <tbody v-if="!daurohStore.loading.adminTiketDauroh && daurohStore.adminTiketDauroh.length > 0">
            <tr v-for="dauroh in daurohStore.filteredAdminTiketDauroh" :key="dauroh.sk || dauroh.Title">
              <th scope="row">{{ dauroh.sk }}</th>
              <td class="text-center">
                <img
                  :src="dauroh.Picture ? `${imgBaseUrl}/${dauroh.sk}/${dauroh.Picture}.webp?t=${Date.now()}` : ''"
                  :alt="dauroh.Picture ? dauroh.Title : 'Tidak ada Picture'"
                  width="30"
                  height="45"
                  class="rounded Picture-thumbnail"
                  style="object-fit: cover; background-color: #f8f9fa; display: inline-block; vertical-align: middle;"
                  @error="($event.target as HTMLImageElement).style.display = 'none'" />
                <span
                  v-if="!dauroh.Picture"
                  class="text-muted small">
                  N/A
                </span>
              </td>
              <td>{{ dauroh.Title }}</td>
              <td>{{ dauroh.Place || "-" }}</td>
              <td class="text-capitalize">{{ dauroh.Gender || "Umum" }}</td>
              <td>{{ formatCurrency(dauroh.Price) }}</td>
              <td class="text-center">
                <button
                  class="btn btn-link text-info p-1"
                  @click="openDetailModal(dauroh)"
                  :disabled="!dauroh.sk"
                  :title="dauroh.sk ? 'Lihat/Edit Detail Lanjutan' : 'Detail belum tersedia (SK kosong)'">
                  <i class="bi bi-search fs-5"></i>
                </button>
                <button class="btn btn-link text-primary p-1" @click="openUpdateModal(dauroh)" title="Edit Info Dasar">
                  <i class="bi bi-pencil-square fs-5"></i>
                </button>
                <button class="btn btn-link text-danger p-1" @click="openDeleteModal(dauroh)" title="Hapus">
                  <i class="bi bi-trash fs-5"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="!daurohStore.loading.adminTiketDauroh && daurohStore.adminTiketDauroh.length === 0">
            <tr>
              <td colspan="7" class="text-center text-muted py-4">Belum ada data event dauroh.</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7">
                <CommonLoadingSpinner />
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
    :dauroh="selectedDauroh ?? undefined"
    @close="closeFormModal"
    @save="handleSave" />

  <AdminDeleteConfirmationModal
    v-if="showDeleteModal"
    :show="showDeleteModal"
    :item-name="selectedDaurohForDelete ? selectedDaurohForDelete.Title : ''"
    @close="closeDeleteModal"
    @confirm="confirmDelete" />

  <AdminDaurohDetailModal
    vif="showDetailModal"
    :show="showDetailModal"
    :dauroh="selectedDaurohForDetail" 
    @close="closeDetailModal"
    @updated="handleDetailUpdated" />
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useDaurohStore } from "@/stores/dauroh";
  import type { Dauroh } from "@/stores/dauroh";
  import Swal from "sweetalert2";

  // Ambil config runtime
  const config = useRuntimeConfig();
  const imgBaseUrl = ref(config.public.img || ''); // Simpan base URL

  const daurohStore = useDaurohStore();

  const showFormModal = ref(false);
  const showDeleteModal = ref(false);
  const isEditing = ref(false);
  const selectedDauroh = ref<Partial<Dauroh> | null>(null);
  const selectedDaurohForDelete = ref<Dauroh | null>(null);
  const showDetailModal = ref(false);
  const selectedDaurohForDetail = ref<Dauroh | null>(null); 

  onMounted(() => {
    daurohStore.fetchAdminTiketDauroh();
  });

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // * Memperbaiki sintaks TypeScript di sini
  const openDetailModal = (dauroh: Dauroh | null) => {
    if (dauroh && dauroh.sk) {
      selectedDaurohForDetail.value = dauroh; // Simpan objek dauroh utuh
      showDetailModal.value = true;
    } else {
      Swal.fire("Error", "SK event tidak valid untuk dilihat detailnya.", "error");
    }
  };
  
  const closeDetailModal = () => {
    showDetailModal.value = false;
    selectedDaurohForDetail.value = null; 
  };
  
  const handleDetailUpdated = () => {
    daurohStore.fetchAdminTiketDauroh();
  };

  const openAddModal = () => {
    isEditing.value = false;
    selectedDauroh.value = null;
    showFormModal.value = true;
  };
  const openUpdateModal = (dauroh: Dauroh) => {
    isEditing.value = true;
    selectedDauroh.value = { sk: dauroh.sk, Title: dauroh.Title, Place: dauroh.Place, Gender: dauroh.Gender, Price: dauroh.Price };
    showFormModal.value = true;
  };
  const closeFormModal = () => {
    showFormModal.value = false;
    selectedDauroh.value = null;
  };
  
  const handleSave = async (payload: {
    daurohData: Omit<Dauroh, "id" | "Date" | "Picture" | "kuota" >;
    photoBase64: null;
  }) => {
    let success = false;
    try {
      if (isEditing.value && payload.daurohData.sk) {
        success = await daurohStore.updateTiketDaurohBasic(payload.daurohData);
      } else {
        success = await daurohStore.addTiketDaurohBasic(payload.daurohData);
      }
    } catch (error) {
      success = false;
      Swal.fire("Error", "Terjadi kesalahan saat memproses penyimpanan.", "error");
    }

    if (success) {
      closeFormModal();
    } else {
    }
  };

  const openDeleteModal = (dauroh: Dauroh) => {
    selectedDaurohForDelete.value = dauroh;
    showDeleteModal.value = true;
  };
  const closeDeleteModal = () => {
    showDeleteModal.value = false;
    selectedDaurohForDelete.value = null;
  };
  const confirmDelete = () => {
    if (selectedDaurohForDelete.value?.sk) {
      daurohStore.deleteTiketDauroh(selectedDaurohForDelete.value.sk);
    }
    closeDeleteModal();
  };
</script>

<style scoped>
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
  .btn-link:hover i,
  .btn-link:hover {
    opacity: 0.7;
  }
  .text-capitalize {
    text-transform: capitalize;
  }
  .Picture-thumbnail {
    object-fit: cover;
    height: 45px;
    width: 30px;
    border: 1px solid #dee2e6;
  }
  img[src$="placeholder-Picture.png"] {
    object-fit: contain;
    padding: 5px;
    background-color: #f8f9fa;
  }
</style>