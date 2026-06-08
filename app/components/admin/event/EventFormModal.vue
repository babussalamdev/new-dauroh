<template>
  <div v-if="show" class="modal fade show d-block backdrop-blur" tabindex="-1" @click.self="triggerShake">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" :class="{ 'modal-shake': isShaking }">
      <div class="modal-content border-0 shadow-lg rounded-3 overflow-hidden">

        <div class="modal-header border-0 px-3 pt-3 pb-2 d-flex align-items-center">
          <div>
            <h5 class="modal-title txt-title fw-bold text-dark">{{ isEditing ? 'Edit Event' : 'Buat Event Baru' }}</h5>
            <p class="text-muted txt-caption mb-0">Isi data event dengan teliti.</p>
          </div>
          <button type="button" class="btn-close shadow-none bg-light p-2 rounded-circle" @click="close"></button>
        </div>

        <div class="modal-body px-3 pb-3 pt-1">
          <form @submit.prevent="save" id="eventBasicForm">

            <div v-if="isEditing" class="card border-0 mb-3 transition-all" :class="isStatusActive ? 'bg-success-subtle' : 'bg-secondary-subtle'">
              <div class="card-body p-2 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <div class="icon-box rounded-circle d-flex align-items-center justify-content-center"
                    :class="isStatusActive ? 'bg-success text-white' : 'bg-secondary text-white'"
                    style="width: 32px; height: 32px;">
                    <i class="bi" :class="isStatusActive ? 'bi-check-lg' : 'bi-eye-slash-fill'"></i>
                  </div>
                  <div style="line-height: 1.2;">
                    <h6 class="txt-body fw-bold mb-0 text-truncate"
                      :class="isStatusActive ? 'text-success-emphasis' : 'text-secondary-emphasis'">
                      {{ isStatusActive ? 'Publish' : 'Draft' }}
                    </h6>
                  </div>
                </div>
                <div class="form-check form-switch m-0">
                  <input class="form-check-input shadow-sm" type="checkbox" role="switch" id="isActiveSwitch" v-model="isStatusActive" style="cursor: pointer;">
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-12">
                <label for="eventTitleModal" class="form-label txt-label fw-bold text-muted">Nama Event <span class="text-danger">*</span></label>
                <input type="text" class="form-control modern-input txt-body fw-bold" id="eventTitleModal" v-model="formState.Title" placeholder="Masukkan judul event..." required>
              </div>

              <div class="col-md-6">
                <label for="eventGenderModal" class="form-label txt-label fw-bold text-muted">Target Peserta <span class="text-danger">*</span></label>
                <select class="form-select modern-input txt-body fw-bold" id="eventGenderModal" v-model="formState.Gender" @change="handleGenderChange" :disabled="isEditing" required>
                  <option disabled value="">Pilih Target</option>
                  <option value="Ikhwan">Ikhwan (Laki-laki)</option>
                  <option value="Akhwat">Akhwat (Perempuan)</option>
                  <option value="ikhwan, akhwat">(Ikhwan & Akhwat)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="eventPlaceModal" class="form-label txt-label fw-bold text-muted">Lokasi <span class="text-danger">*</span></label>
                <input type="text" class="form-control modern-input txt-body fw-bold" id="eventPlaceModal" v-model="formState.Place" placeholder="Cth: Masjid Babussalam" required>
              </div>

              <div class="col-md-6">
                <label for="eventPriceModal" class="form-label txt-label fw-bold text-muted">Harga Tiket <span class="text-danger">*</span></label>
                <div class="input-group modern-input-group">
                  <span class="input-group-text border-0 bg-transparent text-muted ps-3 txt-body fw-bold">Rp</span>
                  <input type="number" class="form-control border-0 bg-transparent ps-1 txt-title fw-bold text-dark" id="eventPriceModal" v-model.number="formState.Price" placeholder="0" min="0" required>
                  <span class="input-group-text border-0 bg-transparent text-muted pe-3 txt-caption">(0 = gratis)</span>
                </div>
              </div>

              <div class="col-md-6">
                <label for="eventWaModal" class="form-label txt-label fw-bold text-muted">Nomor WhatsApp <span class="text-danger">*</span></label>
                <div class="input-group modern-input-group">
                  <span class="input-group-text border-0 bg-transparent text-success ps-3 txt-body fw-bold">
                    <i class="bi bi-whatsapp"></i>
                  </span>
                  <input type="text" class="form-control border-0 bg-transparent ps-1 txt-body fw-bold text-dark" id="eventWaModal" v-model="formState.Whatsapp" placeholder="Cth: 628123456789" required>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="p-3 rounded-3 bg-light border border-dashed h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="txt-body fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                      <i class="bi bi-calendar-event text-primary"></i> Waktu Pendaftaran
                    </h6>
                    <div class="form-check form-switch m-0" style="min-height: auto;">
                      <input class="form-check-input" type="checkbox" id="hasStartSwitch" v-model="formState.HasRegStart">
                    </div>
                  </div>

                  <template v-if="formState.HasRegStart">
                    <div class="animate-slide-down">
                      <div class="mb-2">
                        <label class="form-label txt-caption text-muted mb-1">Buka</label>
                        <div class="input-group input-group-sm">
                          <input type="date" class="form-control modern-input txt-body fw-bold" v-model="formState.RegStartDate" :required="formState.HasRegStart" :min="minDate" :max="maxRegEndDate">
                          <input type="time" class="form-control modern-input txt-body fw-bold" step="1" v-model="formState.RegStartTime" :required="formState.HasRegStart" :min="getMinStartTime(formState.RegStartDate)">
                        </div>
                      </div>

                      <div class="form-check form-switch mb-1">
                        <input class="form-check-input small-switch" type="checkbox" id="hasEndSwitch" v-model="formState.HasRegEnd" :disabled="!formState.HasRegStart">
                        <label class="form-check-label txt-caption text-muted" for="hasEndSwitch">Batasi tutup?</label>
                      </div>

                      <div v-if="formState.HasRegEnd">
                        <div class="input-group input-group-sm">
                          <input type="date" class="form-control modern-input txt-body fw-bold" v-model="formState.RegEndDate" :required="formState.HasRegEnd" :min="formState.RegStartDate || minDate" :max="maxRegEndDate">
                          <input type="time" class="form-control modern-input txt-body fw-bold" step="1" v-model="formState.RegEndTime" :required="formState.HasRegEnd" :min="getMinEndTime(formState.RegEndDate)">
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-muted txt-caption mb-0 mt-2">Otomatis buka saat event aktif.</p>
                  </template>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="p-3 rounded-3 bg-light border border-dashed h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="txt-body fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                      <i class="bi bi-people text-primary"></i> Pengaturan Kuota
                    </h6>
                    <div class="form-check form-switch m-0" style="min-height: auto;">
                      <input class="form-check-input" type="checkbox" id="unlimitedTotalSwitch" v-model="isUnlimited.total" title="Aktifkan jika kuota tidak terbatas">
                    </div>
                  </div>

                  <div v-if="isUnlimited.total" class="alert alert-success py-2 px-2 d-flex align-items-center gap-2 mb-0 mt-2 animate-slide-down">
                    <i class="bi bi-infinity fs-5"></i>
                    <span class="txt-caption fw-bold">Event ini Tanpa Batas Kuota (Non-Quota).</span>
                  </div>
                  <div v-else class="row g-2 mt-1 animate-slide-down">

                    <div class="col-12" v-if="!formState.Gender">
                      <span class="text-muted txt-caption fst-italic">
                        * Pilih target peserta terlebih dahulu untuk mengatur kuota.
                      </span>
                    </div>

                    <div class="col-12" v-if="formState.Gender === 'ikhwan, akhwat'">
                      <div class="input-group input-group-sm modern-input-group bg-white">
                        <span class="input-group-text border-0 bg-transparent text-muted txt-caption fw-bold">Total</span>
                        <input type="number" class="form-control border-0 bg-transparent txt-body fw-bold" 
                        v-model.number="draft.quotaValues.total" 
                        placeholder="100" 
                        min="1" 
                        required>
                      </div>

                      <div v-if="showAllocationWarning" class="mt-1 p-1 rounded-2 txt-caption fw-bold d-flex align-items-center gap-1" :class="remainingQuota === 0 ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'">
                        <i :class="remainingQuota === 0 ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
                        <span>{{ allocationMessage }}</span>
                      </div>
                    </div>

                    <div class="col-12" v-if="formState.Gender === 'Ikhwan' || formState.Gender === 'ikhwan, akhwat'">
                      <div class="input-group input-group-sm modern-input-group bg-white">
                        <span class="input-group-text border-0 bg-transparent text-muted txt-caption fw-bold" style="width: 65px;">Ikhwan</span>
                        <input type="number" class="form-control border-0 bg-transparent txt-body fw-bold" 
       v-model.number="draft.quotaValues.ikhwan" 
       min="1" 
       required>
                      </div>
                    </div>

                    <div class="col-12" v-if="formState.Gender === 'Akhwat' || formState.Gender === 'ikhwan, akhwat'">
                      <div class="input-group input-group-sm modern-input-group bg-white">
                        <span class="input-group-text border-0 bg-transparent text-muted txt-caption fw-bold" style="width: 65px;">Akhwat</span>
                        <input type="number" class="form-control border-0 bg-transparent txt-body fw-bold" 
       v-model.number="draft.quotaValues.akhwat" 
       min="1" 
       required>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer border-0 px-3 pb-3 pt-0">
          <button type="button" class="btn btn-light px-4 rounded-pill text-muted txt-body fw-bold border" @click="handleCancel">Batal</button>
          <button type="submit" form="eventBasicForm" class="btn btn-primary px-4 rounded-pill txt-body fw-bold shadow-sm" :disabled="isLoading || (!isUnlimited.total && isQuotaMismatch) || (isEditing && !isFormChanged)">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <!-- 🟢 KONDISI BARU BUAT TOMBOL -->
            <span v-else-if="isEditing"><i class="bi bi-floppy-fill me-1"></i> Simpan Perubahan</span>
            <span v-else>Selanjutnya <i class="bi bi-arrow-right ms-1"></i></span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { watch, reactive, computed, ref } from 'vue';
import type { Event } from '@/types/event';
import { useEventStore } from '@/stores/event';
import { useAlert } from '~/utils/swal';

const { alert: swalAlert } = useAlert();

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  event?: Partial<Event>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'next', payload: any): void; 
  (e: 'save', payload: any): void;
}>();

const eventStore = useEventStore();
const isLoading = computed(() => eventStore.loading.savingBasic);
const { isShaking, triggerShake } = useModalShake();

const draft = eventStore.draftEvent;

const originalDraft = ref("");
const isFormChanged = computed(() => {
  if (!props.isEditing) return true;
  return JSON.stringify(draft) !== originalDraft.value;
});

const formState = computed(() => draft);
const quotaValues = computed(() => draft.quotaValues);
const isUnlimited = computed(() => draft.isUnlimited);
const isStatusActive = computed({
  get: () => draft.status === 'active',
  set: (val) => draft.status = val ? 'active' : 'inactive'
});

const minDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});
const getMinStartTime = (selectedDate: string) => {
  if (!selectedDate) return undefined;
  if (selectedDate === minDate.value) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}:00`;
  }
  return undefined;
};
const getMinEndTime = (selectedEndDate: string) => {
  if (!selectedEndDate) return undefined;
  if (selectedEndDate === draft.RegStartDate) {
    return draft.RegStartTime;
  }
  if (selectedEndDate === minDate.value) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}:00`;
  }
  return undefined;
};

const remainingQuota = computed(() => (Number(draft.quotaValues.total) || 0) - ((Number(draft.quotaValues.ikhwan) || 0) + (Number(draft.quotaValues.akhwat) || 0)));

const maxRegEndDate = computed(() => {
  if (!props.event || !props.event.Date) return undefined;
  let minDate = '';
  const dates = props.event.Date;
  if (typeof dates === 'object') {
    Object.values(dates).forEach((day: any) => {
      if (day && day.date) {
        if (!minDate || day.date < minDate) {
          minDate = day.date;
        }
      }
    });
  }
  return minDate || undefined;
});

const isQuotaMismatch = computed(() => {
  if (draft.isUnlimited.total) return false; 
  if (draft.Gender !== 'ikhwan, akhwat') return false;
  return remainingQuota.value !== 0;
});

const showAllocationWarning = computed(() => draft.Gender === 'ikhwan, akhwat' && !draft.isUnlimited.total);
const allocationMessage = computed(() => {
  if (remainingQuota.value === 0) return 'OK';
  if (remainingQuota.value > 0) return `Kurang ${remainingQuota.value}`;
  return `Lebih ${Math.abs(remainingQuota.value)}`;
});

const handleGenderChange = () => {
  draft.quotaValues.total = 0; draft.quotaValues.ikhwan = 0; draft.quotaValues.akhwat = 0;
  if (!draft.isUnlimited.total) {
    if (draft.Gender === 'Ikhwan') { draft.quotaValues.ikhwan = 1; draft.quotaValues.total = 1; }
    else if (draft.Gender === 'Akhwat') { draft.quotaValues.akhwat = 1; draft.quotaValues.total = 1; }
    else { draft.quotaValues.total = 1; draft.quotaValues.ikhwan = 1; draft.quotaValues.akhwat = 1; }
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    // 1. Cuma load data prop kalau lagi mode Edit!
    // Kalau create new, biarin isi draft yang ada.
    if (props.isEditing && props.event) {
      const d = props.event; 

      draft.SK = d.SK || '';
      draft.Title = d.Title || '';
      draft.Place = d.Place || '';

      const rawGender = (d.Gender || '').toLowerCase();
      if (rawGender.includes('ikhwan') && rawGender.includes('akhwat')) {
        draft.Gender = 'ikhwan, akhwat';
      } else if (rawGender === 'ikhwan') { draft.Gender = 'Ikhwan';
      } else if (rawGender === 'akhwat') { draft.Gender = 'Akhwat';
      } else { draft.Gender = ''; }

      draft.Price = d.Price || 0;
      draft.Whatsapp = d.Whatsapp || '';
      draft.status = d.Status || 'inactive';

      if (d.Registration) {
        const startStr = d.Registration.start_registration || '';
        if (startStr && startStr.trim() !== '') {
          draft.HasRegStart = true;
          const [sDate, sTime] = startStr.split(' ');
          draft.RegStartDate = sDate || '';
          draft.RegStartTime = sTime || '';
        } else { draft.HasRegStart = false; }

        const endStr = d.Registration.end_registration || '';
        if (endStr && endStr.trim() !== '') {
          draft.HasRegEnd = true;
          const [eDate, eTime] = endStr.split(' ');
          draft.RegEndDate = eDate || '';
          draft.RegEndTime = eTime || '';
        } else { draft.HasRegEnd = false; }
      } else {
        draft.HasRegStart = false;
        draft.HasRegEnd = false;
      }

      const checkIsNonQuota = (val: any) => val && String(val).toLowerCase().trim() === 'non-quota';
      if (checkIsNonQuota(d.Quota_Total) || checkIsNonQuota(d.Quota_Ikhwan) || checkIsNonQuota(d.Quota_Akhwat)) {
        draft.isUnlimited.total = true;
        draft.quotaValues.total = 0; draft.quotaValues.ikhwan = 0; draft.quotaValues.akhwat = 0;
      } else {
        draft.isUnlimited.total = false;
        draft.quotaValues.total = Number(d.Quota_Total) || 1;
        draft.quotaValues.ikhwan = Number(d.Quota_Ikhwan) || 0;
        draft.quotaValues.akhwat = Number(d.Quota_Akhwat) || 0;
      }
      
      originalDraft.value = JSON.stringify(draft);
    } 
    // JIKA BUKAN EDIT (CREATE BARU), DAN DRAFT KOSONG, KASIH DEFAULT KUOTA
    else if (!draft.Title && draft.quotaValues.total === 0) {
       draft.quotaValues.total = 1;
       draft.quotaValues.ikhwan = 1;
       draft.quotaValues.akhwat = 1;
    }
  }
}, { immediate: true });

watch(() => draft.HasRegStart, (newVal) => {
  if (!newVal) {
    draft.HasRegEnd = false;
    draft.RegStartDate = ''; draft.RegStartTime = '';
    draft.RegEndDate = ''; draft.RegEndTime = '';
  }
});

const close = () => { if (!isLoading.value) emit('close'); };

const handleCancel = () => {
  eventStore.resetDraftEvent(); 
  close();
};

const save = () => {
  if (isLoading.value) return;

  if (!draft.isUnlimited.total && isQuotaMismatch.value) {
    swalAlert('Alokasi Kuota Salah', `Total (${draft.quotaValues.total}) harus sama dengan Ikhwan (${draft.quotaValues.ikhwan}) + Akhwat (${draft.quotaValues.akhwat}). ${allocationMessage.value}.`, 'error');
    return;
  }

  if (draft.HasRegStart && draft.HasRegEnd) {
    const startStr = `${draft.RegStartDate} ${draft.RegStartTime}`;
    const endStr = `${draft.RegEndDate} ${draft.RegEndTime}`;
    if (new Date(endStr) <= new Date(startStr)) {
      swalAlert('Waktu Tidak Valid', 'Waktu Tutup Pendaftaran tidak boleh lebih awal dari Waktu Buka.', 'warning');
      return;
    }
  }

  if (maxRegEndDate.value && draft.HasRegStart) {
    if (draft.RegStartDate > maxRegEndDate.value || (draft.HasRegEnd && draft.RegEndDate > maxRegEndDate.value)) {
       swalAlert('Tanggal Tidak Valid', `Pendaftaran tidak boleh melewati hari-H kegiatan (${maxRegEndDate.value})`, 'warning');
       return;
    }
  }
  
  const formElement = document.getElementById('eventBasicForm') as HTMLFormElement;
  if (formElement && !formElement.checkValidity()) { formElement.reportValidity(); return; }

  const finalQuotaTotal = draft.isUnlimited.total ? 'non-quota' : draft.quotaValues.total;
  const finalQuotaIkhwan = draft.isUnlimited.total ? 'non-quota' : draft.quotaValues.ikhwan;
  const finalQuotaAkhwat = draft.isUnlimited.total ? 'non-quota' : draft.quotaValues.akhwat;

  let startString = ""; let endString = "";
  if (draft.HasRegStart) { startString = `${draft.RegStartDate} ${draft.RegStartTime}`; }
  if (draft.HasRegEnd) { endString = `${draft.RegEndDate} ${draft.RegEndTime}`; }

  // 🟢 SEKARANG PAKE DRAFT.XXX SUPAYA DATANYA KEBACA!
  const dataToEmit = {
    SK: props.isEditing ? draft.SK : null,
    Title: draft.Title,
    Gender: draft.Gender,
    Place: draft.Place,
    Price: String(draft.Price),
    Whatsapp: draft.Whatsapp,
    Quota_Ikhwan_Akhwat: finalQuotaTotal,
    Quota_Ikhwan: finalQuotaIkhwan,
    Quota_Akhwat: finalQuotaAkhwat,
    Status: draft.status,
    Registration: { start_registration: startString, end_registration: endString }
  };

  if (props.isEditing) {
    emit('save', dataToEmit); 
  } else {
    emit('next', dataToEmit);
  }
};
</script>

<style scoped>

@import url('@/assets/css/components/modals.css');

.backdrop-blur {
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.4);
}

.small-label {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.x-small {
  font-size: 0.7rem;
}

.modern-input,
.modern-input-group {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.modern-input:focus,
.modern-input-group:focus-within {
  background-color: #fff;
  border-color: var(--color-primary, #004754);
  box-shadow: 0 0 0 2px rgba(0, 71, 84, 0.1);
}

.modern-input-group input:focus {
  box-shadow: none;
}

.border-dashed {
  border-style: dashed !important;
  border-color: #dee2e6 !important;
}

/* Animation */

:deep(.swal2-container) {
  z-index: 2000 !important;
}
</style>