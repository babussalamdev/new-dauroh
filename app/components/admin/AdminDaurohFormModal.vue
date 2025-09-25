<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Edit Dauroh' : 'Tambah Dauroh Baru' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="daurohTitle" class="form-label">Judul Dauroh</label>
            <input type="text" class="form-control" id="daurohTitle" v-model="editableDauroh.title">
          </div>
          <div class="mb-3">
            <label for="daurohGenre" class="form-label">Genre/Kategori</label>
            <input type="text" class="form-control" id="daurohGenre" v-model="editableDauroh.genre">
          </div>
          <div class="mb-3">
            <label for="daurohPoster" class="form-label">URL Poster</label>
            <input type="text" class="form-control" id="daurohPoster" v-model="editableDauroh.poster" placeholder="https:// ...">
          </div>
          <div v-if="editableDauroh.poster" class="mb-3 text-center">
            <p class="form-label mb-2">Preview Gambar:</p>
            <img :src="editableDauroh.poster" alt="Poster Preview" class="img-fluid rounded" style="max-height: 200px;">
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

<script setup>
import { watch, reactive } from 'vue';

const props = defineProps({
  show: Boolean,
  isEditing: Boolean,
  dauroh: Object,
});

const emit = defineEmits(['close', 'save']);

const editableDauroh = reactive({
  id: null,
  title: '',
  genre: '',
  poster: '',
});

watch(() => props.dauroh, (newDauroh) => {
  if (props.isEditing && newDauroh) {
    editableDauroh.id = newDauroh.id;
    editableDauroh.title = newDauroh.title;
    editableDauroh.genre = newDauroh.genre;
    editableDauroh.poster = newDauroh.poster;
  } else {
    editableDauroh.id = null;
    editableDauroh.title = '';
    editableDauroh.genre = '';
    editableDauroh.poster = '';
  }
}, { immediate: true });

const close = () => emit('close');
const save = () => {
  emit('save', { ...editableDauroh });
  close();
};
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>