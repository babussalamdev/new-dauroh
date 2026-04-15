<template>
  <div class="container-fluid px-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink>
        </li>
        <li class="breadcrumb-item text-muted">Presensi</li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Absen Manual</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      
      <div class="card-header d-flex justify-content-between align-items-center bg-white py-3 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <h5 class="mb-0 text-nowrap fw-bold">Absen Manual</h5>
          
          <select class="form-select form-select-sm shadow-sm" style="width: 250px; border-color: #198754;" 
                  v-model="store.selectedEventSK" @change="store.fetchAttendanceData('not-present')">
            <option value="" disabled>-- Pilih Event Dahulu --</option>
            <option v-for="event in store.events" :key="event.SK!" :value="event.SK">
              {{ event.Title }}
            </option>
          </select>
        </div>

        <div v-if="store.selectedEventSK">
          <NuxtLink to="/admin/kehadiran" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center">
            <i class="bi bi-arrow-left me-2"></i> Log Kehadiran
          </NuxtLink>
        </div>
      </div>

      <div class="card-body p-0">
        
        <div v-if="!store.selectedEventSK" class="text-center py-5 text-muted bg-light">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
          <p class="mb-0 fw-medium">Silakan pilih <strong>Event</strong> terlebih dahulu.</p>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="store.loading" class="my-5" />

          <div v-else-if="filteredAttendees.length > 0">
            <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <div class="input-group input-group-sm w-100" style="max-width: 300px;">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control bg-white border-start-0 ps-0" placeholder="Cari nama peserta..." v-model="searchQuery">
              </div>
              <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill shadow-sm">
                Belum Hadir: {{ totalItems }}
              </span>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem;">
                <thead class="table-light text-muted">
                  <tr>
                    <th class="py-3 ps-4" style="width: 5%;">No</th>
                    <th class="py-3" style="width: 30%;">Nama Peserta</th>
                    <th class="py-3" style="width: 25%;">Kode Tiket</th>
                    <th class="py-3" style="width: 15%;">L/P</th>
                    <th class="py-3 text-center pe-4" style="width: 25%;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedData" :key="item.ticketId">
                    <td class="ps-4 fw-medium text-muted">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                    <td class="fw-bold text-dark text-capitalize">{{ item.name }}</td>
                    <td><span class="badge bg-light text-dark border font-monospace px-2 py-1">{{ item.ticketId }}</span></td>
                    <td class="text-muted">{{ item.gender === 'l' ? 'Ikhwan' : 'Akhwat' }}</td>
                    
                    <td class="text-center pe-4">
                      <span v-if="item.status === 'hadir'" class="text-success fw-bold small">
                        <i class="bi bi-check2-all me-1"></i> {{ item.scanTime }} WIB
                      </span>
                      <button v-else @click="processManualCheckIn(item)" class="btn btn-primary btn-sm rounded-pill fw-bold px-4 shadow-sm" :disabled="isProcessing" style="font-size: 0.8rem;">
                        <i class="bi bi-check-circle me-1"></i> Check In
                      </button>
                    </td>
                  </tr>

                  <tr v-if="paginatedData.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted small fst-italic">
                      Nama "{{ searchQuery }}" tidak ditemukan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light" v-if="totalPages > 1">
              <span class="small text-muted">
                Halaman {{ currentPage }} dari {{ totalPages }} 
              </span>
              <div class="btn-group shadow-sm">
                <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i> Prev
                </button>
                <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                  Next <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>

          </div>
          
          <div v-else class="text-center py-5 px-3">
            <i class="bi bi-emoji-sunglasses fs-1 text-success mb-2 d-block"></i>
            <h6 class="mt-2 mb-1 text-dark fw-bold">Semua Peserta Telah Hadir!</h6>
            <p class="text-muted small">Tidak ada lagi daftar tunggu / peserta yang belum absen.</p>
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
import { useNuxtApp } from '#app';
import { useAttendanceStore } from '~/stores/attendance';
import { usePagination } from '~/composables/usePagination';

definePageMeta({ layout: 'admin' });

const { $apiBase } = useNuxtApp() as any;
const store = useAttendanceStore();
const searchQuery = ref('');
const isProcessing = ref(false);

// INIT HALAMAN
await useAsyncData('attendance-manual-init', async () => {
  await store.fetchEvents();
  store.selectedEventSK = '';
  store.participants = [];
  return true;
});

// FILTER SEARCH (Cari yang 'belum' hadir aja)
const filteredAttendees = computed(() => {
  if (!store.participants) return [];
  return store.participants.filter(item => {
    if (item.status !== 'belum') return false;
    return item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           item.ticketId.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const { perPage, currentPage, totalPages, totalItems, paginatedData, changePage } = usePagination(filteredAttendees, 10);

// 🟢 4. LOGIKA TOMBOL CHECK-IN API REAL
const processManualCheckIn = (item: any) => {
  Swal.fire({
    title: 'Check-In Manual?',
    text: `Konfirmasi kehadiran untuk ${item.name}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hadirkan!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      isProcessing.value = true;
      try {
        // Tembak API yang sama persis kayak Scanner
        await $apiBase.put('/update-attendance?type=scan', {
          PK: item.pk,
          SK: item.ticketId
        });

        // Ubah UI otomatis jadi sukses tanpa reload
        item.status = 'hadir';
        item.scanTime = dayjs().format('HH:mm:ss');
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: `${item.name} berhasil diabsen!`,
          timer: 1500,
          showConfirmButton: false
        });

      } catch (error: any) {
        Swal.fire('Gagal!', error.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
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