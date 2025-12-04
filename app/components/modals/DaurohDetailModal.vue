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
                :src="`${imgBaseUrl}/${dauroh.SK}/${dauroh.Picture}.webp`" 
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
                <h6 class="fw-bold"><i class="bi bi-people-fill me-2 text-primary"></i>Sisa Kuota</h6>
                <ul class="list-unstyled ps-4 mb-0">
                  <li v-if="showIkhwan" class="mb-1">
                    <small>
                      <strong>Ikhwan: </strong> 
                      <span :class="getQuotaColor(dauroh?.Quota_Ikhwan)">
                        {{ formatQuota(dauroh?.Quota_Ikhwan) }}
                      </span>
                    </small>
                  </li>
                  <li v-if="showAkhwat">
                    <small>
                      <strong>Akhwat:</strong> 
                      <span :class="getQuotaColor(dauroh?.Quota_Akhwat)">
                        {{ formatQuota(dauroh?.Quota_Akhwat) }}
                      </span>
                    </small>
                  </li>
                </ul>
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
import { computed, ref } from 'vue'
import type { Dauroh, DaurohDayDetail } from '~/stores/dauroh'

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

const sortedSchedule = computed(() => {
  if (!props.dauroh?.Date || typeof props.dauroh.Date !== 'object') {
    return [];
  }
  const scheduleArray = Object.values(props.dauroh.Date) as DaurohDayDetail[];
  return scheduleArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

// Helpers untuk Logika Tampilan Kuota
const showIkhwan = computed(() => {
  if (!props.dauroh) return false;
  const g = props.dauroh.Gender?.toLowerCase() || '';
  return g.includes('ikhwan') || g.includes('ikhwan, akhwat');
});

const showAkhwat = computed(() => {
  if (!props.dauroh) return false;
  const g = props.dauroh.Gender?.toLowerCase() || '';
  return g.includes('akhwat') || g.includes('ikhwan, akhwat');
});

const formatQuota = (val: number | 'non-quota' | undefined) => {
  if (val === 'non-quota') return 'Tanpa Batas';
  if (val === 0) return 'Habis';
  return `${val} Tiket Tersedia`;
};

const getQuotaColor = (val: number | 'non-quota' | undefined) => {
  if (val === 'non-quota') return 'text-success fw-bold';
  if (val === 0) return 'text-danger fw-bold';
  return 'text-dark';
};

const close = () => emit('close')
const register = () => emit('register', props.dauroh)
</script>

<style scoped>
@import url("~/assets/css/components/modals.css");
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