<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">{{ dauroh?.Title || 'Detail Dauroh' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4 mb-3 mb-md-0">
              <img 
                v-if="dauroh?.Picture"
                :src="`${imgBaseUrl}/${dauroh.sk}/${dauroh.Picture}.webp`" 
                alt="Picture Dauroh" 
                class="img-fluid rounded shadow-sm"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div v-else class="Picture-preview-placeholder d-flex flex-column justify-content-center align-items-center text-muted mx-auto">
                <i class="bi bi-image fs-1"></i>
                <span>Picture Dauroh</span>
              </div>
            </div>
            <div class="col-md-8">

              <div v-if="dauroh?.Gender" class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-person-hearts me-2 text-primary"></i>Target Peserta</h6>
                <p class="ps-4 mb-0 text-capitalize">
                  <small>{{ dauroh.Gender }}</small>
                </p>
              </div>
              <div class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-calendar-event me-2 text-primary"></i>Jadwal & Tempat</h6>
                <ul class="list-unstyled ps-4">
                  <li v-for="(day, index) in sortedSchedule" :key="index" class="mb-2">
                    <strong>Hari ke-{{ index + 1 }}</strong>
                    <ul class="list-unstyled ps-3">
                      <li><small><strong>Tanggal:</strong> {{ day.date }}</small></li>
                      <li><small><strong>Waktu:</strong> {{ day.start_time }} - {{ day.end_time }}</small></li>
                    </ul>
                  </li>
                  <li v-if="dauroh?.Place" class="mt-2">
                    <small><strong>Tempat:</strong> {{ dauroh.Place }}</small>
                  </li>
                </ul>
              </div>

              <div class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-ticket-detailed me-2 text-primary"></i>Harga</h6>
                <p class="ps-4 mb-0">
                  <small>Rp{{ dauroh?.Price?.toLocaleString('id-ID') || 'Gratis' }}</small>
                </p>
              </div>

            </div>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-between border-0">
          <button type="button" class="btn btn-secondary" @click="close">Tutup</button>
          <button type="button" class="btn btn-primary" @click="register">Daftar Sekarang</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
// 1. Import `computed`
import { computed, ref } from 'vue' // 1. Import ref
import type { Dauroh, DaurohDayDetail } from '~/stores/dauroh'

// 2. Ambil config runtime
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

const props = defineProps<{
  show: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'register', val: Dauroh | undefined): void
}>()

// 2. Buat computed property untuk mengurutkan jadwal
const sortedSchedule = computed(() => {
  if (!props.dauroh?.Date || typeof props.dauroh.Date !== 'object') {
    return [];
  }
  // Ubah object { day_1: {...}, day_2: {...} } menjadi array [{...}, {...}]
  const scheduleArray = Object.values(props.dauroh.Date) as DaurohDayDetail[];
  
  // Urutkan array berdasarkan tanggal
  return scheduleArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});


const close = () => emit('close')
const register = () => emit('register', props.dauroh)
</script>

<style scoped>
/* 3. style untuk placeholder (opsional) */
.Picture-preview-placeholder {
  width: 100%;
  aspect-ratio: 2 / 3; /* Sesuaikan dengan rasio gambar Anda */
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.5rem;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-body {
  font-size: 0.9rem;
}
.detail-section h6 {
  font-size: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}
.text-capitalize {
  text-transform: capitalize;
}
</style>