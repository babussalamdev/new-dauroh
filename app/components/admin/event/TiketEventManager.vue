<template>
  <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
    
   <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
  
  <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
    <h6 class="mb-0 fw-bold txt-subtitle text-dark text-truncate w-100">Manajemen Event</h6>
  </div>

  <div class="d-flex flex-shrink-0 flex-wrap gap-2 align-items-center">
    <div class="input-group input-group-sm" style="width: 200px;">
      <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
      <input type="text" class="form-control border-start-0 ps-0 bg-light shadow-none txt-caption" placeholder="Cari judul event..." v-model="searchQuery">
    </div>
    
    <div class="input-group input-group-sm" style="width: 150px;">
      <input type="date" class="form-control bg-light shadow-none txt-caption text-muted" v-model="filterDate" title="Filter berdasarkan tanggal acara">
      <button v-if="filterDate" class="btn btn-light border" @click="filterDate = ''" title="Reset Tanggal">
        <i class="bi bi-x"></i>
      </button>
    </div>

    <button class="btn btn-primary btn-sm rounded-pill px-3 py-1 shadow-sm txt-caption fw-medium ms-1" @click="openAddModal">
      Tambah Event
    </button>
  </div>

</div>
    
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0" style="min-width: 800px;">
          <thead>
            <tr>
              <th class="text-center ps-4 txt-label" style="width: 15%">TANGGAL</th>
              <th class="text-center txt-label" style="width: 5%">PIC</th>
              <th class="txt-label" style="width: 25%">JUDUL EVENT</th>
              <th class="txt-label">TEMPAT</th>
              <th class="txt-label">GENDER</th>
              <th class="txt-label">HARGA</th>
              <th class="text-center txt-label" style="width: 10%">STATUS</th>
              <th class="text-center pe-4 txt-label" style="width: 10%">AKSI</th>
            </tr>
          </thead>
          
          <tbody v-if="!eventStore.loading.adminTiketEvent && displayedEvents.length > 0">
            <tr v-for="event in displayedEvents" :key="event.SK || event.Title">

              <td class="text-center fw-bold txt-body text-muted ps-4">
                {{ formatEventDates(event.Date) }}
              </td>

              <td class="text-center">
                <img :src="event.Picture ? `${imgBaseUrl}/${event.SK}/${event.Picture}.webp?t=${Date.now()}` : ''"
                  :alt="event.Picture ? event.Title : 'Tidak ada Picture'" width="30" height="45"
                  class="rounded Picture-thumbnail shadow-sm"
                  style="object-fit: cover; background-color: #f8f9fa;"
                  @error="($event.target as HTMLImageElement).style.display = 'none'" />
                <span v-if="!event.Picture" class="text-muted txt-caption fw-bold">N/A</span>
              </td>
              
              <td class="fw-bold txt-body text-dark">{{ event.Title }}</td>
              
              <td class="fw-bold txt-body text-dark">{{ event.Place || "-" }}</td>
              
              <td class="text-capitalize">
                <span 
                class="badge" 
                :class="event.Gender.toLowerCase() === 'ikhwan' ? 'badge-ikhwan' : (event.Gender.toLowerCase() === 'akhwat' ? 'badge-akhwat' : 'badge-umum')" 
                style="font-size: 0.7rem;">
                {{ event.Gender }}
              </span>
            </td>
              
              <td class="fw-bold txt-body">{{ formatCurrency(event.Price) }}</td>

              <td class="text-center">
                <span v-if="event.Status === 'active'" class="badge bg-success bg-opacity-10 text-success rounded-pill border border-success px-3 txt-label">
                  Active
                </span>
                <span v-else class="badge bg-danger bg-opacity-10 text-danger rounded-pill border border-danger px-3 txt-label">
                  Inactive
                </span>
              </td>

              <td class="text-center pe-4">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm text-primary p-0 border-0 bg-transparent shadow-none" @click="navigateToPage(event)" :disabled="!event.SK" :title="event.SK ? 'Lihat Detail & Edit' : 'Detail belum tersedia'">
                    <i class="bi bi-pencil-square fs-5"></i>
                  </button>
                  <button class="btn btn-sm text-warning p-0 border-0 bg-transparent shadow-none" @click="navigateToCertificate(event)" :disabled="!event.SK" title="Kelola Sertifikat">
                    <i class="bi bi-patch-check-fill fs-5"></i>
                  </button>
                  <button class="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none" @click="openDeleteModal(event)" title="Hapus">
                    <i class="bi bi-trash fs-5"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          
          <tbody v-else-if="!eventStore.loading.adminTiketEvent && displayedEvents.length === 0">
            <tr>
              <td colspan="8" class="text-center text-muted py-5">
                <i class="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                <span class="txt-body fw-bold">Tidak ada event yang sesuai pencarian.</span>
              </td>
            </tr>
          </tbody>
          
          <tbody v-else>
            <tr>
              <td colspan="8" class="py-5">
                <CommonLoadingSpinner />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 px-4 border-top bg-white gap-3" v-if="totalPages > 0 && !eventStore.loading.adminTiketEvent">
    <span class="txt-caption text-muted fw-medium">
      Menampilkan {{ startIndex + 1 }} - {{ endIndex }} dari {{ totalFilteredEvents }} event
    </span>
    <div class="d-flex align-items-center gap-1">
          
          <button class="btn btn-sm p-0 border-0 bg-transparent shadow-none text-dark d-flex align-items-center" 
                  @click="currentPage--" 
                  :disabled="currentPage === 1">
            <i class="bi bi-chevron-left fw-bold"></i>
          </button>
          
          <span class="txt-caption fw-bold text-muted px-2">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button class="btn btn-sm p-0 border-0 bg-transparent shadow-none text-dark d-flex align-items-center" 
                  @click="currentPage++" 
                  :disabled="currentPage === totalPages">
            <i class="bi bi-chevron-right fw-bold"></i>
          </button>

        </div>
  </div>
</div>
</div>

  <AdminEventFormModal 
  v-if="showFormModal" 
  :show="showFormModal" 
  :is-editing="isEditing"
  :event="selectedEvent ?? undefined" 
  @close="closeFormModal" 
  @next="handleNextStep" 
/>

<AdminEventMediaModal 
  v-if="showMediaModal" 
  :show="showMediaModal" 
  @close="closeMediaModal" 
  @back="goBackToStep1" 
  @saveFinal="handleFinalSave" 
/>

  <AdminCommonDeleteConfirmationModal v-if="showDeleteModal" :show="showDeleteModal"
    :item-name="selectedEventForDelete ? selectedEventForDelete.Title : ''" @close="closeDeleteModal"
    @confirm="confirmDelete" />

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useEventStore } from "@/stores/event";
import type { Event } from "@/types/event";
import Swal from "sweetalert2";
import { useRouter } from 'vue-router'; 
import { useAlert } from '~/utils/swal';

const { alert: swalAlert } = useAlert();
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');
const router = useRouter();

const eventStore = useEventStore();

const showFormModal = ref(false);
const showDeleteModal = ref(false);
const showMediaModal = ref(false);
const isEditing = ref(false);
const selectedEvent = ref<Partial<Event> | null>(null);
const selectedEventForDelete = ref<Event | null>(null);
// STATE UNTUK FILTER & PAGINATION
const searchQuery = ref('');
const filterDate = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

watch([searchQuery, filterDate], () => {
  currentPage.value = 1;
});

// const showDetailModal = ref(false);
// const selectedEventForDetail = ref<Event | null>(null); 

onMounted(() => {
  if (eventStore.adminTiketEvent.length === 0) {
    eventStore.fetchAdminTiketEvent();
  }
});

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Fungsi navigasi ke halaman detail
const navigateToPage = (event: Event | null) => {
  if (event && event.SK) {
    router.push(`/admin/event/${event.SK}`);
  } else {
    Swal.fire("Error", "SK event tidak valid.", "error");
  }
};

const navigateToCertificate = (event: Event | null) => {
  if (event && event.SK) {
    router.push(`/admin/event/certificate/${event.SK}`);
  } else {
    Swal.fire("Error", "SK event tidak valid.", "error");
  }
};


const openAddModal = () => {
  eventStore.resetDraftEvent();
  isEditing.value = false;
  selectedEvent.value = null;
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  selectedEvent.value = null;
};

const handleNextStep = () => {
  showFormModal.value = false;
  showMediaModal.value = true;
};

const goBackToStep1 = () => {
  showMediaModal.value = false;  
  showFormModal.value = true;    
};


const closeMediaModal = () => {
  showMediaModal.value = false;
  eventStore.resetDraftEvent();
};

const handleFinalSave = async (finalPayload: any) => {
  try {
    const success = await eventStore.createTiketEvent(finalPayload);
    
    if (success) {
      swalAlert("Berhasil", "Event baru berhasil dibuat!", "success");
      closeMediaModal();
      await eventStore.fetchAdminTiketEvent(); 
    } else {
      swalAlert("Gagal", "Terjadi kesalahan saat menyimpan event ke server.", "error");
    }
  } catch (error) {
    swalAlert("Error", "Gagal menghubungi server.", "error");
  } finally {
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

// LOGIC FILTERING DATA
const processedEvents = computed(() => {
  let data = eventStore.adminTiketEvent || [];

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(e => e.Title?.toLowerCase().includes(q));
  }

  if (filterDate.value) {
    data = data.filter(e => {
      if (!e.Date) return false;
      const eventDates = Object.values(e.Date).map((d: any) => d?.date);
      return eventDates.includes(filterDate.value);
    });
  }

  return data;
});

// LOGIC PAGINATION
const totalFilteredEvents = computed(() => processedEvents.value.length);
const totalPages = computed(() => Math.ceil(totalFilteredEvents.value / itemsPerPage.value) || 1);

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalFilteredEvents.value));

const displayedEvents = computed(() => {
  return processedEvents.value.slice(startIndex.value, endIndex.value);
});

</script>
<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
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
/* Biru untuk Ikhwan */
.badge-ikhwan {
  background-color: rgba(13, 202, 240, 0.1) !important;
  color: #0dcaf0;
  border: 1px solid #0dcaf0;
}

/* Pink untuk Akhwat */
.badge-akhwat {
  background-color: rgba(214, 51, 132, 0.1); 
  color: #d63384;
  border: 1px solid #d63384;
}

/* Ungu untuk Umum */
.badge-umum {
  background-color: rgba(111, 66, 193, 0.1); 
  color: #6f42c1;
  border: 1px solid #6f42c1;
}
</style>