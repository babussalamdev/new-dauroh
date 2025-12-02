<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Info Dasar Event' : 'Tambah Event Baru' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="save" id="daurohBasicForm">
            <div class="row g-3">
              <div class="col-12">
                <label for="daurohTitleModal" class="form-label">Nama Event *</label>
                <input type="text" class="form-control" id="daurohTitleModal" v-model="formState.Title" required>
              </div>

              <div class="col-md-6">
                <label for="daurohGenderModal" class="form-label">Target Peserta *</label>
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
                  <option value="Umum">Umum (Ikhwan & Akhwat)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="daurohPlaceModal" class="form-label">Tempat *</label>
                <input type="text" class="form-control" id="daurohPlaceModal" v-model="formState.Place" placeholder="cth: Masjid Babussalam" required>
              </div>

              <div class="col-12">
                <label for="daurohPriceModal" class="form-label">Harga Tiket *</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input type="number" class="form-control" id="daurohPriceModal" v-model.number="formState.Price" placeholder="0 (Gratis)" min="0" required>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card bg-light border-0">
                  <div class="card-body py-3">
                    <h6 class="card-title mb-3 small fw-bold text-uppercase text-muted">Pengaturan Kuota</h6>
                    <p class="text-muted text-xs mb-3">Check "Unlimited" untuk tanpa batas kuota. Masukkan "0" untuk kuota Habis.</p>
                    
                    <div class="row g-3">
                      <div class="col-12" v-if="!isIkhwanDisabled && !isAkhwatDisabled">
                        <label for="quotaTotal" class="form-label small fw-bold">Total Kuota (Global) *</label>
                        <div class="input-group">
                          <input 
                            type="number" 
                            class="form-control" 
                            id="quotaTotal" 
                            v-model.number="quotaValues.total" 
                            min="0" 
                            placeholder="0" 
                            :disabled="isUnlimited.total"
                            :class="{'is-invalid': isQuotaMismatch}"
                            required
                          >
                          <div class="input-group-text bg-white">
                            <input class="form-check-input mt-0" type="checkbox" v-model="isUnlimited.total" aria-label="Unlimited Checkbox">
                            <span class="ms-2 small">Unlimited</span>
                          </div>
                        </div>
                        <div class="form-text mt-1" v-if="showAllocationWarning">
                           <span :class="remainingQuota === 0 ? 'text-success fw-bold' : 'text-danger fw-bold'">
                             <i :class="remainingQuota === 0 ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
                             {{ allocationMessage }}
                           </span>
                        </div>
                      </div>

                      <div class="col-6">
                        <label for="quotaIkhwan" class="form-label small">Kuota Ikhwan *</label>
                        <div class="input-group">
                          <input 
                            type="number" 
                            class="form-control" 
                            id="quotaIkhwan" 
                            v-model.number="quotaValues.ikhwan" 
                            min="0" 
                            :disabled="isIkhwanDisabled || isUnlimited.ikhwan"
                            :class="{'bg-secondary-subtle': isIkhwanDisabled}"
                            required
                          >
                          <div class="input-group-text bg-white" v-if="!isIkhwanDisabled">
                            <input class="form-check-input mt-0" type="checkbox" v-model="isUnlimited.ikhwan">
                            <span class="ms-1 small" style="font-size: 0.7rem;">Unlim.</span>
                          </div>
                        </div>
                      </div>

                      <div class="col-6">
                        <label for="quotaAkhwat" class="form-label small">Kuota Akhwat *</label>
                        <div class="input-group">
                          <input 
                            type="number" 
                            class="form-control" 
                            id="quotaAkhwat" 
                            v-model.number="quotaValues.akhwat" 
                            min="0" 
                            :disabled="isAkhwatDisabled || isUnlimited.akhwat"
                            :class="{'bg-secondary-subtle': isAkhwatDisabled}"
                            required
                          >
                          <div class="input-group-text bg-white" v-if="!isAkhwatDisabled">
                            <input class="form-check-input mt-0" type="checkbox" v-model="isUnlimited.akhwat">
                            <span class="ms-1 small" style="font-size: 0.7rem;">Unlim.</span>
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

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Batal</button>
          <button 
            type="submit" 
            form="daurohBasicForm" 
            class="btn btn-primary" 
            :disabled="isLoading || isQuotaMismatch"
            :title="isQuotaMismatch ? 'Total kuota harus sama dengan jumlah Ikhwan + Akhwat' : ''"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
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

const isIkhwanDisabled = computed(() => {
  return formState.Gender === 'Akhwat'; 
});

const isAkhwatDisabled = computed(() => {
  return formState.Gender === 'Ikhwan'; 
});

// [BARU] Menghitung selisih kuota
const remainingQuota = computed(() => {
  return quotaValues.total - (quotaValues.ikhwan + quotaValues.akhwat);
});

// [BARU] Logika untuk memblokir tombol simpan
// Hanya aktif jika Gender = Umum DAN Total tidak unlimited DAN Sub-kuota tidak unlimited
const isQuotaMismatch = computed(() => {
  if (formState.Gender !== 'Umum') return false; 
  if (isUnlimited.total || isUnlimited.ikhwan || isUnlimited.akhwat) return false;
  
  return remainingQuota.value !== 0;
});

// [BARU] Helper untuk menampilkan pesan peringatan
const showAllocationWarning = computed(() => {
  return formState.Gender === 'Umum' && !isUnlimited.total && !isUnlimited.ikhwan && !isUnlimited.akhwat;
});

const allocationMessage = computed(() => {
  if (remainingQuota.value === 0) return 'Alokasi Pas (Siap Simpan)';
  if (remainingQuota.value > 0) return `Kurang ${remainingQuota.value} lagi`;
  return `Kelebihan ${Math.abs(remainingQuota.value)}`;
});

const handleGenderChange = () => {
  if (formState.Gender === 'Ikhwan') {
    quotaValues.akhwat = 0;
    isUnlimited.akhwat = false;
    quotaValues.total = 0; 
    isUnlimited.total = false;
  } else if (formState.Gender === 'Akhwat') {
    quotaValues.ikhwan = 0;
    isUnlimited.ikhwan = false;
    quotaValues.total = 0;
    isUnlimited.total = false;
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
      
      const rawGender = props.dauroh.Gender || '';
      formState.Gender = rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase();
      
      formState.Price = props.dauroh.Price || 0;

      const qTotal = props.dauroh.Quota_Total;
      const qIkhwan = props.dauroh.Quota_Ikhwan;
      const qAkhwat = props.dauroh.Quota_Akhwat;

      if (qTotal === 'non-quota') { isUnlimited.total = true; quotaValues.total = 0; }
      else { isUnlimited.total = false; quotaValues.total = Number(qTotal) || 0; }

      if (qIkhwan === 'non-quota') { isUnlimited.ikhwan = true; quotaValues.ikhwan = 0; }
      else { isUnlimited.ikhwan = false; quotaValues.ikhwan = Number(qIkhwan) || 0; }

      if (qAkhwat === 'non-quota') { isUnlimited.akhwat = true; quotaValues.akhwat = 0; }
      else { isUnlimited.akhwat = false; quotaValues.akhwat = Number(qAkhwat) || 0; }
    }
  }
}, { immediate: true });

const close = () => {
  if (!isLoading.value) emit('close');
};

const save = () => {
   if (isLoading.value) return;

   // [SAFETY CHECK] Meskipun tombol disabled, kita tetap cek di sini untuk keamanan
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
/* Style tambahan untuk form validasi */
.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
</style>