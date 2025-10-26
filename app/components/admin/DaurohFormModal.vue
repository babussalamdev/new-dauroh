// app/components/admin/DaurohFormModal.vue
<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered"> <div class="modal-content">
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
                   <option value="ikhwan, akhwat">Ikhwan & Akhwat (pisah)</option> </select>
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

            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Batal</button>
          <button type="submit" form="daurohBasicForm" class="btn btn-primary">Simpan</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
  </template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import type { Dauroh } from '@/stores/dauroh' // Pastikan path import benar

// Props
const props = defineProps<{
  show: boolean
  isEditing: boolean
  // Menerima Dauroh lengkap, tapi hanya menggunakan data dasar
  dauroh?: Dauroh
}>()

// Emits
// Payload HANYA berisi data dasar, photoBase64 selalu null
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { daurohData: Omit<Dauroh, 'Date' | 'poster' | 'scheduleDays'>, photoBase64: null }): void
}>()

// State Awal Form (Hanya data dasar)
const getInitialFormState = () => ({
  id: null as number | null,
  Title: '',
  Gender: '', // Default value sesuai kebutuhan
  Place: '',
  Price: 0,
  // TIDAK ADA currentPosterUrl
});

// Reactive state form
const formState = reactive(getInitialFormState());

// Watcher untuk isi/reset form
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Selalu reset ke state awal dulu
    Object.assign(formState, getInitialFormState());
    // Jika mode edit dan ada data, isi formState
    if (props.isEditing && props.dauroh) {
      formState.id = props.dauroh.id;
      formState.Title = props.dauroh.Title;
      formState.Place = props.dauroh.Place || '';
      formState.Gender = props.dauroh.Gender || '';
      formState.Price = props.dauroh.Price || 0;
    }
  }
}, { immediate: true }) // immediate true agar state awal benar

// Tutup modal
const close = () => emit('close')

// Simpan data event dasar
const save = () => {
    // Kirim hanya data yang relevan, photoBase64 selalu null
    emit('save', { daurohData: {
      ...formState,
      Place: ''
    }, photoBase64: null })
    // Jangan close modal di sini, biarkan parent (TiketDaurohManager) yang handle
}
</script>

<style scoped>
/* Style modal tidak perlu diubah, bisa ambil dari style sebelumnya */
.modal {
  background-color: rgba(0,0,0,0.5);
}
/* Hapus style terkait poster */
</style>