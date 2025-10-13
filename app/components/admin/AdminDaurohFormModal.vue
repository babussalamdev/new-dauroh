<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Dauroh' : 'Tambah Dauroh Baru' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="save">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="daurohTitle" class="form-label">Judul Dauroh</label>
                <input type="text" class="form-control" id="daurohTitle" v-model="editableDauroh.title" required>
              </div>
              <div class="col-md-6">
                <label for="daurohGenre" class="form-label">Genre/Kategori</label>
                <input type="text" class="form-control" id="daurohGenre" v-model="editableDauroh.genre" required>
              </div>
              <div class="col-md-6">
                <label for="daurohKuota" class="form-label">Kuota Peserta</label>
                <input type="number" class="form-control" id="daurohKuota" v-model.number="editableDauroh.kuota">
              </div>
              <div class="col-md-6">
                <label for="daurohPemateri" class="form-label">Pemateri (pisahkan dengan koma)</label>
                <input type="text" class="form-control" id="daurohPemateri" v-model="editableDauroh.pemateri" placeholder="cth: Ustadz A, Ustadz B">
              </div>
              <div class="col-md-6">
                <label for="daurohWaktu" class="form-label">Waktu</label>
                <input type="text" class="form-control" id="daurohWaktu" v-model="editableDauroh.waktu" placeholder="cth: 10 Juni 2025 09:00">
              </div>
              <div class="col-md-6">
                <label for="daurohTempat" class="form-label">Tempat</label>
                <input type="text" class="form-control" id="daurohTempat" v-model="editableDauroh.tempat">
              </div>
              
              <div class="col-12">
                <label for="daurohPosterFile" class="form-label">Pilih Poster</label>
                <input type="file" class="form-control" id="daurohPosterFile" @change="handleFileChange" accept="image/*">
              </div>
              <div class="col-12" v-if="imagePreviewUrl">
                <p class="form-label mb-2">Preview Gambar:</p>
                <img :src="imagePreviewUrl" alt="Poster Preview" class="img-fluid rounded" style="max-height: 200px;">
              </div>
              <div class="col-12">
                <label for="daurohFasilitas" class="form-label">Fasilitas (pisahkan dengan koma)</label>
                <input type="text" class="form-control" id="daurohFasilitas" v-model="fasilitasInput" placeholder="cth: Sertifikat, Makan Siang">
              </div>
              <div class="col-12">
                <label for="daurohSyarat" class="form-label">Syarat & Ketentuan</label>
                <textarea class="form-control" id="daurohSyarat" rows="3" v-model="editableDauroh.syarat"></textarea>
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
import { watch, reactive, ref } from 'vue'
import type { Dauroh } from '@/stores/dauroh'

const props = defineProps<{
  show: boolean
  isEditing: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { daurohData: Dauroh, file: File | null }): void
}>()

// State untuk data form
const editableDauroh = reactive<Dauroh>({ id: null, title: '', genre: '', poster: '', kuota: undefined, pemateri: '', waktu: '', tempat: '', fasilitas: '', syarat: '' })
const fasilitasInput = ref('')
const imagePreviewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

// Fungsi untuk menangani pemilihan file
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
    imagePreviewUrl.value = props.isEditing ? props.dauroh?.poster || null : null;
  }
}

// Watcher untuk mengisi atau mengosongkan form
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEditing && props.dauroh) {
      Object.assign(editableDauroh, props.dauroh)
      fasilitasInput.value = props.dauroh.fasilitas || ''
      imagePreviewUrl.value = props.dauroh.poster // Tampilkan poster yang sudah ada
      selectedFile.value = null // Reset file yang dipilih
    } else {
      // Reset semua field untuk form tambah baru
      Object.assign(editableDauroh, { id: null, title: '', genre: '', poster: '', kuota: undefined, pemateri: '', waktu: '', tempat: '', fasilitas: '', syarat: '' })
      fasilitasInput.value = ''
      imagePreviewUrl.value = null
      selectedFile.value = null
    }
  }
}, { immediate: true })

const close = () => emit('close')

const save = () => {
  editableDauroh.fasilitas = fasilitasInput.value
  // Kirim data dan file sebagai satu payload
  emit('save', { daurohData: { ...editableDauroh }, file: selectedFile.value })
}
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>