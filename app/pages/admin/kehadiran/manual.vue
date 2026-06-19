<template>
  <div>
    
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Presensi'}, {text: 'Absen Manual'}]" />

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
                    <th class="txt-label" style="width: 45%;">INFORMASI PESERTA</th>
                    <template v-if="displayDays.length <= 1">
                      <th class="text-center pe-4 txt-label" style="width: 25%;">KEHADIRAN</th>
                    </template>
                    <template v-else>
                      <th v-for="day in displayDays" :key="'th-'+day" class="text-center txt-label" style="width: 15%;">HARI KE-{{ day }}</th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedData" :key="item.ticketId">
                    <td class="ps-4 fw-medium text-muted txt-body">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                    <td class="align-middle">
                      <div class="fw-bold text-dark text-capitalize txt-body">{{ item.name }}</div>
                      <div class="text-muted txt-caption">{{ item.gender === 'l' ? 'Ikhwan' : 'Akhwat' }} - {{ item.age }} thn</div>
                    </td>
                    
                    <template v-if="displayDays.length <= 1">
                      <td class="text-center pe-4 align-middle">
                        <button v-if="!(item.scanTime && (item.scanTime as any)['1'])" @click="processManualCheckIn(item, '1')" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 shadow-none txt-caption fw-bold">
                          <i class="bi bi-check-lg me-1"></i> Check In
                        </button>
                        <div v-else class="text-success fw-bold">
                          <i class="bi bi-check-lg fs-4"></i>
                        </div>
                      </td>
                    </template>
                    <template v-else>
                      <td v-for="day in displayDays" :key="'td-'+day" class="text-center align-middle">
                        <div v-if="item.scanTime && (item.scanTime as any)[day]" class="text-success fw-bold">
                          <i class="bi bi-check-lg fs-4"></i>
                        </div>
                        <button v-else @click="processManualCheckIn(item, day)" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 shadow-none txt-caption fw-bold">
                          Check In
                        </button>
                      </td>
                    </template>
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
useHead({ title: 'Kehadiran Manual' });
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import { useAlert } from '~/utils/swal';
import { useAttendanceStore } from '~/stores/attendance';
import { useGlobalEventStore } from '~/stores/globalEvent'; 
import { usePagination } from '~/composables/usePagination';

definePageMeta({ layout: 'admin' });

const store = useAttendanceStore();
const globalStore = useGlobalEventStore();
const { alert: swalAlert, confirm: swalConfirm, loading: swalLoading } = useAlert();
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
    // Cek apakah semua hari sudah di-absen
    const allDaysCheckedIn = displayDays.value.length > 0 && 
                             displayDays.value.every(day => item.scanTime && (item.scanTime as any)[day]);
    if (allDaysCheckedIn) return false;

    return item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           item.ticketId.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// Infer hari dari data peserta kalau BE belum ngasih Date object di list-event
const displayDays = computed(() => {
  if (globalStore.activeEventDays.length > 1) {
    return globalStore.activeEventDays;
  }
  
  // Deteksi otomatis dari keys scanTime peserta
  let maxDays = 1;
  store.participants.forEach(p => {
    if (p.scanTime && typeof p.scanTime === 'object') {
      const keys = Object.keys(p.scanTime).map(Number).filter(n => !isNaN(n));
      if (keys.length > 0) {
        maxDays = Math.max(maxDays, ...keys);
      }
    }
  });

  if (maxDays > 1) {
    return Array.from({ length: maxDays }, (_, i) => String(i + 1));
  }

  return ['1'];
});

const { perPage, currentPage, totalPages, totalItems, paginatedData, changePage } = usePagination(filteredAttendees, 10);

const processManualCheckIn = async (item: any, day: string) => {
  const label = globalStore.activeEventDays.length > 1 ? `Hari Ke-${day}` : 'Kehadiran';
  
  const result = await swalConfirm(
    `Check In Manual (${label})`,
    `Apakah Anda yakin ingin melakukan check in manual untuk peserta ${item.name}?`,
    'Ya, Check In'
  );

  if (result.isConfirmed) {
    swalLoading('Memproses Check In...', 'Mohon tunggu sebentar');
    try {
      // Panggil API dengan parameter hari secara langsung
      const res = await store.markManualAttendance(item.pk, item.ticketId, day);
      
      if (res.success) {
        swalAlert('Berhasil', `Peserta berhasil check-in manual untuk ${label}.`, 'success');
        if (!item.scanTime) item.scanTime = {};
        item.scanTime[day] = new Date().toISOString(); // Local update
        item.status = 'hadir'; // Status is mainly symbolic now
      } else {
        swalAlert('Gagal', res.message || 'Terjadi kesalahan saat check-in.', 'error');
      }
    } catch (error) {
      swalAlert('Gagal', 'Gagal melakukan check-in manual. Silakan coba lagi.', 'error');
    }
  }
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