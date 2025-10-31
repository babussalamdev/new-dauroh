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
                <input
                  type="text"
                  class="form-control"
                  id="daurohTitleModal"
                  v-model="formState.Title"
                  required
                >
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
                <input
                  type="text"
                  class="form-control"
                  id="daurohPlaceModal"
                  v-model="formState.Place"
                  placeholder="cth: Masjid Babussalam"
                >
              </div>

              <div class="col-12">
                <label for="daurohPriceModal" class="form-label">Harga Tiket</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    type="number"
                    class="form-control"
                    id="daurohPriceModal"
                    v-model.number="formState.Price"
                    placeholder="0 (Gratis)"
                    min="0"
                  >
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
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
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
import type { Dauroh, DaurohBasicData } from '@/stores/dauroh'; // Pastikan DaurohBasicData diimpor jika belum
import { useDaurohStore } from '@/stores/dauroh';

const props = defineProps<{
  show: boolean;
  isEditing: boolean;
  dauroh?: Partial<Dauroh>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: {
    // Sesuaikan Omit jika Dauroh memiliki properti 'id' yang tidak ingin dikirim
    daurohData: Omit<Dauroh, 'id' | 'Date' | 'poster' | 'kuota' | 'description' | 'pemateri'>;
    photoBase64: null;
  }): void;
}>();

const daurohStore = useDaurohStore();
const isLoading = computed(() => daurohStore.loading.savingBasic);

// state awal form - Gunakan Uppercase
const getInitialFormState = () => ({
  sk: '',
  Title: '',
  Gender: '',
  Place: '',
  Price: 0,
});

const formState = reactive(getInitialFormState());

// reset form tiap kali modal kebuka
watch(() => props.show, (newVal) => {
  if (newVal) {
    Object.assign(formState, getInitialFormState());
    if (props.isEditing && props.dauroh) {
      formState.sk = props.dauroh.sk || '';
      formState.Title = props.dauroh.Title || '';
      formState.Place = props.dauroh.Place || '';
      formState.Gender = props.dauroh.Gender || '';
      formState.Price = props.dauroh.Price || 0;
    }
  }
}, { immediate: true });

const close = () => {
  if (!isLoading.value) emit('close');
};

const save = () => {
   if (isLoading.value) {
       return;
   }

   // Validasi form HTML5
   const formElement = document.getElementById('daurohBasicForm') as HTMLFormElement;
   if (formElement && !formElement.checkValidity()) {
       console.log('Save prevented: Form is invalid according to HTML5 validation.'); // <-- LOG INI
       formElement.reportValidity(); // Tampilkan pesan validasi browser
       return;
   }

  const dataToEmit = {
    sk: props.isEditing ? formState.sk : null,
    Title: formState.Title,
    Gender: formState.Gender,
    Place: formState.Place,
    Price: formState.Price,
  };

  // Emit dengan type assertion untuk memastikan tipe sesuai
  emit('save', { daurohData: dataToEmit as Omit<Dauroh, 'id' | 'Date' | 'poster' | 'kuota' | 'description' | 'pemateri'>, photoBase64: null });
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>