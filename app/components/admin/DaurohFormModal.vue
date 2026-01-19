<template>
  <div v-if="show" class="modal fade show d-block backdrop-blur" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
        
        <div class="modal-header border-0 px-3 pt-3 pb-2 d-flex align-items-center">
          <div>
            <h5 class="modal-title fw-bold text-dark fs-5">{{ isEditing ? 'Edit Event' : 'Buat Event Baru' }}</h5>
            <p class="text-muted small mb-0" style="font-size: 0.8rem;">Isi data event dengan teliti.</p>
          </div>
          <button type="button" class="btn-close small bg-light p-2 rounded-circle" @click="close"></button>
        </div>

        <div class="modal-body px-3 pb-3 pt-1">
          <form @submit.prevent="save" id="daurohBasicForm">
            
            <div class="card border-0 mb-3 transition-all" 
                 :class="isStatusActive ? 'bg-success-subtle' : 'bg-secondary-subtle'">
              <div class="card-body p-2 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <div class="icon-box rounded-circle d-flex align-items-center justify-content-center"
                       :class="isStatusActive ? 'bg-success text-white' : 'bg-secondary text-white'"
                       style="width: 32px; height: 32px; font-size: 0.9rem;">
                    <i class="bi" :class="isStatusActive ? 'bi-check-lg' : 'bi-eye-slash-fill'"></i>
                  </div>
                  <div style="line-height: 1.2;">
                    <h6 class="fw-bold mb-0 text-truncate" style="font-size: 0.9rem;" :class="isStatusActive ? 'text-success-emphasis' : 'text-secondary-emphasis'">
                      {{ isStatusActive ? 'Event Aktif (Publik)' : 'Mode Draft (Tersembunyi)' }}
                    </h6>
                  </div>
                </div>
                <div class="form-check form-switch m-0">
                  <input 
                    class="form-check-input shadow-sm" 
                    type="checkbox" 
                    role="switch" 
                    id="isActiveSwitch" 
                    v-model="isStatusActive" 
                    style="cursor: pointer;"
                  >
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-12">
                <label for="daurohTitleModal" class="form-label fw-bold text-muted small-label">Nama Event <span class="text-danger">*</span></label>
                <input type="text" class="form-control modern-input" id="daurohTitleModal" v-model="formState.Title" placeholder="Masukkan judul event..." required>
              </div>

              <div class="col-md-6">
                <label for="daurohGenderModal" class="form-label fw-bold text-muted small-label">Target Peserta <span class="text-danger">*</span></label>
                <select 
                  class="form-select modern-input" 
                  id="daurohGenderModal" 
                  v-model="formState.Gender" 
                  @change="handleGenderChange"
                  :disabled="isEditing"
                  required
                >
                  <option disabled value="">Pilih Target</option>
                  <option value="Ikhwan">Ikhwan (Laki-laki)</option>
                  <option value="Akhwat">Akhwat (Perempuan)</option>
                  <option value="ikhwan, akhwat">(Ikhwan & Akhwat)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="daurohPlaceModal" class="form-label fw-bold text-muted small-label">Lokasi <span class="text-danger">*</span></label>
                <input type="text" class="form-control modern-input" id="daurohPlaceModal" v-model="formState.Place" placeholder="Cth: Masjid Babussalam" required>
              </div>

              <div class="col-12">
                <label for="daurohPriceModal" class="form-label fw-bold text-muted small-label">Harga Tiket <span class="text-danger">*</span></label>
                <div class="input-group modern-input-group">
                  <span class="input-group-text border-0 bg-transparent text-muted ps-3">Rp</span>
                  <input type="number" class="form-control border-0 bg-transparent ps-1 fw-bold text-dark" id="daurohPriceModal" v-model.number="formState.Price" placeholder="0" min="0" required>
                  <span class="input-group-text border-0 bg-transparent text-muted pe-3 small">(Isi 0 jika gratis)</span>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="p-3 rounded-3 bg-light border border-dashed h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="fw-bold mb-0 small d-flex align-items-center gap-2 text-dark">
                      <i class="bi bi-calendar-event text-primary"></i> Waktu Pendaftaran
                    </h6>
                    <div class="form-check form-switch m-0" style="min-height: auto;">
                      <input class="form-check-input" type="checkbox" id="hasStartSwitch" v-model="formState.HasRegStart">
                    </div>
                  </div>

                  <template v-if="formState.HasRegStart">
                    <div class="animate-slide-down">
                      <div class="mb-2">
                        <label class="form-label x-small text-muted mb-1">Buka</label>
                        <div class="input-group input-group-sm">
                          <input type="date" class="form-control modern-input" v-model="formState.RegStartDate" :required="formState.HasRegStart" :min="minDate">
                          <input type="time" class="form-control modern-input" step="1" v-model="formState.RegStartTime" :required="formState.HasRegStart" :min="getMinStartTime(formState.RegStartDate)">
                        </div>
                      </div>

                      <div class="form-check form-switch mb-1">
                        <input class="form-check-input small-switch" type="checkbox" id="hasEndSwitch" v-model="formState.HasRegEnd" :disabled="!formState.HasRegStart">
                        <label class="form-check-label x-small text-muted" for="hasEndSwitch">Batasi tutup?</label>
                      </div>

                      <div v-if="formState.HasRegEnd">
                         <div class="input-group input-group-sm">
                            <input type="date" class="form-control modern-input" v-model="formState.RegEndDate" :required="formState.HasRegEnd" :min="formState.RegStartDate || minDate">
                            <input type="time" class="form-control modern-input" step="1" v-model="formState.RegEndTime" :required="formState.HasRegEnd" :min="getMinEndTime(formState.RegEndDate)">
                         </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                     <p class="text-muted x-small mb-0 mt-2">Otomatis buka saat event aktif.</p>
                  </template>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="p-3 rounded-3 bg-light border border-dashed h-100">
                  <h6 class="fw-bold mb-2 small d-flex align-items-center gap-2 text-dark">
                    <i class="bi bi-people text-primary"></i> Pengaturan Kuota
                  </h6>
                  
                  <div class="row g-2">
                    <div class="col-12" v-if="formState.Gender === 'ikhwan, akhwat'">
                       <div class="input-group input-group-sm modern-input-group bg-white">
                          <span class="input-group-text border-0 bg-transparent text-muted x-small">Total</span>
                          <input type="number" class="form-control border-0 bg-transparent" v-model.number="quotaValues.total" 
                                 :disabled="isUnlimited.total" placeholder="100" 
                                 @input="validateMinOne('total')" required>
                          <div class="input-group-text border-0 bg-transparent ps-0">
                             <div class="form-check form-check-inline m-0">
                                <input class="form-check-input" type="checkbox" v-model="isUnlimited.total">
                                <label class="form-check-label x-small text-muted">No Limit</label>
                             </div>
                          </div>
                       </div>
                       
                       <div v-if="showAllocationWarning" class="mt-1 p-1 rounded-2 x-small d-flex align-items-center gap-1"
                            :class="remainingQuota === 0 ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'">
                           <i :class="remainingQuota === 0 ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
                           <span>{{ allocationMessage }}</span>
                       </div>
                    </div>

                    <div class="col-12" v-if="formState.Gender === 'Ikhwan' || formState.Gender === 'ikhwan, akhwat'">
                        <div class="input-group input-group-sm modern-input-group bg-white">
                           <span class="input-group-text border-0 bg-transparent text-muted x-small" style="width: 60px;">Ikhwan</span>
                           <input type="number" class="form-control border-0 bg-transparent" v-model.number="quotaValues.ikhwan" 
                                  :disabled="isUnlimited.ikhwan" @input="validateMinOne('ikhwan')" required>
                           <div class="input-group-text border-0 bg-transparent px-2">
                              <input class="form-check-input" type="checkbox" v-model="isUnlimited.ikhwan" title="Tak Terbatas">
                           </div>
                        </div>
                    </div>

                    <div class="col-12" v-if="formState.Gender === 'Akhwat' || formState.Gender === 'ikhwan, akhwat'">
                        <div class="input-group input-group-sm modern-input-group bg-white">
                           <span class="input-group-text border-0 bg-transparent text-muted x-small" style="width: 60px;">Akhwat</span>
                           <input type="number" class="form-control border-0 bg-transparent" v-model.number="quotaValues.akhwat" 
                                  :disabled="isUnlimited.akhwat" @input="validateMinOne('akhwat')" required>
                           <div class="input-group-text border-0 bg-transparent px-2">
                              <input class="form-check-input" type="checkbox" v-model="isUnlimited.akhwat" title="Tak Terbatas">
                           </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        <div class="modal-footer border-0 px-3 pb-3 pt-0">
          <button type="button" class="btn btn-light btn-sm px-4 rounded-3 text-muted fw-medium" @click="close">Batal</button>
          <button 
            type="submit" 
            form="daurohBasicForm" 
            class="btn btn-primary btn-sm px-4 rounded-3 fw-bold shadow-sm" 
            :disabled="isLoading || isQuotaMismatch"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'Menyimpan...' : 'Simpan Event' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
// SCRIPT SAMA PERSIS DENGAN SEBELUMNYA (Copy dari codingan asli lu)
// Tidak ada perubahan logic sama sekali.

import { watch, reactive, computed, ref } from 'vue'; 
import type { Dauroh } from '@/stores/dauroh';
import { useDaurohStore } from '@/stores/dauroh';
import Swal from 'sweetalert2'; 

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  dauroh?: Partial<Dauroh>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: {
    daurohData: any; 
    photoBase64: null;
  }): void;
}>();

const daurohStore = useDaurohStore();
const isLoading = computed(() => daurohStore.loading.savingBasic);

const isStatusActive = ref(false); 

const getInitialFormState = () => ({
  SK: '', 
  Title: '',
  Gender: '',
  Place: '',
  Price: 0,
  HasRegStart: false,
  HasRegEnd: false,
  RegStartDate: '',
  RegStartTime: '',
  RegEndDate: '',
  RegEndTime: '',
});

const formState = reactive(getInitialFormState());

const quotaValues = reactive({ total: 0, ikhwan: 0, akhwat: 0 });
const isUnlimited = reactive({ total: false, ikhwan: false, akhwat: false });
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
  if (selectedEndDate === formState.RegStartDate) {
      return formState.RegStartTime;
  }
  if (selectedEndDate === minDate.value) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}:00`;
  }
  return undefined;
};

const validateMinOne = (field: 'total' | 'ikhwan' | 'akhwat') => {
    if (isUnlimited[field]) return; 
    if (quotaValues[field] === 0) { quotaValues[field] = 1; }
};
const remainingQuota = computed(() => quotaValues.total - (quotaValues.ikhwan + quotaValues.akhwat));
const isQuotaMismatch = computed(() => {
  if (formState.Gender !== 'ikhwan, akhwat') return false; 
  if (isUnlimited.total || isUnlimited.ikhwan || isUnlimited.akhwat) return false;
  return remainingQuota.value !== 0;
});
const showAllocationWarning = computed(() => formState.Gender === 'ikhwan, akhwat' && !isUnlimited.total && !isUnlimited.ikhwan && !isUnlimited.akhwat);
const allocationMessage = computed(() => {
  if (remainingQuota.value === 0) return 'OK';
  if (remainingQuota.value > 0) return `Kurang ${remainingQuota.value}`;
  return `Lebih ${Math.abs(remainingQuota.value)}`;
});

const handleGenderChange = () => {
    if (formState.Gender === 'Ikhwan') {
        quotaValues.akhwat = 0; isUnlimited.akhwat = false;
        quotaValues.total = 0; isUnlimited.total = false;
        if (quotaValues.ikhwan === 0) quotaValues.ikhwan = 1;
    } else if (formState.Gender === 'Akhwat') {
        quotaValues.ikhwan = 0; isUnlimited.ikhwan = false;
        quotaValues.total = 0; isUnlimited.total = false;
        if (quotaValues.akhwat === 0) quotaValues.akhwat = 1;
    } else {
        if (quotaValues.total === 0) quotaValues.total = 1;
        if (quotaValues.ikhwan === 0) quotaValues.ikhwan = 1;
        if (quotaValues.akhwat === 0) quotaValues.akhwat = 1;
    }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    Object.assign(formState, getInitialFormState());
    quotaValues.total = 0; quotaValues.ikhwan = 0; quotaValues.akhwat = 0;
    isUnlimited.total = false; isUnlimited.ikhwan = false; isUnlimited.akhwat = false;
    isStatusActive.value = false;

    if (props.isEditing && props.dauroh) {
      formState.SK = props.dauroh.SK || '';
      formState.Title = props.dauroh.Title || '';
      formState.Place = props.dauroh.Place || '';
      const rawGender = (props.dauroh.Gender || '').toLowerCase();
      if (rawGender.includes('ikhwan') && rawGender.includes('akhwat')) {
          formState.Gender = 'ikhwan, akhwat'; 
      } else if (rawGender === 'ikhwan') {
          formState.Gender = 'Ikhwan';
      } else if (rawGender === 'akhwat') {
          formState.Gender = 'Akhwat';
      } else {
          formState.Gender = '';
      }
      formState.Price = props.dauroh.Price || 0;
      isStatusActive.value = props.dauroh.Status === 'active';
      if (props.dauroh.Registration) {
         const startStr = props.dauroh.Registration.start_registration || '';
         if (startStr && startStr.trim() !== '') {
             formState.HasRegStart = true;
             const [sDate, sTime] = startStr.split(' ');
             formState.RegStartDate = sDate || '';
             formState.RegStartTime = sTime || '';
         } else { formState.HasRegStart = false; }

         const endStr = props.dauroh.Registration.end_registration || '';
         if (endStr && endStr.trim() !== '') {
             formState.HasRegEnd = true;
             const [eDate, eTime] = endStr.split(' ');
             formState.RegEndDate = eDate || '';
             formState.RegEndTime = eTime || '';
         } else { formState.HasRegEnd = false; }
      } else {
          formState.HasRegStart = false;
          formState.HasRegEnd = false;
      }

      const qTotal = props.dauroh.Quota_Total;
      const qIkhwan = props.dauroh.Quota_Ikhwan;
      const qAkhwat = props.dauroh.Quota_Akhwat;

      if (qTotal === 'non-quota') { isUnlimited.total = true; quotaValues.total = 0; }
      else { isUnlimited.total = false; quotaValues.total = Number(qTotal) || 1; } 

      if (qIkhwan === 'non-quota') { isUnlimited.ikhwan = true; quotaValues.ikhwan = 0; }
      else { isUnlimited.ikhwan = false; quotaValues.ikhwan = Number(qIkhwan) || 1; }

      if (qAkhwat === 'non-quota') { isUnlimited.akhwat = true; quotaValues.akhwat = 0; }
      else { isUnlimited.akhwat = false; quotaValues.akhwat = Number(qAkhwat) || 1; }
    } else {
        quotaValues.total = 1;
        quotaValues.ikhwan = 1;
        quotaValues.akhwat = 1;
    }
  }
}, { immediate: true });

watch(() => formState.HasRegStart, (newVal) => {
    if (!newVal) {
        formState.HasRegEnd = false;
        formState.RegStartDate = ''; formState.RegStartTime = '';
        formState.RegEndDate = ''; formState.RegEndTime = '';
    }
});
watch(() => [isUnlimited.ikhwan, isUnlimited.akhwat], ([newIkhwan, newAkhwat]) => {
  if (newIkhwan || newAkhwat) { isUnlimited.total = true; quotaValues.total = 0; }
});
watch(() => isUnlimited.total, (isTotalUnlimited) => {
  if (!isTotalUnlimited) {
    if (isUnlimited.ikhwan) isUnlimited.ikhwan = false;
    if (isUnlimited.akhwat) isUnlimited.akhwat = false;
  }
});

const close = () => { if (!isLoading.value) emit('close'); };

const save = () => {
   if (isLoading.value) return;
   if (isQuotaMismatch.value) {
     Swal.fire({ icon: 'error', title: 'Alokasi Kuota Salah', text: `Total (${quotaValues.total}) harus sama dengan Ikhwan (${quotaValues.ikhwan}) + Akhwat (${quotaValues.akhwat}). ${allocationMessage.value}.` });
     return;
   }
   if (formState.HasRegStart && formState.HasRegEnd) {
       const startStr = `${formState.RegStartDate} ${formState.RegStartTime}`;
       const endStr = `${formState.RegEndDate} ${formState.RegEndTime}`;
       if (new Date(endStr) <= new Date(startStr)) {
           Swal.fire({ icon: 'warning', title: 'Waktu Tidak Valid', text: 'Waktu Tutup Pendaftaran tidak boleh lebih awal atau sama dengan Waktu Buka Pendaftaran.' });
           return;
       }
   }
   const formElement = document.getElementById('daurohBasicForm') as HTMLFormElement;
   if (formElement && !formElement.checkValidity()) { formElement.reportValidity(); return; }

   const finalQuotaTotal = isUnlimited.total ? 'non-quota' : quotaValues.total;
   const finalQuotaIkhwan = isUnlimited.ikhwan ? 'non-quota' : quotaValues.ikhwan;
   const finalQuotaAkhwat = isUnlimited.akhwat ? 'non-quota' : quotaValues.akhwat;

   let startString = "";
   let endString = "";
   if (formState.HasRegStart) { startString = `${formState.RegStartDate} ${formState.RegStartTime}`; }
   if (formState.HasRegEnd) { endString = `${formState.RegEndDate} ${formState.RegEndTime}`; }

  const dataToEmit = {
    SK: props.isEditing ? formState.SK : null,
    Title: formState.Title,
    Gender: formState.Gender,
    Place: formState.Place,
    Price: formState.Price,
    Quota_Total: finalQuotaTotal,
    Quota_Ikhwan: finalQuotaIkhwan,
    Quota_Akhwat: finalQuotaAkhwat,
    Status: isStatusActive.value ? 'active' : 'inactive', 
    Registration: {
        start_registration: startString,
        end_registration: endString
    }
  };

  emit('save', { daurohData: dataToEmit as any, photoBase64: null });
};
</script>

<style scoped>
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

.modern-input, .modern-input-group {
  background-color: #f8f9fa; 
  border: 1px solid #e9ecef;
  border-radius: 0.375rem; /* Standard rounded */
  transition: all 0.2s ease;
  font-size: 0.9rem; /* Agak kecil dari standar */
}

.modern-input:focus, 
.modern-input-group:focus-within {
  background-color: #fff;
  border-color: var(--color-primary, #004754); 
  box-shadow: 0 0 0 2px rgba(0, 71, 84, 0.1);
}

.modern-input-group input:focus { box-shadow: none; }

.border-dashed { border-style: dashed !important; border-color: #dee2e6 !important; }

/* Animation */
.animate-slide-down {
  animation: slideDown 0.2s ease-out forwards;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.swal2-container) { z-index: 2000 !important; }
</style>