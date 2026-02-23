<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
      <h5 class="mb-0">Manajemen Event Event</h5>
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
              <th scope="col" style="width: 15%" class="text-center">Tanggal</th>
              <th scope="col" style="width: 5%" class="text-center">Picture</th>
              <th scope="col" style="width: 25%">Judul Event</th>
              <th scope="col">Tempat</th>
              <th scope="col">Gender</th>
              <th scope="col">Harga</th>
              <th scope="col" class="text-center" style="width: 10%">Status</th>
              <th scope="col" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody v-if="!eventStore.loading.adminTiketEvent && eventStore.adminTiketEvent.length > 0">
            <tr v-for="event in eventStore.filteredAdminTiketEvent" :key="event.SK || event.Title">

              <th scope="row" class="fw-normal text-center">
                {{ formatEventDates(event.Date) }}
              </th>

              <td class="text-center">
                <img :src="event.Picture ? `${imgBaseUrl}/${event.SK}/${event.Picture}.webp?t=${Date.now()}` : ''"
                  :alt="event.Picture ? event.Title : 'Tidak ada Picture'" width="30" height="45"
                  class="rounded Picture-thumbnail"
                  style="object-fit: cover; background-color: #f8f9fa; display: inline-block; vertical-align: middle;"
                  @error="($event.target as HTMLImageElement).style.display = 'none'" />
                <span v-if="!event.Picture" class="text-muted small">
                  N/A
                </span>
              </td>
              <td>{{ event.Title }}</td>
              <td>{{ event.Place || "-" }}</td>
              <td class="text-capitalize">
                {{ event.Gender }}
              </td>
              <td>{{ formatCurrency(event.Price) }}</td>

              <td class="text-center">
                <span v-if="event.Status === 'active'"
                  class="badge bg-success bg-opacity-10 text-success rounded-pill border border-success px-3">
                  Active
                </span>
                <span v-else class="badge bg-danger bg-opacity-10 text-danger rounded-pill border border-danger px-3">
                  Inactive
                </span>
              </td>

              <td class="text-center">
                <button class="btn btn-link text-info p-1" @click="navigateToPage(event)" :disabled="!event.SK"
                  :title="event.SK ? 'Lihat Detail & Edit' : 'Detail belum tersedia'">
                  <i class="bi bi-search fs-5"></i>
                </button>
                <button class="btn btn-link text-danger p-1" @click="openDeleteModal(event)" title="Hapus">
                  <i class="bi bi-trash fs-5"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="!eventStore.loading.adminTiketEvent && eventStore.adminTiketEvent.length === 0">
            <tr>
              <td colspan="8" class="text-center text-muted py-4">Belum ada data event event.</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="8">
                <CommonLoadingSpinner />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <AdminEventFormModal v-if="showFormModal" :show="showFormModal" :is-editing="isEditing"
    :event="selectedEvent ?? undefined" @close="closeFormModal" @save="handleSave" />

  <AdminDeleteConfirmationModal v-if="showDeleteModal" :show="showDeleteModal"
    :item-name="selectedEventForDelete ? selectedEventForDelete.Title : ''" @close="closeDeleteModal"
    @confirm="confirmDelete" />

</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useEventStore } from "@/stores/event";
import type { Event } from "@/types/event";
import Swal from "sweetalert2";
import { useRouter } from 'vue-router'; // [TAMBAH] Router

const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');
const router = useRouter(); // [TAMBAH] Init router

const eventStore = useEventStore();

const showFormModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedEvent = ref<Partial<Event> | null>(null);
const selectedEventForDelete = ref<Event | null>(null);

// [HAPUS] State modal detail tidak lagi diperlukan
// const showDetailModal = ref(false);
// const selectedEventForDetail = ref<Event | null>(null); 

onMounted(() => {
  eventStore.fetchAdminTiketEvent();
});

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatEventDates = (dateObj: any) => {
  if (!dateObj || typeof dateObj !== 'object') return '-';

  const rawDates = Object.values(dateObj)
    .map((d: any) => d?.date)
    .filter((d: any) => typeof d === 'string' && d) as string[];

  const validDates = rawDates
    .map(dateStr => new Date(dateStr))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (validDates.length === 0) return '-';

  const first = validDates[0]!;
  const toDateStr = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const toMonthYear = (d: Date) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const isSameMonthYear = validDates.every(d => d.getMonth() === first.getMonth() && d.getFullYear() === first.getFullYear());

  if (isSameMonthYear) {
    const days = validDates.map(d => d.getDate());
    const monthYear = toMonthYear(first);
    return `${days.join(', ')} ${monthYear}`;
  }

  return validDates.map(toDateStr).join(', ');
};

// [TAMBAH] Fungsi navigasi ke halaman detail
const navigateToPage = (event: Event | null) => {
  if (event && event.SK) {
    router.push(`/admin/event/${event.SK}`);
  } else {
    Swal.fire("Error", "SK event tidak valid.", "error");
  }
};

// [HAPUS] Fungsi openDetailModal, closeDetailModal, handleDetailUpdated

const openAddModal = () => {
  isEditing.value = false;
  selectedEvent.value = null;
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  selectedEvent.value = null;
};

const handleSave = async (payload: {
  eventData: Omit<Event, "id" | "Date" | "Picture">;
  photoBase64: null;
}) => {
  let success = false;
  try {
    if (isEditing.value && payload.eventData.SK) {
      success = await eventStore.updateTiketEventBasic({
        ...payload.eventData,
        SK: payload.eventData.SK
      });
    } else {
      success = await eventStore.addTiketEventBasic(payload.eventData);
    }
  } catch (error) {
    success = false;
    Swal.fire("Error", "Terjadi kesalahan saat memproses penyimpanan.", "error");
  }
  if (success) {
    closeFormModal();
  }
};

const openDeleteModal = (event: Event) => {
  selectedEventForDelete.value = event;
  showDeleteModal.value = true;
};
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedEventForDelete.value = null;
};
const confirmDelete = () => {
  if (selectedEventForDelete.value?.SK) {
    eventStore.deleteTiketEvent(selectedEventForDelete.value.SK);
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