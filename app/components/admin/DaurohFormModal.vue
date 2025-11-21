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
                <label for="daurohGenderModal" class="form-label">Target Peserta</label>
                <select class="form-select" id="daurohGenderModal" v-model="formState.Gender">
                  <option disabled value="">Pilih target peserta</option>
                  <option value="Ikhwan">Ikhwan</option>
                  <option value="Akhwat">Akhwat</option>
                  <option value="Umum">Umum (Ikhwan & Akhwat)</option>
                  <option value="ikhwan, akhwat">Ikhwan & Akhwat (pisah)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="daurohPlaceModal" class="form-label">Tempat</label>
                <input type="text" class="form-control" id="daurohPlaceModal" v-model="formState.Place" placeholder="cth: Masjid Babussalam">
              </div>

              <div class="col-12">
                <label for="daurohPriceModal" class="form-label">Harga Tiket</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input type="number" class="form-control" id="daurohPriceModal" v-model.number="formState.Price" placeholder="0 (Gratis)" min="0">
                </div>
              </div>
              
              <div class="col-md-6">
                <label for="daurohQuotaModal" class="form-label">Kuota Peserta</label>
                <input type="number" class="form-control" id="daurohQuotaModal" v-model.number="formState.Quota" placeholder="0 (Tak Terbatas)" min="0">
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

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  dauroh?: Partial<Dauroh>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: {
    daurohData: Omit<Dauroh, 'id' | 'Date' | 'Picture'>;
    photoBase64: null;
  }): void;
}>();

const daurohStore = useDaurohStore();
const isLoading = computed(() => daurohStore.loading.savingBasic);

// [REVISI] Gunakan SK (Kapital) di form state awal
const getInitialFormState = () => ({
  SK: '', 
  Title: '',
  Gender: '',
  Place: '',
  Price: 0,
  Quota: 0, // Init quota
});

const formState = reactive(getInitialFormState());

watch(() => props.show, (newVal) => {
  if (newVal) {
    Object.assign(formState, getInitialFormState());
    if (props.isEditing && props.dauroh) {
      // [REVISI] Ambil props.dauroh.SK
      formState.SK = props.dauroh.SK || '';
      formState.Title = props.dauroh.Title || '';
      formState.Place = props.dauroh.Place || '';
      formState.Gender = props.dauroh.Gender || '';
      formState.Price = props.dauroh.Price || 0;
      formState.Quota = props.dauroh.Kuota || 0; // Load quota
    }
  }
}, { immediate: true });

const close = () => {
  if (!isLoading.value) emit('close');
};

const save = () => {
   if (isLoading.value) return;

   const formElement = document.getElementById('daurohBasicForm') as HTMLFormElement;
   if (formElement && !formElement.checkValidity()) {
       formElement.reportValidity();
       return;
   }

  const dataToEmit = {
    // [REVISI] Gunakan SK (Kapital)
    SK: props.isEditing ? formState.SK : null,
    Title: formState.Title,
    Gender: formState.Gender,
    Place: formState.Place,
    Price: formState.Price,
    Quota: formState.Quota,
  };

  // Emit data
  emit('save', { daurohData: dataToEmit as any, photoBase64: null });
};
</script>

<style scoped>
.modal { background-color: rgba(0, 0, 0, 0.5); }
</style>