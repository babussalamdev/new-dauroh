<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
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
                 <label class="form-label">Jadwal Event</label>
                 <div v-for="(day, index) in formState.days" :key="index" class="row g-2 mb-2 align-items-end">
                    <div class="col-md">
                      <label class="form-label small">Hari ke-{{ index + 1 }}</label>
                      <input type="date" class="form-control" v-model="day.date">
                    </div>
                    <div class="col-md">
                      <label class="form-label small">Waktu Mulai</label>
                      <input type="time" class="form-control" v-model="day.startTime">
                    </div>
                    <div class="col-md">
                      <label class="form-label small">Waktu Selesai</label>
                      <input type="time" class="form-control" v-model="day.endTime">
                    </div>
                    <div class="col-auto">
                      <button type="button" class="btn btn-danger" @click="removeDay(index)" v-if="formState.days.length > 1">
                        -
                      </button>
                    </div>
                 </div>
                 <button type="button" class="btn btn-outline-primary mt-2" @click="addDay">
                   + Tambah Hari
                 </button>
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

              <div class="col-12">
                <label for="daurohPosterFile" class="form-label">Poster (Opsional)</label>
                <input type="file" class="form-control" id="daurohPosterFile" @change="handleFileChange" accept="image/*">
              </div>
              <div class="col-12" v-if="imagePreviewUrl">
                <p class="form-label mb-2">Preview Gambar:</p>
                <img :src="imagePreviewUrl" alt="Poster Preview" class="img-fluid rounded" style="max-height: 200px;">
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

interface Day {
  date: string;
  startTime: string;
  endTime: string;
}

const props = defineProps<{
  show: boolean
  isEditing: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { daurohData: any, file: File | null }): void
}>()

const getInitialFormState = () => ({
  id: null as number | null,
  title: '',
  gender: '',
  place: '',
  price: 0,
  days: [{ date: '', startTime: '', endTime: '' }] as Day[],
  poster: ''
});

const formState = reactive(getInitialFormState());
const imagePreviewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const addDay = () => {
  formState.days.push({ date: '', startTime: '', endTime: '' });
}

const removeDay = (index: number) => {
  if (formState.days.length > 1) {
    formState.days.splice(index, 1);
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
    imagePreviewUrl.value = props.isEditing ? formState.poster : null;
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEditing && props.dauroh) {
      formState.id = props.dauroh.id;
      formState.title = props.dauroh.Title;
      formState.place = props.dauroh.place;
      formState.gender = props.dauroh.Gender || '';
      formState.price = props.dauroh.price || 0;
      formState.poster = props.dauroh.poster || '';
      
      // ===== BAGIAN YANG DIPERBAIKI =====
      // Mengubah objek 'Date' dari props menjadi array 'days' untuk form
      if (props.dauroh.Date && Object.keys(props.dauroh.Date).length > 0) {
        formState.days = Object.values(props.dauroh.Date).map(dayData => ({
          date: dayData.date || '',
          startTime: dayData.start_time || '', // Konversi snake_case ke camelCase
          endTime: dayData.end_time || '',   // Konversi snake_case ke camelCase
        }));
      } else {
         formState.days = [{ date: '', startTime: '', endTime: '' }];
      }
      // ===================================

      imagePreviewUrl.value = formState.poster;
    
    } else {
      Object.assign(formState, getInitialFormState());
      imagePreviewUrl.value = null;
      selectedFile.value = null;
    }
  }
}, { immediate: true })

const close = () => emit('close')

const save = () => {
  emit('save', { daurohData: formState, file: selectedFile.value })
}
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
.small {
  font-size: 0.8rem;
  color: #6c757d;
}
</style>