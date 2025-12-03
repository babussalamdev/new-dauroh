<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Event Dauroh</h5>
      <button class="btn btn-primary btn-sm" @click="openAddModal">
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
              <th scope="col" class="text-center" style="width: 10%">Aksi</th> </tr>
          </thead>
          <tbody v-if="!daurohStore.loading.adminTiketDauroh && daurohStore.adminTiketDauroh.length > 0">
            <tr v-for="dauroh in daurohStore.filteredAdminTiketDauroh" :key="dauroh.SK || dauroh.Title">
              <th scope="row">{{ dauroh.SK }}</th>
              <td class="text-center">
                <img
                  :src="dauroh.Picture ? `${imgBaseUrl}/${dauroh.SK}/${dauroh.Picture}.webp?t=${Date.now()}` : ''"
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
              <td class="text-capitalize">
                  {{ dauroh.Gender === 'Umum' ? 'Ikhwan, Akhwat' : (dauroh.Gender || "Ikhwan, Akhwat") }}
              </td>
              <td>{{ formatCurrency(dauroh.Price) }}</td>
              <td class="text-center">
                <button
                  class="btn btn-link text-info p-1"
                  @click="openDetailModal(dauroh)"
                  :disabled="!dauroh.SK"
                  :title="dauroh.SK ? 'Lihat Detail & Edit' : 'Detail belum tersedia'">
                  <i class="bi bi-search fs-5"></i>
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
    v-if="showDetailModal"
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

  const config = useRuntimeConfig();
  const imgBaseUrl = ref(config.public.img || '');

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


  const openDetailModal = (dauroh: Dauroh | null) => {
    if (dauroh && dauroh.SK) {
      selectedDaurohForDetail.value = dauroh;
      showDetailModal.value = true;
    } else {
      Swal.fire("Error", "SK event tidak valid untuk dilihat detailnya.", "error");
    }
  };
  
  const closeDetailModal = () => {
    showDetailModal.value = false;
    selectedDaurohForDetail.value = null; 
  };
  
  // Handler jika ada update dari detail modal
  // Karena state sudah diupdate di store secara langsung, kita tidak perlu fetch ulang
  // Tapi bisa melakukan force update jika perlu (biasanya vue reactive handle ini)
  const handleDetailUpdated = () => {
    // daurohStore.fetchAdminTiketDauroh(); // DIHAPUS AGAR TIDAK GET ULANG
  };

  const openAddModal = () => {
    isEditing.value = false;
    selectedDauroh.value = null;
    showFormModal.value = true;
  };

  const closeFormModal = () => {
    showFormModal.value = false;
    selectedDauroh.value = null;
  };
  
  const handleSave = async (payload: {
    daurohData: Omit<Dauroh, "id" | "Date" | "Picture" >;
    photoBase64: null;
  }) => {
    let success = false;
    try {
      // Disini payload sudah membawa data, store yang menghandle update local state
      if (isEditing.value && payload.daurohData.SK) {
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
      // Tidak perlu Swal lagi disini karena store sudah menampilkan toast/swal
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
    if (selectedDaurohForDelete.value?.SK) {
      daurohStore.deleteTiketDauroh(selectedDaurohForDelete.value.SK);
    }
    closeDeleteModal();
  };
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

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