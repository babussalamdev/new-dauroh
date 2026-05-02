<template>
  <div class="container-fluid px-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none txt-caption text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item txt-caption text-muted">Presensi</li>
        <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Absen Manual</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
  
  <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
    <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
      <h5 class="mb-0 txt-title fw-bold text-dark text-truncate w-100">Absen Manual</h5>
      
      <div v-if="globalStore.activeEventSK" class="text-primary fw-medium txt-caption text-truncate w-100">
        {{ globalStore.activeEvent?.Title }}
      </div>
      <div v-else class="text-muted txt-caption text-truncate w-100">
        Belum Ada Event Terpilih
      </div>
    </div>
  </div>

  <div class="d-flex flex-shrink-0 flex-wrap" v-if="globalStore.activeEventSK">
    <NuxtLink to="/admin/kehadiran" class="btn btn-outline-secondary rounded-pill px-3 py-1 shadow-sm txt-caption fw-medium">
      Log Kehadiran
    </NuxtLink>
  </div>

</div>

      <div class="card-body p-0">
        
        <div v-if="!globalStore.activeEventSK" class="text-center py-5 text-muted bg-light">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
          <p class="mb-0 fw-medium txt-body">Silakan pilih <strong>Event</strong> terlebih dahulu di halaman Dashboard.</p>
          <NuxtLink to="/admin" class="btn btn-sm btn-primary mt-3 rounded-pill px-4 shadow-sm">Ke Dashboard</NuxtLink>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="store.loading" class="my-5" />

          <div v-else-if="filteredAttendees.length > 0">
            <div class="p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center bg-light gap-3">
              <div class="input-group input-group-sm w-100 shadow-sm" style="max-width: 300px;">
                <span class="input-group-text bg-white border-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control bg-white border-0 ps-0 txt-body" placeholder="Cari nama peserta..." v-model="searchQuery">
              </div>
              <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill shadow-sm txt-label">
                Belum Hadir: {{ totalItems }}
              </span>
            </div>

            <div class="table-responsive">
              <table class="table table-hover mb-0" style="min-width: 700px;">
                <thead>
                  <tr>
                    <th class="ps-4 txt-label" style="width: 5%;">NO</th>
                    <th class="txt-label" style="width: 30%;">NAMA PESERTA</th>
                    <th class="txt-label" style="width: 25%;">KODE TIKET</th>
                    <th class="txt-label" style="width: 15%;">L/P</th>
                    <th class="text-center pe-4 txt-label" style="width: 25%;">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedData" :key="item.ticketId">
                    <td class="ps-4 fw-medium text-muted txt-body">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                    <td class="fw-bold text-dark text-capitalize txt-body">{{ item.name }}</td>
                    <td><span class="badge bg-light text-dark border font-monospace px-2 py-1 txt-body">{{ item.ticketId }}</span></td>
                    <td class="text-muted txt-body">{{ item.gender === 'l' ? 'Ikhwan' : 'Akhwat' }}</td>
                    
                    <td class="text-center pe-4">
                      <span v-if="item.status === 'hadir'" class="text-success fw-bold txt-body">
                        <i class="bi bi-check2-all me-1"></i> {{ item.scanTime }} WIB
                      </span>
                      <button v-else @click="processManualCheckIn(item)" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 shadow-none txt-caption fw-bold" :disabled="isProcessing">
                        <i class="bi bi-check-circle me-1"></i> Check In
                      </button>
                    </td>
                  </tr>

                  <tr v-if="paginatedData.length === 0">
                    <td colspan="5" class="text-center py-5 text-muted fst-italic txt-body">
                      <i class="bi bi-search fs-3 d-block mb-2 opacity-50"></i>
                      Nama "{{ searchQuery }}" tidak ditemukan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light" v-if="totalPages > 1">
              <span class="text-muted txt-body">
                Halaman {{ currentPage }} dari {{ totalPages }} 
              </span>
              <div class="btn-group shadow-sm">
                <button class="btn btn-outline-secondary btn-sm txt-body" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i> Prev
                </button>
                <button class="btn btn-outline-secondary btn-sm txt-body" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                  <i class="bi bi-chevron-right"></i> Next
                </button>
              </div>
            </div>

          </div>
          
          <div v-else class="text-center py-5 px-3">
            <i class="bi bi-emoji-sunglasses fs-1 text-success mb-3 d-block opacity-75"></i>
            <h6 class="mb-1 text-dark txt-subtitle">Semua Peserta Telah Hadir!</h6>
            <p class="text-muted txt-body">Tidak ada lagi daftar tunggu / peserta yang belum absen.</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAlert } from '~/utils/swal';
import { useAttendanceStore } from '~/stores/attendance';
import { useGlobalEventStore } from '~/stores/globalEvent'; 
import { usePagination } from '~/composables/usePagination';

definePageMeta({ layout: 'admin' });

const store = useAttendanceStore();
const globalStore = useGlobalEventStore();
const { alert: swalAlert, confirm: swalConfirm } = useAlert();
const searchQuery = ref('');
const isProcessing = ref(false);

await useAsyncData('attendance-manual-init', async () => {
  if (globalStore.activeEventSK) {
    await store.fetchAttendanceData('not-present');
  } else {
    store.participants = [];
  }
  return true;
});


const filteredAttendees = computed(() => {
  if (!store.participants) return [];
  return store.participants.filter(item => {
    if (item.status !== 'belum') return false;
    return item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           item.ticketId.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const { perPage, currentPage, totalPages, totalItems, paginatedData, changePage } = usePagination(filteredAttendees, 10);

const processManualCheckIn = (item: any) => {
  swalConfirm(
    'Check-In Manual?',
    `Konfirmasi kehadiran untuk ${item.name}`,
    'Ya, Hadirkan!'
  ).then(async (result) => {
    if (result.isConfirmed) {
      isProcessing.value = true;
      
      try {
        const response = await store.markManualAttendance(item.pk, item.ticketId);

        if (response.success) {
          swalAlert('Berhasil', `${item.name} berhasil diabsen!`, 'success');
        } else {
          swalAlert('Gagal!', response.message ?? 'Gagal memproses absen', 'error');
        }

      } catch (error: any) {
        swalAlert('Error', 'Terjadi kesalahan sistem.', 'error');
      } finally {
        isProcessing.value = false;
      }
    }
  });
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
.table> :not(caption)>*>* { border-bottom-width: 1px; }
.form-control:focus, .form-select:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
</style>