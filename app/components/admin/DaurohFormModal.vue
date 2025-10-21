<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Event' : 'Tambah Event Baru' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="save">
            <div class="row g-3">
              <div class="col-12 mb-3 text-center">
                 <label class="form-label d-block fw-medium mb-2">Poster Event</label>
                 <div class="poster-container d-inline-block mx-auto position-relative">
                   <img
                     v-if="formState.currentPosterUrl"
                     :src="formState.currentPosterUrl"
                     alt="Preview Poster"
                     class="img-fluid rounded shadow-sm poster-preview d-block"
                   />
                   <div v-else class="poster-preview-placeholder d-flex justify-content-center align-items-center text-muted">
                       <span>Belum ada poster</span>
                   </div>

                   <button
                    type="button"
                    class="btn btn-sm btn-light btn-edit-poster position-absolute top-0 end-0 m-2"
                    @click="showPhotoModal = true"
                    title="Ganti Poster"
                   >
                     <i class="bi bi-pencil-square"></i>
                   </button>
                 </div>
              </div>

              <div class="col-12">
                <label for="daurohTitle" class="form-label">Nama Event *</label>
                <input type="text" class="form-control" id="daurohTitle" v-model="formState.title" required>
              </div>

              <div class="col-md-6">
                <label for="daurohGender" class="form-label">Target Peserta</label>
                <select class="form-select" id="daurohGender" v-model="formState.gender">
                  <option disabled value="">Pilih target peserta</option>
                  <option value="Ikhwan">Ikhwan</option>
                  <option value="Akhwat">Akhwat</option>
                  <option value="Umum">Umum (Ikhwan & Akhwat)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="daurohPlace" class="form-label">Tempat</label>
                <input type="text" class="form-control" id="daurohPlace" v-model="formState.place" placeholder="cth: Masjid Babussalam">
              </div>

              <div class="col-12">
                <label for="daurohPrice" class="form-label">Harga Tiket</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input type="number" class="form-control" id="daurohPrice" v-model.number="formState.price" placeholder="0 (Gratis)" min="0">
                </div>
              </div>

            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Batal</button>
          <button type="button" class="btn btn-primary" @click="save">Simpan</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
  <ModalsPhotoUploadModal
    :show="showPhotoModal"
    :initial-preview-url="formState.currentPosterUrl"
    @close="showPhotoModal = false"
    @photo-uploaded="handlePhotoResult"
   />

</template>

<script setup lang="ts">
import { watch, reactive, ref } from 'vue'
import type { Dauroh } from '@/stores/dauroh'

// Props
const props = defineProps<{
  show: boolean
  isEditing: boolean
  dauroh?: Dauroh
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { daurohData: Omit<typeof formState, 'currentPosterUrl'>, photoBase64: string | null }): void
}>()

// State Awal Form
const getInitialFormState = () => ({
  id: null as number | null,
  title: '',
  gender: '',
  place: '',
  price: 0,
  currentPosterUrl: null as string | null // Default null
});

// Reactive state form & state modal
const formState = reactive(getInitialFormState());
const newPhotoBase64 = ref<string | null>(null);
const showPhotoModal = ref(false);

// Watcher untuk isi/reset form
watch(() => props.show, (newVal) => {
  if (newVal) {
    newPhotoBase64.value = null;
    if (props.isEditing && props.dauroh) {
      formState.id = props.dauroh.id;
      formState.title = props.dauroh.Title;
      formState.place = props.dauroh.place || '';
      formState.gender = props.dauroh.Gender || '';
      formState.price = props.dauroh.price || 0;
      formState.currentPosterUrl = props.dauroh.poster || null; // Ambil poster dari props, atau null
    } else {
      Object.assign(formState, getInitialFormState());
    }
  }
}, { immediate: true })

// Tutup modal utama
const close = () => emit('close')

// Terima hasil dari modal foto
const handlePhotoResult = (base64Data: string) => {
  newPhotoBase64.value = base64Data;
  formState.currentPosterUrl = base64Data;
  showPhotoModal.value = false;
};

// Simpan data event
const save = () => {
    const { currentPosterUrl, ...daurohDataToSend } = formState;
    emit('save', { daurohData: daurohDataToSend, photoBase64: newPhotoBase64.value })
}
</script>

<style scoped>
.modal { 
  background-color: rgba(0,0,0,0.5); 
}
.poster-container { 
  max-width: 250px; 
  background-color: var(--bs-tertiary-bg); 
  border: 1px solid var(--bs-border-color); 
  border-radius: 0.375rem; 
  overflow: hidden; 
}
.poster-preview { 
  max-height: 300px; 
  width: 100%; 
  object-fit: contain; 
}
.poster-preview-placeholder { 
  height: 200px; 
  width: 100%; 
  background-color: var(--bs-secondary-bg); 
  font-size: 0.9rem; 
}
.btn-edit-poster { 
  padding: 0.25rem 0.5rem; 
  font-size: 0.8rem; 
  line-height: 1; 
  background-color: rgba(255, 255, 255, 0.8); 
  backdrop-filter: blur(2px); 
  border: 1px solid rgba(0, 0, 0, 0.1); 
}
.btn-edit-poster:hover { 
  background-color: rgba(255, 255, 255, 1); 
}
.form-label.fw-medium { 
  font-weight: 500; 
  }
</style>