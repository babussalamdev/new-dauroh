<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>
        <li class="breadcrumb-item txt-caption text-muted">Presensi</li>
        <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Log Kehadiran</li>
      </ol>
    </nav>
    
    <div class="card content-card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3 px-md-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        
        <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
          <h5 class="mb-0 txt-title fw-bold text-dark text-truncate w-100">Log Kehadiran</h5>
          
          <div v-if="globalStore.activeEventSK" class="text-primary fw-medium txt-caption text-truncate w-100">
            {{ globalStore.activeEvent?.Title }}
          </div>
          <div v-else class="text-muted txt-caption text-truncate w-100">
            Belum Ada Event Terpilih
          </div>
        </div>

        <div class="flex-shrink-0 text-start text-md-end" v-if="globalStore.activeEventSK">
          <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill shadow-sm txt-caption fw-medium">
            Total Hadir: {{ totalItems }} Peserta
          </span>
        </div>

      </div>
    </div>
    <div class="card content-card border-0 shadow-sm rounded-4 mb-4"> 
      
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom" v-if="globalStore.activeEventSK">
        <div class="d-flex flex-column gap-3">
          
          <div class="d-flex flex-wrap gap-2 justify-content-start">
            <NuxtLink to="/admin/scan" class="btn btn-outline-success rounded-pill px-3 py-1 shadow-sm flex-grow-1 flex-sm-grow-0 text-center txt-caption fw-medium">
              Scan QR
            </NuxtLink>
            
            <NuxtLink to="/admin/kehadiran/manual" class="btn btn-outline-success rounded-pill px-3 py-1 shadow-sm flex-grow-1 flex-sm-grow-0 text-center txt-caption fw-medium">
              Absen Manual
            </NuxtLink>

            <button class="btn btn-success rounded-pill px-3 py-1 shadow-sm flex-grow-1 flex-sm-grow-0 txt-caption fw-medium" @click="handleExport" :disabled="isExporting">
              <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
              Export
            </button>
          </div>

          <div class="w-100" style="max-width: 400px;">
            <div class="input-group input-group-sm shadow-sm">
              <span class="input-group-text bg-light border-0 text-muted"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control form-control-sm bg-light border-0 ps-0 txt-body" 
                placeholder="Cari nama atau kode tiket..." 
                v-model="searchQuery"
              >
            </div>
          </div>

        </div>
      </div>
    </div>

  <div class="card-body p-0">
    
    <div v-if="!globalStore.activeEventSK" class="text-center py-5 text-muted bg-light px-3 rounded-bottom-4">
      <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
      <p class="mb-0 fw-medium txt-body">Silakan pilih <strong>Event</strong> terlebih dahulu di halaman Dashboard.</p>
      <NuxtLink to="/admin" class="btn btn-sm btn-primary mt-3 rounded-pill px-4 shadow-sm txt-caption">Ke Dashboard</NuxtLink>
    </div>

    <div v-else>
      <CommonLoadingSpinner v-if="store.loading" class="my-5" />

      <div v-else-if="filteredAttendees.length > 0">
        <div class="table-responsive">
          <table class="table table-hover mb-0" style="min-width: 700px;">
            <thead>
              <tr>
                <th class="text-center ps-4 txt-label" style="width: 3%;">NO</th>
                <th class="txt-label" style="width: 35%;">INFORMASI PESERTA</th>
                <th class="txt-label" style="width: 25%;">KODE TIKET</th>
                <th class="txt-label" style="width: 20%;">WAKTU MASUK</th>
                <th class="text-center pe-4 txt-label" style="width: 15%;">STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedData" :key="item.ticketId">
                <td class="text-center ps-4 fw-medium text-muted txt-body">
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </td>
                <td>
                  <div class="fw-bold text-dark text-capitalize txt-body">{{ item.name }}</div>
                  <div class="text-muted txt-caption">{{ item.gender === 'l' ? 'Ikhwan' : 'Akhwat' }} - {{ item.age }} thn</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border font-monospace px-2 py-1 txt-body">{{ item.ticketId }}</span>
                </td>
                <td>
                  <div v-if="item.scanTime" class="text-dark fw-medium txt-body">
                    <i class="bi bi-clock me-1 text-success"></i> {{ dayjs(item.scanTime).format('HH:mm:ss') }} WIB
                  </div>
                </td>
                <td class="text-center pe-4">
                  <span class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 shadow-sm txt-label">
                    Hadir
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light rounded-bottom-4" v-if="totalPages > 1">
          <span class="text-muted txt-body">
            Halaman {{ currentPage }} dari {{ totalPages }} 
          </span>
          
          <div class="btn-group shadow-sm">
            <button 
              class="btn btn-outline-secondary btn-sm txt-body" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <i class="bi bi-chevron-left"></i> Prev
            </button>
            <button 
              class="btn btn-outline-secondary btn-sm txt-body" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              <i class="bi bi-chevron-right"></i> Next
            </button>
          </div>
        </div>

      </div>

      <div v-else class="text-center py-5 px-3">
        <i v-if="searchQuery" class="bi bi-search fs-1 text-muted opacity-50 d-block mb-3"></i>
        <i v-else class="bi bi-inbox fs-1 text-muted opacity-50 d-block mb-3"></i>
        
        <h6 class="mb-1 txt-subtitle">{{ searchQuery ? 'Data Tidak Ditemukan' : 'Belum Ada Peserta Masuk' }}</h6>
        <p class="text-muted txt-body">
          {{ searchQuery ? `Tidak ada peserta hadir yang cocok dengan "${searchQuery}"` : 'Belum ada data peserta yang melakukan Check-in pada event ini.' }}
        </p>
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
import { useGlobalEventStore } from '~/stores/globalEvent'; 
import { usePagination } from '~/composables/usePagination';

useHead({ title: 'Presensi Peserta' });

definePageMeta({ layout: 'admin' });

const store = useAttendanceStore();
const globalStore = useGlobalEventStore();
const { alert: swalAlert } = useAlert();

const isExporting = ref(false);
const searchQuery = ref('');

// 🟢 3. UBAH INIT HALAMAN: Tembak API kalau SK udah ada di Global Store
await useAsyncData('attendance-init', async () => {
  if (globalStore.activeEventSK) {
    await store.fetchAttendanceData('present'); 
  } else {
    store.participants = []; // Kosongin kalau admin blm milih event di dashboard
  }
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

const handleExport = () => {
  if (!store.participants || store.participants.length === 0) {
    swalAlert('Data Kosong', 'Tidak ada data kehadiran untuk di-export.', 'warning');
    return;
  }

  isExporting.value = true;

  try {
    const headers = ['No', 'Nama Peserta', 'Kode Tiket', 'Gender', 'Umur', 'Waktu Masuk', 'Status'];
    const rows = store.participants.map((p, index) => {
      return [
        index + 1,
        `"${p.name}"`, 
        p.ticketId,
        p.gender === 'l' ? 'Ikhwan' : 'Akhwat',
        p.age,
        p.scanTime || 'Belum Absen',
        p.status.toUpperCase()
      ];
    });

    const csvContent = [
      headers.join(','),                  
      ...rows.map(row => row.join(','))   
    ].join('\n');                         

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a'); 
    const fileName = `Log_Kehadiran_${globalStore.activeEventSK}_${dayjs().format('YYYYMMDD_HHmm')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link); 
    swalAlert('Berhasil', 'File CSV berhasil didownload!', 'success');

  } catch (error) {
    console.error("Export Error:", error);
    swalAlert('Gagal Export', 'Terjadi kesalahan saat memproses data.', 'error');
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
.input-group-text, .form-control {
  padding: 0.5rem 1rem;
}
.form-control:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
</style>