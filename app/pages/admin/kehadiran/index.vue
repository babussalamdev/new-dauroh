<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink>
        </li>
        <li class="breadcrumb-item text-muted">Presensi</li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Log Kehadiran</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      
      <div class="card-header d-flex flex-column flex-xl-row justify-content-between align-items-xl-center bg-white py-3 border-bottom gap-3">
        <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3 w-100">
          <h5 class="mb-0 text-nowrap fw-bold">Log Kehadiran</h5>
          
          <select class="form-select form-select-sm shadow-sm w-100" style="max-width: 350px; border-color: #198754;"
            v-model="store.selectedEventSK" @change="store.fetchAttendanceData()">
            <option value="" disabled>-- Pilih Event Dahulu --</option>
            <option v-for="event in store.events" :key="event.SK!" :value="event.SK">
              {{ event.Title }}
            </option>
          </select>
        </div>

        <div class="d-flex flex-wrap gap-2 w-100 justify-content-sm-start justify-content-xl-end" v-if="store.selectedEventSK">
          <NuxtLink to="/admin/scan" class="btn btn-outline-success btn-sm px-3 rounded-pill fw-bold d-flex align-items-center shadow-sm flex-grow-1 flex-md-grow-0 justify-content-center">
            <i class="bi bi-qr-code-scan me-2"></i> Scan QR
          </NuxtLink>
          
          <NuxtLink to="/admin/kehadiran/manual" class="btn btn-outline-success btn-sm px-3 rounded-pill fw-bold d-flex align-items-center shadow-sm flex-grow-1 flex-md-grow-0 justify-content-center">
            <i class="bi bi-journal-text me-2"></i> Absen Manual
          </NuxtLink>

          <button class="btn btn-success btn-sm px-3 rounded-pill fw-bold shadow-sm flex-grow-1 flex-md-grow-0" @click="handleExport" :disabled="isExporting">
            <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-file-earmark-excel-fill me-1"></i>
            Export
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        
        <div v-if="!store.selectedEventSK" class="text-center py-5 text-muted bg-light px-3">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
          <p class="mb-0 fw-medium">Silakan pilih <strong>Event</strong> terlebih dahulu.</p>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="store.loading" class="my-5" />

          <div v-else-if="filteredAttendees.length > 0">
            
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 border-bottom bg-light gap-3">
              <div class="input-group input-group-sm w-100" style="max-width: 400px;">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control bg-white border-start-0 ps-0" 
                  placeholder="Cari nama atau tiket..." 
                  v-model="searchQuery"
                >
              </div>
              <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill shadow-sm align-self-start align-self-md-center">
                Total Hadir: {{ totalItems }}
              </span>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem; min-width: 700px;">
                <thead class="table-light text-muted">
                  <tr>
                    <th class="py-3 ps-4" style="width: 5%;">No</th>
                    <th class="py-3" style="width: 35%;">Informasi Peserta</th>
                    <th class="py-3" style="width: 25%;">Kode Tiket</th>
                    <th class="py-3" style="width: 20%;">Waktu Masuk</th>
                    <th class="py-3 text-center pe-4" style="width: 15%;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedData" :key="item.ticketId">
                    
                    <td class="ps-4 fw-medium text-muted">
                      {{ (currentPage - 1) * perPage + index + 1 }}
                    </td>
                    
                    <td>
                      <div class="fw-bold text-dark text-capitalize">{{ item.name }}</div>
                      <div class="small text-muted">{{ item.gender === 'l' ? 'Ikhwan' : 'Akhwat' }} - {{ item.age }} thn</div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border font-monospace px-2 py-1">{{ item.ticketId }}</span>
                    </td>
                    <td>
                      <div v-if="item.scanTime" class="text-dark fw-medium">
                        <i class="bi bi-clock me-1 text-success"></i> {{ dayjs(item.scanTime).format('HH:mm:ss') }} WIB
                      </div>
                    </td>
                    <td class="text-center pe-4">
                      <span class="badge bg-success px-3 py-1 rounded-pill">Hadir</span>
                    </td>
                  </tr>
                  
                  <tr v-if="paginatedData.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted small fst-italic">
                      Tidak ada peserta hadir yang cocok dengan pencarian "{{ searchQuery }}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light" v-if="totalPages > 1">
              <span class="small text-muted">
                Halaman {{ currentPage }} dari {{ totalPages }} 
                (Total: {{ totalItems }} Hadir)
              </span>
              
              <div class="btn-group shadow-sm">
                <button 
                  class="btn btn-outline-secondary btn-sm" 
                  :disabled="currentPage === 1"
                  @click="changePage(currentPage - 1)"
                >
                  <i class="bi bi-chevron-left"></i> Prev
                </button>
                <button 
                  class="btn btn-outline-secondary btn-sm" 
                  :disabled="currentPage === totalPages"
                  @click="changePage(currentPage + 1)"
                >
                  Next <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>

          </div>

          <div v-else class="text-center py-5 px-3">
            <i class="bi bi-inbox fs-3 text-muted"></i>
            <h6 class="mt-2 mb-1">Belum Ada Peserta Masuk</h6>
            <p class="text-muted small">Belum ada data peserta yang melakukan Check-in pada event ini.</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { useAttendanceStore } from '~/stores/attendance';
import { usePagination } from '~/composables/usePagination';

definePageMeta({ layout: 'admin' });

const store = useAttendanceStore();

const isExporting = ref(false);
const searchQuery = ref('');

await useAsyncData('attendance-init', async () => {
  await store.fetchEvents();
  store.selectedEventSK = ''; 
  store.participants = [];    
  return true;
});

const filteredAttendees = computed(() => {
  if (!store.participants) return [];
  
  return store.participants.filter((item) => {
    if (item.status !== 'hadir') return false;

    const matchSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        item.ticketId.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    return matchSearch;
  });
});


const { 
  perPage, 
  currentPage, 
  totalPages, 
  totalItems, 
  paginatedData, 
  changePage 
} = usePagination(filteredAttendees, 10);
// Angka 10 di belakang = Jumlah row per halaman (bisa di ganti 5, 20, dll)

const handleExport = () => {
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'File log kehadiran berhasil didownload (Simulasi)',
      timer: 2000,
      showConfirmButton: false
    });
  }, 1500);
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

.table> :not(caption)>*>* {
  border-bottom-width: 1px;
}
.input-group-text, .form-control {
  padding: 0.5rem 1rem;
}
.form-control:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
</style>