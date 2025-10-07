<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Dauroh' : 'Tambah Dauroh Baru' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Judul Dauroh</label>
              <input type="text" class="form-control" v-model="editableDauroh.title">
            </div>
            <div class="col-md-6">
              <label class="form-label">Genre/Kategori</label>
              <input type="text" class="form-control" v-model="editableDauroh.genre">
            </div>
            <div class="col-md-6">
              <label class="form-label">Kuota Peserta</label>
              <input type="number" class="form-control" v-model.number="editableDauroh.kuota">
            </div>
            <div class="col-md-6">
              <label class="form-label">Pemateri</label>
              <input type="text" class="form-control" v-model="editableDauroh.pemateri">
            </div>
            <div class="col-md-6">
              <label class="form-label">Waktu</label>
              <input type="text" class="form-control" v-model="editableDauroh.waktu" placeholder="cth: 10 Juni 2025 09:00">
            </div>
            <div class="col-md-6">
              <label class="form-label">Tempat</label>
              <input type="text" class="form-control" v-model="editableDauroh.tempat">
            </div>
            <div class="col-12">
              <label class="form-label">URL Poster</label>
              <input type="text" class="form-control" v-model="editableDauroh.poster" placeholder="https:// ...">
            </div>
            <div class="col-12" v-if="editableDauroh.poster">
              <p class="form-label mb-2">Preview Gambar:</p>
              <img :src="editableDauroh.poster" alt="Poster Preview" class="img-fluid rounded" style="max-height: 200px;">
            </div>
            <div class="col-12">
              <label class="form-label">Fasilitas (pisahkan dengan koma)</label>
              <input type="text" class="form-control" v-model="fasilitasInput">
            </div>
            <div class="col-12">
              <label class="form-label">Syarat & Ketentuan</label>
              <textarea class="form-control" rows="3" v-model="editableDauroh.syarat"></textarea>
            </div>
          </div>
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
import { watch, reactive, ref } from 'vue'
import type { Dauroh } from '@/stores/dauroh'

const props = defineProps<{
  show: boolean
  isEditing: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', val: Dauroh): void
}>()

// reactive sesuai interface Dauroh di store
const editableDauroh = reactive<Dauroh>({
  id: null,
  title: '',
  genre: '',
  poster: '',
  kuota: undefined,
  pemateri: '',
  waktu: '',
  tempat: '',
  fasilitas: '',
  syarat: ''
})

// input khusus untuk fasilitas (kalau mau array)
const fasilitasInput = ref('')

watch(
  () => props.dauroh,
  (newDauroh) => {
    if (props.isEditing && newDauroh) {
      Object.assign(editableDauroh, newDauroh)
      // fasilitas jadi string kalau array
      fasilitasInput.value = Array.isArray(newDauroh.fasilitas)
        ? newDauroh.fasilitas.join(', ')
        : (newDauroh.fasilitas || '')
    } else {
      editableDauroh.id = null
      editableDauroh.title = ''
      editableDauroh.genre = ''
      editableDauroh.poster = ''
      editableDauroh.kuota = undefined
      editableDauroh.pemateri = ''
      editableDauroh.waktu = ''
      editableDauroh.tempat = ''
      editableDauroh.fasilitas = ''
      editableDauroh.syarat = ''
      fasilitasInput.value = ''
    }
  },
  { immediate: true }
)

const close = () => emit('close')
const save = () => {
  // fasilitasInput diubah jadi string atau array sesuai kebutuhan
  editableDauroh.fasilitas = fasilitasInput.value
  emit('save', { ...editableDauroh })
}
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>
