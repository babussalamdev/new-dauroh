<template>
  <div v-if="show" class="modal fade show d-block backdrop-blur" tabindex="-1" @click.self="triggerShake">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal-width" :class="{ 'modal-shake': isShaking }">
      <div class="modal-content border-0 shadow-lg rounded-4">

        <div class="modal-header border-0 pb-0 pt-4 px-4 align-items-start bg-white rounded-top-4">
          <div class="d-flex flex-column flex-grow-1 me-3">
            <h4 class="txt-title fw-bold text-dark mb-1 lh-base">{{ event?.Title || 'Detail Event' }}</h4>

            <div class="mt-1">
              <span class="txt-subtitle fw-bold text-success">
                {{ event?.Price ? `Rp${event.Price.toLocaleString('id-ID')}` : 'Gratis' }}
              </span>
            </div>
          </div>

          <button type="button" class="btn-close shadow-none bg-light p-2 rounded-circle" @click="close"></button>
        </div>

        <div class="modal-body p-4">
          <div class="row g-3 mb-4">
            
            <div class="col-12">
              <div class="d-flex flex-column p-3 bg-light-subtle rounded-3 border border-light-subtle">
                <span class="text-muted fw-bold text-uppercase txt-label d-block mb-2">Jadwal Event</span>
                <div class="d-flex flex-column gap-2">
                  <div v-for="(day, i) in getDetailedSchedule(event?.Date)" :key="i" class="d-flex justify-content-between align-items-center bg-white p-2 rounded-2 border border-light">
                    <span class="text-secondary txt-caption"><i class="bi bi-calendar-event me-2"></i>{{ day.date }}</span>
                    <span class="text-dark txt-caption fw-bold"><i class="bi bi-clock me-1 text-primary"></i>{{ day.time }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-12">
              <div class="d-flex flex-column p-3 bg-light-subtle rounded-3 border border-light-subtle">
                <span class="text-muted fw-bold text-uppercase txt-label d-block mb-2">Lokasi Event</span>
                <div class="d-flex align-items-center gap-2 bg-white p-2 rounded-2 border border-light">
                  <i class="bi bi-geo-alt-fill text-danger ms-1"></i>
                  <span class="text-dark txt-caption fw-bold">{{ event?.Place || 'Informasi menyusul' }}</span>
                </div>
              </div>
            </div>

            <div v-if="isNonQuota(event)" class="col-12">
              <div class="p-3 bg-light-subtle rounded-3 border border-light-subtle h-100 text-center">
                <span class="text-muted d-block mb-1 txt-caption fw-bold">Sisa Tiket</span>
                <h5 class="mb-0 fw-bold text-success txt-subtitle">
                  <i class="bi bi-infinity me-1"></i> Tanpa Batas
                </h5>
              </div>
            </div>

            <template v-else>
              <div class="col-12">
                <div class="p-3 bg-light-subtle rounded-3 border border-light-subtle d-flex flex-column gap-3">
                  <div v-if="isIkhwanShow">
                    <div class="d-flex justify-content-between align-items-end mb-2">
                      <span class="text-secondary txt-caption fw-bold"><i class="bi bi-people me-1"></i>Sisa Kuota Ikhwan</span>
                      <div>
                        <span class="fw-bold fs-0 text-primary">{{ formatQuota(getRemaining(event?.Quota_Ikhwan, event?.Sold_Ikhwan)) }}</span>
                        <span class="text-secondary txt-caption"> / {{ event?.Quota_Ikhwan }}</span>
                      </div>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div class="progress-bar rounded-pill bg-primary" role="progressbar" :style="`width: ${getPercentage(event?.Sold_Ikhwan, event?.Quota_Ikhwan)}%;`" :aria-valuenow="getPercentage(event?.Sold_Ikhwan, event?.Quota_Ikhwan)" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>

                  <div v-if="isAkhwatShow">
                    <div class="d-flex justify-content-between align-items-end mb-2">
                      <span class="text-secondary txt-caption fw-bold"><i class="bi bi-people me-1"></i>Sisa Kuota Akhwat</span>
                      <div>
                        <span class="fw-bold fs-0 text-danger">{{ formatQuota(getRemaining(event?.Quota_Akhwat, event?.Sold_Akhwat)) }}</span>
                        <span class="text-secondary txt-caption"> / {{ event?.Quota_Akhwat }}</span>
                      </div>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div class="progress-bar rounded-pill bg-danger" role="progressbar" :style="`width: ${getPercentage(event?.Sold_Akhwat, event?.Quota_Akhwat)}%;`" :aria-valuenow="getPercentage(event?.Sold_Akhwat, event?.Quota_Akhwat)" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>

                  <div v-if="showTotal(event) && !isIkhwanShow && !isAkhwatShow">
                    <div class="d-flex justify-content-between align-items-end mb-2">
                      <span class="text-secondary txt-caption text-uppercase fw-bold"><i class="bi bi-people me-1"></i>Umum</span>
                      <div>
                        <span class="fw-bold fs-6 text-primary">{{ formatQuota(getRemaining(event?.Quota_Total, event?.Sold_Total)) }}</span>
                        <span class="text-secondary txt-caption"> / {{ event?.Quota_Total }}</span>
                      </div>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div class="progress-bar rounded-pill bg-primary" role="progressbar" :style="`width: ${getPercentage(event?.Sold_Total, event?.Quota_Total)}%;`" :aria-valuenow="getPercentage(event?.Sold_Total, event?.Quota_Total)" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

          </div>
        </div>
        
        <div class="modal-footer border-top bg-white p-3 rounded-bottom-4">
          <button type="button" class="btn btn-light border text-muted fw-bold px-4 rounded-pill txt-body" @click="close">
            Batal
          </button>

          <button type="button" class="btn fw-bold px-5 rounded-pill shadow-sm hover-up txt-body" :class="buttonState.cssClass"
            :disabled="buttonState.disabled" @click="register">
            {{ buttonState.label }} <i v-if="!buttonState.disabled" class="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import type { Event, EventDayDetail } from '~/types/event'
import { useEventStore } from '~/stores/event'

dayjs.locale('id')

const { isShaking, triggerShake } = useModalShake();
const props = defineProps<{
  show: boolean
  event?: Event
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'register', val: Event | undefined): void
}>()

const eventStore = useEventStore()

// --- KONEKSI GRID LAYOUT ---
const isIkhwanShow = computed(() => showIkhwan(props.event));
const isAkhwatShow = computed(() => showAkhwat(props.event));

// --- [CORE LOGIC] BUTTON STATE ---
const buttonState = computed(() => {
  const item = props.event;
  if (!item) return { label: 'Loading...', disabled: true, cssClass: 'btn-secondary' };

  // 1. Ambil status pendaftaran dari store
  const storeStatus = registrationStatus(item);

  if (item.Status === 'inactive') {
    return { label: 'Non-Aktif', disabled: true, cssClass: 'btn-secondary' };
  }

  const now = dayjs();

  // 2. Cek Tanggal Acara
  if (item.Date) {
    const dates = Object.values(item.Date) as EventDayDetail[];
    if (dates.length > 0) {
      const allDates = dates.map(d => d.date);
      allDates.sort();
      const lastEventDateStr = allDates[allDates.length - 1];
      if (lastEventDateStr) {
        const eventEndTime = dayjs(`${lastEventDateStr}T23:59:59`);
        if (eventEndTime.isValid() && now.isAfter(eventEndTime)) {
          return { label: 'Selesai', disabled: true, cssClass: 'btn-secondary' };
        }
      }
    }
  }

  // 3. Cek Masa Pendaftaran
  const startStr = item.Registration?.start_registration?.replace(' ', 'T');
  const endStr = item.Registration?.end_registration?.replace(' ', 'T');

  if (startStr) {
    const startRegis = dayjs(startStr);
    if (startRegis.isValid() && now.isBefore(startRegis)) {
      return { label: 'Belum Buka', disabled: true, cssClass: 'btn-secondary' };
    }
  }
  if (endStr) {
    const endRegis = dayjs(endStr);
    if (endRegis.isValid() && now.isAfter(endRegis)) {
      return { label: 'Ditutup', disabled: true, cssClass: 'btn-secondary' };
    }
  }

  // 4. Jika store menyatakan tidak bisa daftar (misal Kuota Penuh)
  if (!storeStatus.canRegister && storeStatus.message === 'Kuota Penuh') {
    return { label: 'Habis', disabled: true, cssClass: 'btn-secondary' };
  }

  // 5. Lolos Semua
  return { label: 'Daftar Sekarang', disabled: false, cssClass: 'btn-primary' };
});

// --- LOGIC LAINNYA ---
const close = () => emit('close')
const register = () => {
  if (!buttonState.value.disabled) {
    emit('register', props.event)
  }
};
</script>

<style scoped>
@import url('@/assets/css/components/modals.css');

/* --- MODAL WIDTH & RESPONSIVENESS --- */
.custom-modal-width {
  max-width: 550px;
  width: 95%;
  margin: 1.75rem auto;
}

@media (max-width: 576px) {
  .custom-modal-width {
    width: 90%;
    margin: 4rem auto;
    min-height: auto;
  }

  .modal-dialog-scrollable {
    max-height: calc(100% - 8rem);
  }

  .modal-body {
    padding: 1.25rem !important;
  }

  .modal-header {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
}

/* --- UTILITIES & ANIMATIONS --- */
.bg-light-subtle {
  background-color: #f8f9fa;
}

.hover-up {
  transition: transform 0.2s ease-in-out;
}

.hover-up:hover {
  transform: translateY(-2px);
}

.btn-close {
  opacity: 0.7;
  transition: all 0.2s;
}

.btn-close:hover {
  opacity: 1;
  background-color: #e9ecef;
  transform: rotate(90deg);
}
</style>