<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">{{ isEditing ? 'Edit Event' : 'Buat Event Baru' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body pt-4">
          <form @submit.prevent="save" id="daurohBasicForm">
            <div class="row g-3">
              
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center pb-3 mb-2 border-bottom">
                  <div>
                    <h6 class="fw-bold mb-1 text-dark">Status Publikasi</h6>
                    <div class="small" :class="formState.IsActive ? 'text-success' : 'text-muted'">
                      <i class="bi" :class="formState.IsActive ? 'bi-check-circle-fill' : 'bi-eye-slash-fill'"></i>
                      {{ formState.IsActive ? 'Event Aktif (Terlihat oleh Peserta)' : 'Draft / Non-Aktif (Disembunyikan)' }}
                    </div>
                  </div>
                  <div class="form-check form-switch">
                    <input 
                      class="form-check-input shadow-sm" 
                      type="checkbox" 
                      role="switch" 
                      id="isActiveSwitch" 
                      v-model="formState.IsActive" 
                      style="width: 3.2em; height: 1.6em; cursor: pointer;"
                    >
                  </div>
                </div>
              </div>

              <div class="col-12">
                <label for="daurohTitleModal" class="form-label fw-medium">Nama Event <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="daurohTitleModal" v-model="formState.Title" placeholder="Masukkan nama dauroh..." required>
              </div>

              <div class="col-md-6">
                <label for="daurohGenderModal" class="form-label fw-medium">Target Peserta <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  id="daurohGenderModal" 
                  v-model="formState.Gender" 
                  @change="handleGenderChange"
                  :disabled="isEditing"
                  required
                >
                  <option disabled value="">Pilih target peserta</option>
                  <option value="Ikhwan">Ikhwan</option>
                  <option value="Akhwat">Akhwat</option>
                  <option value="ikhwan, akhwat">Ikhwan, Akhwat</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="daurohPlaceModal" class="form-label fw-medium">Tempat <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="daurohPlaceModal" v-model="formState.Place" placeholder="cth: Masjid Babussalam" required>
              </div>

              <div class="col-12">
                <label for="daurohPriceModal" class="form-label fw-medium">Harga Tiket <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light">Rp</span>
                  <input type="number" class="form-control" id="daurohPriceModal" v-model.number="formState.Price" placeholder="0 (Gratis)" min="0" required>
                </div>
              </div>

              <div class="col-12 mt-4">
                 <h6 class="small fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                   <i class="bi bi-clock-history me-1"></i> Waktu Pendaftaran
                 </h6>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Tanggal Buka <span class="text-danger">*</span></label>
                <input type="date" class="form-control" v-model="formState.RegStartDate" required>
                <div class="form-text text-xs text-muted">Tgl mulai pendaftaran.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Jam Buka <span class="text-danger">*</span></label>
                <input type="time" step="1" class="form-control" v-model="formState.RegStartTime" required>
                <div class="form-text text-xs text-muted">Jam mulai (Format 24 jam).</div>
              </div>

              <div class="col-md-6 mt-3">
                <label class="form-label small fw-bold">Tanggal Tutup <span class="text-danger">*</span></label>
                <input type="date" class="form-control" v-model="formState.RegEndDate" required>
                <div class="form-text text-xs text-muted">Tgl pendaftaran ditutup.</div>
              </div>
              <div class="col-md-6 mt-3">
                <label class="form-label small fw-bold">Jam Tutup <span class="text-danger">*</span></label>
                <input type="time" step="1" class="form-control" v-model="formState.RegEndTime" required>
                <div class="form-text text-xs text-muted">Jam tutup (Format 24 jam).</div>
              </div>
              
              <div class="col-12 mt-4">
                <div class="card bg-light border-0 rounded-3">
                  <div class="card-body py-3">
                    <h6 class="card-title mb-3 small fw-bold text-uppercase text-muted">Pengaturan Kuota</h6>
                    <p class="text-muted text-xs mb-3">Centang "(Non-Quota)" jika tidak ada batasan jumlah peserta.</p>
                    
                    <div class="row g-3">
                      <div class="col-12" v-if="formState.Gender === 'ikhwan, akhwat'">
                        <label for="quotaTotal" class="form-label small fw-bold">Total Kuota (Global) <span class="text-danger">*</span></label>
                        <div class="input-group">
                          <input 
                            type="number" 
                            class="form-control" 
                            id="quotaTotal" 
                            v-model.number="quotaValues.total" 
                            min="1" 
                            placeholder="1" 
                            :disabled="isUnlimited.total"
                            :class="{'is-invalid': isQuotaMismatch}"
                            @input="validateMinOne('total')"
                            required
                          >
                          <div class="input-group-text bg-white">
                            <input class="form-check-input mt-0 me-1" type="checkbox" v-model="isUnlimited.total">
                            <span class="small">(Non-Quota)</span> 
                          </div>
                        </div>
                        <div class="form-text mt-1" v-if="showAllocationWarning">
                           <span :class="remainingQuota === 0 ? 'text-success fw-bold' : 'text-danger fw-bold'">
                             <i :class="remainingQuota === 0 ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
                             {{ allocationMessage }}
                           </span>
                        </div>
                      </div>

                      <div class="col-6" v-if="formState.Gender === 'Ikhwan' || formState.Gender === 'ikhwan, akhwat'">
                        <label for="quotaIkhwan" class="form-label small">Kuota Ikhwan <span class="text-danger">*</span></label>
                        <div class="input-group">
                          <input 
                            type="number" 
                            class="form-control" 
                            id="quotaIkhwan" 
                            v-model.number="quotaValues.ikhwan" 
                            min="1"
                            :disabled="isUnlimited.ikhwan"
                            @input="validateMinOne('ikhwan')"
                            required
                          >
                          <div class="input-group-text bg-white">
                            <input class="form-check-input mt-0 me-1" type="checkbox" v-model="isUnlimited.ikhwan">
                            <span class="small" style="font-size: 0.7rem;">(Non-Quota)</span>
                          </div>
                        </div>
                      </div>

                      <div class="col-6" v-if="formState.Gender === 'Akhwat' || formState.Gender === 'ikhwan, akhwat'">
                        <label for="quotaAkhwat" class="form-label small">Kuota Akhwat <span class="text-danger">*</span></label>
                        <div class="input-group">
                          <input 
                            type="number" 
                            class="form-control" 
                            id="quotaAkhwat" 
                            v-model.number="quotaValues.akhwat" 
                            min="1"
                            :disabled="isUnlimited.akhwat"
                            @input="validateMinOne('akhwat')"
                            required
                          >
                          <div class="input-group-text bg-white">
                            <input class="form-check-input mt-0 me-1" type="checkbox" v-model="isUnlimited.akhwat">
                            <span class="small" style="font-size: 0.7rem;">(Non-Quota)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        <div class="modal-footer border-0 pt-0 pb-4 pe-4">
          <button type="button" class="btn btn-light px-4" @click="close">Batal</button>
          <button 
            type="submit" 
            form="daurohBasicForm" 
            class="btn btn-primary px-4 shadow-sm" 
            :disabled="isLoading || isQuotaMismatch"
            :title="isQuotaMismatch ? 'Total kuota harus sama dengan jumlah Ikhwan + Akhwat' : ''"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'Menyimpan...' : 'Simpan Event' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { watch, reactive, computed } from 'vue';
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

const getInitialFormState = () => ({
  SK: '', 
  Title: '',
  Gender: '',
  Place: '',
  Price: 0,
  IsActive: true,
  // [REVISI] Split Date & Time Variables
  RegStartDate: '',
  RegStartTime: '',
  RegEndDate: '',
  RegEndTime: '',
});

const formState = reactive(getInitialFormState());

// State untuk input angka
const quotaValues = reactive({
  total: 0,
  ikhwan: 0,
  akhwat: 0
});

// State untuk checkbox unlimited
const isUnlimited = reactive({
  total: false,
  ikhwan: false,
  akhwat: false
});

// Validasi Input
const validateMinOne = (field: 'total' | 'ikhwan' | 'akhwat') => {
    if (isUnlimited[field]) return; 
    if (quotaValues[field] === 0) {
        quotaValues[field] = 1; 
    }
};

const remainingQuota = computed(() => {
  return quotaValues.total - (quotaValues.ikhwan + quotaValues.akhwat);
});
const isQuotaMismatch = computed(() => {
  if (formState.Gender !== 'ikhwan, akhwat') return false; 
  if (isUnlimited.total || isUnlimited.ikhwan || isUnlimited.akhwat) return false;
  return remainingQuota.value !== 0;
});
const showAllocationWarning = computed(() => {
  return formState.Gender === 'ikhwan, akhwat' && !isUnlimited.total && !isUnlimited.ikhwan && !isUnlimited.akhwat;
});
const allocationMessage = computed(() => {
  if (remainingQuota.value === 0) return 'Alokasi Pas (Siap Simpan)';
  if (remainingQuota.value > 0) return `Kurang ${remainingQuota.value} lagi`;
  return `Kelebihan ${Math.abs(remainingQuota.value)}`;
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
      formState.IsActive = props.dauroh.IsActive ?? true;
      
      // [REVISI LOGIC] Pecah string "YYYY-MM-DD HH:mm:ss" menjadi Tanggal dan Jam
      if (props.dauroh.Registration) {
         // Start
         const startStr = props.dauroh.Registration.start_registration || '';
         const [sDate, sTime] = startStr.split(' ');
         formState.RegStartDate = sDate || '';
         formState.RegStartTime = sTime || '';

         // End
         const endStr = props.dauroh.Registration.end_registration || '';
         const [eDate, eTime] = endStr.split(' ');
         formState.RegEndDate = eDate || '';
         formState.RegEndTime = eTime || '';
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

watch(() => [isUnlimited.ikhwan, isUnlimited.akhwat], ([newIkhwan, newAkhwat]) => {
  if (newIkhwan || newAkhwat) {
    isUnlimited.total = true; 
    quotaValues.total = 0; 
  }
});

watch(() => isUnlimited.total, (isTotalUnlimited) => {
  if (!isTotalUnlimited) {
    if (isUnlimited.ikhwan) isUnlimited.ikhwan = false;
    if (isUnlimited.akhwat) isUnlimited.akhwat = false;
  }
});

const close = () => {
  if (!isLoading.value) emit('close');
};

const save = () => {
   if (isLoading.value) return;

   if (isQuotaMismatch.value) {
      Swal.fire({
         icon: 'error',
         title: 'Alokasi Kuota Salah',
         text: `Total (${quotaValues.total}) harus sama dengan Ikhwan (${quotaValues.ikhwan}) + Akhwat (${quotaValues.akhwat}). ${allocationMessage.value}.`
      });
      return;
   }

   const formElement = document.getElementById('daurohBasicForm') as HTMLFormElement;
   if (formElement && !formElement.checkValidity()) {
       formElement.reportValidity();
       return;
   }

   const finalQuotaTotal = isUnlimited.total ? 'non-quota' : quotaValues.total;
   const finalQuotaIkhwan = isUnlimited.ikhwan ? 'non-quota' : quotaValues.ikhwan;
   const finalQuotaAkhwat = isUnlimited.akhwat ? 'non-quota' : quotaValues.akhwat;

  const dataToEmit = {
    SK: props.isEditing ? formState.SK : null,
    Title: formState.Title,
    Gender: formState.Gender,
    Place: formState.Place,
    Price: formState.Price,
    Quota_Total: finalQuotaTotal,
    Quota_Ikhwan: finalQuotaIkhwan,
    Quota_Akhwat: finalQuotaAkhwat,
    IsActive: formState.IsActive,
    
    // [REVISI LOGIC] Gabungkan Tanggal + Spasi + Jam untuk dikirim ke Backend
    Registration: {
        start_registration: `${formState.RegStartDate} ${formState.RegStartTime}`,
        end_registration: `${formState.RegEndDate} ${formState.RegEndTime}`
    }
  };

  emit('save', { daurohData: dataToEmit as any, photoBase64: null });
};
</script>

<style scoped>
.modal { 
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 1060 !important; 
}
.modal-backdrop {
  z-index: 1055 !important;
}
.text-xs { font-size: 0.75rem; margin-top: 0.25rem; }
.input-group-text { padding: 0.375rem 0.5rem; }
.is-invalid {
  border-color: #dc3545;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
</style>