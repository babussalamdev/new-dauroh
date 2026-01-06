<template>
  <div v-if="show" class="modal fade show d-block backdrop-blur" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal-width">
      <div class="modal-content border-0 shadow-lg rounded-4">
        
        <div class="modal-header border-0 pb-0 pt-4 px-4 align-items-start bg-white rounded-top-4">
          <div class="d-flex flex-column flex-grow-1 me-3">
             <h4 class="fw-bold text-dark mb-1 lh-base">{{ dauroh?.Title || 'Detail Dauroh' }}</h4>
             
             <div class="mt-1">
               <span class="fs-5 fw-bold text-success">
                 {{ dauroh?.Price ? `Rp${dauroh.Price.toLocaleString('id-ID')}` : 'Gratis' }}
               </span>
             </div>
          </div>
          
          <button type="button" class="btn-close bg-light p-2 rounded-circle" @click="close"></button>
        </div>

        <div class="modal-body p-4">
          
          <div class="row g-3 mb-4">
            <div class="col-12">
              <div class="d-flex align-items-center gap-3 p-3 bg-light-subtle rounded-3 border border-light-subtle">
                <div class="bg-white p-2 rounded-circle shadow-sm text-danger d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                   <i class="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                  <small class="text-muted fw-bold text-uppercase ls-1 d-block" style="font-size: 0.7rem;">Lokasi Dauroh</small>
                  <span class="fw-medium text-dark">{{ dauroh?.Place || 'Informasi menyusul' }}</span>
                </div>
              </div>
            </div>

            <div v-if="showIkhwan" :class="gridColClass">
               <div class="p-3 bg-light-subtle rounded-3 border border-light-subtle h-100 text-center">
                 <small class="text-muted d-block mb-1">Kuota Ikhwan</small>
                 <h5 class="mb-0 fw-bold" :class="getQuotaColor(dauroh?.Quota_Ikhwan)">
                   {{ formatQuota(dauroh?.Quota_Ikhwan) }}
                 </h5>
               </div>
            </div>
            
            <div v-if="showAkhwat" :class="gridColClass">
               <div class="p-3 bg-light-subtle rounded-3 border border-light-subtle h-100 text-center">
                 <small class="text-muted d-block mb-1">Kuota Akhwat</small>
                 <h5 class="mb-0 fw-bold" :class="getQuotaColor(dauroh?.Quota_Akhwat)">
                   {{ formatQuota(dauroh?.Quota_Akhwat) }}
                 </h5>
               </div>
            </div>
          </div>

          <div class="mb-2">
            <h6 class="fw-bold mb-3 d-flex align-items-center text-dark">
              <i class="bi bi-calendar2-week text-primary me-2"></i> Timeline Acara
            </h6>
            
            <div class="timeline-wrapper ps-2">
              <div v-for="(day, index) in sortedSchedule" :key="index" class="timeline-item position-relative pb-4 ps-4">
                <div class="timeline-dot bg-white border border-4 border-primary rounded-circle position-absolute top-0 start-0"></div>
                <div class="card border-0 shadow-sm bg-light-subtle">
                  <div class="card-body p-3 py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <span class="fw-bold text-dark d-block" style="font-size: 0.95rem;">Hari ke-{{ index + 1 }}</span>
                      <small class="text-muted" style="font-size: 0.85rem;">{{ formatDate(day.date) }}</small>
                    </div>
                    <div class="d-flex align-items-center px-3 py-1 bg-white border rounded-pill">
                      <i class="bi bi-clock me-2 text-dark" style="font-size: 0.8rem;"></i>
                      <span class="fw-bold text-dark font-monospace" style="font-size: 0.9rem;">
                         {{ day.start_time }} - {{ day.end_time }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer border-top bg-white p-3">
          <button type="button" class="btn btn-light text-muted fw-medium px-4 rounded-pill" @click="close">
            Batal
          </button>
          
          <button 
            type="button" 
            class="btn fw-bold px-5 rounded-pill shadow-sm hover-up"
            :class="buttonState.cssClass"
            :disabled="buttonState.disabled"
            @click="register"
          >
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
import type { Dauroh, DaurohDayDetail } from '~/stores/dauroh'

dayjs.locale('id') 

const props = defineProps<{
  show: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'register', val: Dauroh | undefined): void
}>()

// --- LOGIC DISPLAY GENDER ---
const showIkhwan = computed(() => {
  if (!props.dauroh) return false
  const g = props.dauroh.Gender?.toLowerCase() || ''
  return g.includes('ikhwan') || g.includes('laki') || g.includes('umum') || g === ''
})

const showAkhwat = computed(() => {
  if (!props.dauroh) return false
  const g = props.dauroh.Gender?.toLowerCase() || ''
  return g.includes('akhwat') || g.includes('perempuan') || g.includes('wanita') || g.includes('umum') || g === ''
})

const gridColClass = computed(() => {
  return (showIkhwan.value && showAkhwat.value) ? 'col-6' : 'col-12'
})
const buttonState = computed(() => {
  const item = props.dauroh;
  if (!item) return { label: 'Loading...', disabled: true, cssClass: 'btn-secondary' };

  // 1. Cek Active
  if (item.IsActive === false) {
    return { label: 'Non-Aktif', disabled: true, cssClass: 'btn-secondary' };
  }

  const now = dayjs();
  if (item.Date) {
     // Cast ke tipe DaurohDayDetail agar TS paham struktur datanya
     const dates = Object.values(item.Date) as DaurohDayDetail[];
     
     if (dates.length > 0) {
       // Ambil semua tanggal dalam bentuk string array
       const allDates = dates.map(d => d.date);
       
       // Sort array string (YYYY-MM-DD aman disort secara leksikal)
       // Tanggal paling akhir akan berada di index terakhir
       allDates.sort();
       
       const lastEventDateStr = allDates[allDates.length - 1]; // Ambil yang paling akhir

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

  // 4. Cek Kuota
  let relevantQuota: any = 'non-quota';
  const gender = (item.Gender || '').toLowerCase().trim();

  if (gender.includes('ikhwan') && gender.includes('akhwat')) relevantQuota = item.Quota_Total;
  else if (gender.includes('akhwat')) relevantQuota = item.Quota_Akhwat;
  else if (gender.includes('ikhwan')) relevantQuota = item.Quota_Ikhwan;
  else relevantQuota = item.Quota_Total;

  if (relevantQuota !== 'non-quota' && Number(relevantQuota) <= 0) {
    return { label: 'Habis', disabled: true, cssClass: 'btn-secondary' };
  }

  // 5. Lolos Semua
  return { label: 'Daftar Sekarang', disabled: false, cssClass: 'btn-primary' };
});

// --- LOGIC LAINNYA ---
const sortedSchedule = computed(() => {
  if (!props.dauroh?.Date || typeof props.dauroh.Date !== 'object') {
    return [];
  }
  const scheduleArray = Object.values(props.dauroh.Date) as DaurohDayDetail[];
  return scheduleArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('dddd, D MMMM YYYY');
}

const formatQuota = (val: number | 'non-quota' | undefined) => {
  if (val === 'non-quota') return '∞';
  if (val === 0) return '0';
  return `${val}`;
};

const getQuotaColor = (val: number | 'non-quota' | undefined) => {
  if (val === 'non-quota') return 'text-success';
  if (val === 0) return 'text-danger';
  if (typeof val === 'number' && val < 10) return 'text-warning'; 
  return 'text-primary';
};

const close = () => emit('close')
const register = () => {
  if (!buttonState.value.disabled) {
    emit('register', props.dauroh)
  }
}
</script>

<style scoped>
/* --- MODAL WIDTH & RESPONSIVENESS --- */
.custom-modal-width {
  max-width: 550px;
  width: 95%; /* Default lebar */
  margin: 1.75rem auto; /* Default margin desktop */
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

/* --- UTILITIES --- */
.timeline-wrapper {
  border-left: 2px solid #e9ecef;
}
.timeline-item:last-child {
  padding-bottom: 0 !important;
}
.timeline-dot {
  width: 14px;
  height: 14px;
  left: -8px; 
  top: 4px;
  z-index: 2;
  box-shadow: 0 0 0 2px #fff; 
}
.bg-light-subtle {
  background-color: #f8f9fa;
}
.ls-1 {
  letter-spacing: 0.5px;
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