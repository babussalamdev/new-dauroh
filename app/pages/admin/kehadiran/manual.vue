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
          <select class="form-select form-select-sm shadow-sm" style="width: 250px; border-color: #198754;" v-model="selectedEventSK" @change="fetchAttendees">
            <option value="" disabled>-- Pilih Event Dahulu --</option>
            <option v-for="event in mockEvents" :key="event.SK" :value="event.SK">{{ event.Title }}</option>
          </select>
        </div>

        <div v-if="selectedEventSK">
          <NuxtLink to="/admin/kehadiran" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center">
            <i class="bi bi-arrow-left me-2"></i> Log Kehadiran
          </NuxtLink>
        </div>

      </div>

      <div class="card-body p-0">
        
        <div v-if="!selectedEventSK" class="text-center py-5 text-muted bg-light">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
          <p class="mb-0 fw-medium">Silakan pilih <strong>Event</strong> terlebih dahulu.</p>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="isLoading" class="my-5" />

          <div v-else-if="attendees.length > 0">
            <div class="p-3 border-bottom d-flex align-items-center bg-light">
              <div class="input-group input-group-sm w-25">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control bg-white border-start-0 ps-0" placeholder="Cari nama peserta..." v-model="searchQuery">
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem;">
                <thead class="table-light text-muted">
                  <tr>
                    <th class="py-3 ps-4" style="width: 5%;">No</th>
                    <th class="py-3" style="width: 30%;">Nama Peserta</th>
                    <th class="py-3" style="width: 25%;">Kode Registrasi</th>
                    <th class="py-3" style="width: 15%;">L/P</th>
                    <th class="py-3 text-center pe-4" style="width: 25%;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in filteredAttendees" :key="item.ticketId">
                    <td class="ps-4 fw-medium text-muted">{{ index + 1 }}</td>
                    <td class="fw-bold text-dark">{{ item.name }}</td>
                    <td><span class="badge bg-light text-dark border font-monospace px-2 py-1">{{ item.ticketId }}</span></td>
                    <td class="text-muted">{{ item.gender === 'l' ? 'Laki-laki' : 'Perempuan' }}</td>
                    
                    <td class="text-center pe-4">
                      <span v-if="item.status === 'hadir'" class="text-success fw-bold small">
                        <i class="bi bi-check2-all me-1"></i> {{ item.scanTime }} WIB
                      </span>
                      <button v-else @click="processManualCheckIn(item)" class="btn btn-primary btn-sm rounded-pill fw-bold px-4 shadow-sm" style="font-size: 0.8rem;">
                        Check In
                      </button>
                    </td>
                  </tr>

                  <tr v-if="filteredAttendees.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted small fst-italic">
                      Nama "{{ searchQuery }}" tidak ditemukan di data peserta.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
              <span class="small text-muted">Menampilkan daftar keseluruhan peserta event.</span>
            </div>

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

definePageMeta({ layout: 'admin' });

const isLoading = ref(false);
const searchQuery = ref('');
const selectedEventSK = ref('');
const attendees = ref<any[]>([]);

// MOCK DATA EVENT
const mockEvents = ref([
  { SK: 'EVT#001', Title: 'Dauroh: Menggapai Kebahagiaan' },
  { SK: 'EVT#002', Title: 'Kajian Rutin Pemuda Hijrah' },
]);

const fetchAttendees = () => {
  if (!selectedEventSK.value) return;
  
  searchQuery.value = '';
  isLoading.value = true;
  attendees.value = [];

  setTimeout(() => {
    if (selectedEventSK.value === 'EVT#001') {
      attendees.value = [
        { name: 'Abdullah Bin Fulan', ticketId: 'PESERTA#101', gender: 'l', status: 'hadir', scanTime: '07:15:00' },
        { name: 'Aisyah Binti Fulan', ticketId: 'PESERTA#102', gender: 'p', status: 'belum', scanTime: null },
        { name: 'Budi Santoso', ticketId: 'PESERTA#103', gender: 'l', status: 'belum', scanTime: null },
      ];
    } else if (selectedEventSK.value === 'EVT#002') {
      attendees.value = [
        { name: 'Joko Anwar', ticketId: 'PESERTA#201', gender: 'l', status: 'belum', scanTime: null },
      ];
    }
    isLoading.value = false;
  }, 500);
};

const filteredAttendees = computed(() => {
  return attendees.value.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// LOGIKA BUAT TOMBOL CHECK-IN MANUAL
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
  }).then((result) => {
    if (result.isConfirmed) {
      //  API checkin
      item.status = 'hadir';
      item.scanTime = dayjs().format('HH:mm:ss');
      Swal.fire('Berhasil!', 'Peserta berhasil diabsen secara manual.', 'success');
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