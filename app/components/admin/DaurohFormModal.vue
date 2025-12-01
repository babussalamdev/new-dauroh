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
                    <h6 class="card-title mb-3 small fw-bold text-uppercase text-muted">Pengaturan Kuota (0 = Non-Quota/Unlimited)</h6>
                    
                    <div class="row g-3">
                      <div class="col-12" v-if="!isIkhwanDisabled && !isAkhwatDisabled">
                        <label for="quotaTotal" class="form-label small fw-bold">Total Kuota (Global) *</label>
                        <input type="number" class="form-control" id="quotaTotal" v-model.number="formState.Quota_Total" min="0" placeholder="0" required>
                        <div class="form-text text-xs" v-if="formState.Quota_Total > 0">
                          Sisa yang belum dialokasikan: <span :class="remainingQuota < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'">{{ remainingQuota }}</span>
                        </div>
                      </div>

                      <div class="col-6">
                        <label for="quotaIkhwan" class="form-label small">Kuota Ikhwan *</label>
                        <input 
                          type="number" 
                          class="form-control" 
                          id="quotaIkhwan" 
                          v-model.number="formState.Quota_Ikhwan" 
                          min="0" 
                          :disabled="isIkhwanDisabled"
                          :class="{'bg-secondary-subtle': isIkhwanDisabled}"
                          required
                        >
                      </div>
                      <div class="col-6">
                        <label for="quotaAkhwat" class="form-label small">Kuota Akhwat *</label>
                        <input 
                          type="number" 
                          class="form-control" 
                          id="quotaAkhwat" 
                          v-model.number="formState.Quota_Akhwat" 
                          min="0" 
                          :disabled="isAkhwatDisabled"
                          :class="{'bg-secondary-subtle': isAkhwatDisabled}"
                          required
                        >
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
          <button type="submit" form="daurohBasicForm" class="btn btn-primary" :disabled="isLoading">
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
  Quota_Total: 0,
  Quota_Ikhwan: 0,
  Quota_Akhwat: 0,
});

const formState = reactive(getInitialFormState());

const isIkhwanDisabled = computed(() => {
  return formState.Gender === 'Akhwat'; 
});

const isAkhwatDisabled = computed(() => {
  return formState.Gender === 'Ikhwan'; 
});

const remainingQuota = computed(() => {
  if (formState.Quota_Total === 0) return 0;
  return formState.Quota_Total - (formState.Quota_Ikhwan + formState.Quota_Akhwat);
});

const handleGenderChange = () => {
  if (formState.Gender === 'Ikhwan') {
    formState.Quota_Akhwat = 0;
    formState.Quota_Total = 0; // Reset total karena single gender tidak pakai total
  } else if (formState.Gender === 'Akhwat') {
    formState.Quota_Ikhwan = 0;
    formState.Quota_Total = 0;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    Object.assign(formState, getInitialFormState());
    if (props.isEditing && props.dauroh) {
      formState.SK = props.dauroh.SK || '';
      formState.Title = props.dauroh.Title || '';
      formState.Place = props.dauroh.Place || '';
      
      // [FIX] Normalisasi string Gender (misal: "akhwat" -> "Akhwat")
      const rawGender = props.dauroh.Gender || '';
      formState.Gender = rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase();
      
      formState.Price = props.dauroh.Price || 0;
      formState.Quota_Total = props.dauroh.Quota_Total || 0;
      formState.Quota_Ikhwan = props.dauroh.Quota_Ikhwan || 0;
      formState.Quota_Akhwat = props.dauroh.Quota_Akhwat || 0;
    }
  }
}, { immediate: true });

const close = () => {
  if (!isLoading.value) emit('close');
};

const save = () => {
   if (isLoading.value) return;

   const formElement = document.getElementById('daurohBasicForm') as HTMLFormElement;
   // [INFO] Validasi required akan dicek di sini secara otomatis oleh browser
   if (formElement && !formElement.checkValidity()) {
       formElement.reportValidity();
       return;
   }

   // Validasi Total hanya jika Umum
   if (formState.Gender === 'Umum' && formState.Quota_Total > 0 && remainingQuota.value !== 0) {
     Swal.fire({
       icon: 'error',
       title: 'Pembagian Kuota Tidak Sesuai',
       text: `Total Kuota ditetapkan ${formState.Quota_Total}, tapi jumlah Ikhwan + Akhwat = ${formState.Quota_Ikhwan + formState.Quota_Akhwat}. Selisih: ${remainingQuota.value}. Harap sesuaikan.`
     });
     return;
   }

  const dataToEmit = {
    SK: props.isEditing ? formState.SK : null,
    Title: formState.Title,
    Gender: formState.Gender,
    Place: formState.Place,
    Price: formState.Price,
    Quota_Total: formState.Quota_Total,
    Quota_Ikhwan: formState.Quota_Ikhwan,
    Quota_Akhwat: formState.Quota_Akhwat,
  };

  emit('save', { daurohData: dataToEmit as any, photoBase64: null });
};
</script>

<style scoped>
/* [FIX] Z-Index tinggi agar modal edit ada di paling depan */
.modal { 
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 1060 !important; 
}
.modal-backdrop {
  z-index: 1055 !important;
}
.text-xs { font-size: 0.75rem; margin-top: 0.25rem; }
</style>