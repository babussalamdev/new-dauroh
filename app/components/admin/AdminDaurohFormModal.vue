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

              <div class="col-12">
                <label for="daurohTitle" class="form-label">Nama Event</label>
                <input type="text" class="form-control" id="daurohTitle" v-model="formState.title" required>
              </div>

              <div class="col-12">
                <label for="daurohGender" class="form-label">Gender</label>
                <select class="form-select" id="daurohGender" v-model="formState.gender">
                  <option disabled value="">Pilih target peserta</option>
                  <option value="Ikhwan">Ikhwan</option>
                  <option value="Akhwat">Akhwat</option>
                  <option value="Umum">Umum (Ikhwan & Akhwat)</option>
                </select>
              </div>

              <div class="col-12">
                <label for="daurohPlace" class="form-label">Tempat</label>
                <input type="text" class="form-control" id="daurohPlace" v-model="formState.place" placeholder="cth: Masjid Babussalam">
              </div>

              <div class="col-12">
                <label for="daurohPrice" class="form-label">Harga Tiket</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input type="number" class="form-control" id="daurohPrice" v-model.number="formState.price" placeholder="0" min="0">
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
</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import type { Dauroh } from '@/stores/dauroh'

const props = defineProps<{
  show: boolean
  isEditing: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { daurohData: any }): void // File tidak lagi dikirim
}>()

// State disederhanakan
const getInitialFormState = () => ({
  id: null as number | null,
  title: '',
  gender: '',
  place: '',
  price: 0,
});

const formState = reactive(getInitialFormState());

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEditing && props.dauroh) {
      // Logika untuk mode edit
      formState.id = props.dauroh.id;
      formState.title = props.dauroh.Title;
      formState.place = props.dauroh.place || '';
      formState.gender = props.dauroh.Gender || '';
      formState.price = props.dauroh.price || 0;
    } else {
      // Reset form untuk mode tambah
      Object.assign(formState, getInitialFormState());
    }
  }
}, { immediate: true })

const close = () => emit('close')

const save = () => {
  // Hanya kirim 'daurohData', tanpa 'file'
  emit('save', { daurohData: formState })
}
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>