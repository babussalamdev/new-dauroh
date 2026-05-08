<template>
  <div v-if="show" class="modal fade show d-block backdrop-blur" tabindex="-1" @click.self="triggerShake">
    <div class="modal-dialog modal-dialog-centered modal-lg" :class="{ 'modal-shake': isShaking }">
      <div class="modal-content border-0 shadow-lg rounded-3 overflow-hidden">

        <div class="modal-header border-0 px-3 pt-3 pb-2 d-flex align-items-center">
          <div>
            <h5 class="modal-title txt-title fw-bold text-dark">Poster & Jadwal</h5>
            <p class="text-muted txt-caption mb-0">Lengkapi poster dan jadwal kegiatan event.</p>
          </div>
          <button type="button" class="btn-close shadow-none bg-light p-2 rounded-circle" @click="close"></button>
        </div>

        <div class="modal-body px-4 pb-4 pt-2">
          <form @submit.prevent="submitFinal" id="eventMediaForm">
            
            <div class="row g-4">
              <!-- 🟢 KOLOM KIRI: UPLOAD GAMBAR -->
              <div class="col-md-5 col-lg-4">
                <label class="form-label txt-label fw-bold text-muted mb-2">Poster Event <span class="text-danger">*</span></label>
                
                <div 
                  class="upload-area border-2 border-dashed rounded-4 p-3 text-center mx-auto position-relative bg-light transition-all"
                  :class="{ 'border-primary bg-primary bg-opacity-10': isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="d-none" id="posterUploadModal" />
                  
                  <div v-if="!imagePreview" class="w-100 py-4">
                    <i class="bi bi-image fs-1 text-primary opacity-50"></i>
                    <p class="txt-caption fw-medium mt-2 mb-3 text-muted">Pilih atau Drag Poster ke Sini</p>
                    <label for="posterUploadModal" class="btn btn-primary btn-sm px-4 rounded-pill shadow-sm txt-caption fw-bold cursor-pointer">
                      Browse File
                    </label>
                  </div>
                  
                  <div v-else class="w-100">
                    <div class="d-flex align-items-center justify-content-center bg-white rounded-3 shadow-sm border p-2 mb-3" style="height: 220px;">
                      <img :src="imagePreview" alt="Preview" class="img-fluid rounded" style="max-height: 100%; object-fit: contain;" />
                    </div>
                    <div class="d-flex justify-content-center gap-2">
                      <label for="posterUploadModal" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold txt-caption mb-0 cursor-pointer">
                        <i class="bi bi-arrow-repeat"></i> Ganti
                      </label>
                      <button type="button" class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold txt-caption" @click="removeImage">
                        <i class="bi bi-trash"></i> Hapus
                      </button>
                    </div>
                  </div>

                </div>
                <small class="text-muted txt-caption d-block mt-2 text-center">Format: JPG/PNG, Maks. 2MB</small>
              </div>

              <!-- 🟢 KOLOM KANAN: JADWAL EVENT (SISTEM MULTI-HARI) -->
              <div class="col-md-7 col-lg-8">
                <div class="p-3 rounded-4 bg-light border h-100 d-flex flex-column">
                  <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <h6 class="txt-body fw-bold text-dark mb-0">
                      <i class="bi bi-calendar-check text-primary me-2"></i> Jadwal Kegiatan
                    </h6>
                    <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3 txt-caption fw-bold" @click="addScheduleDay">
                      <i class="bi bi-plus-lg me-1"></i>Tambah Hari
                    </button>
                  </div>
                  
                  <div class="flex-grow-1 overflow-auto pe-2" style="max-height: 280px;">
                    <div v-if="scheduleDays.length === 0" class="text-center py-4 rounded-3 bg-white border border-dashed">
                      <p class="text-muted txt-caption mb-0">Belum ada jadwal. Klik "Tambah Hari".</p>
                    </div>

                    <div v-else class="d-flex flex-column gap-2">
                      <div v-for="(day, index) in scheduleDays" :key="day.tempId" class="bg-white p-2 rounded-3 border position-relative">
                        <div class="row g-2 align-items-end">
                          <div class="col-sm-5">
                            <label class="txt-caption fw-bold text-muted mb-1 ps-1" style="font-size: 0.7rem;">Tanggal <span class="text-danger">*</span></label>
                            <input type="date" class="form-control form-control-sm modern-input txt-body fw-bold" v-model="day.date" required>
                          </div>
                          <div class="col-sm-3">
                            <label class="txt-caption fw-bold text-muted mb-1 ps-1" style="font-size: 0.7rem;">Mulai <span class="text-danger">*</span></label>
                            <input type="time" class="form-control form-control-sm modern-input txt-body fw-bold" v-model="day.start_time" required>
                          </div>
                          <div class="col-sm-3">
                            <label class="txt-caption fw-bold text-muted mb-1 ps-1" style="font-size: 0.7rem;">Selesai <span class="text-danger">*</span></label>
                            <input type="time" class="form-control form-control-sm modern-input txt-body fw-bold" v-model="day.end_time" required>
                          </div>
                          <div class="col-sm-1 text-end pb-1">
                            <button type="button" class="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none" @click="removeScheduleDay(index)">
                              <i class="bi bi-trash fs-6"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </form>
        </div>

        <div class="modal-footer border-0 px-4 pb-3 pt-0 d-flex justify-content-between bg-white">
          <button type="button" class="btn btn-light px-4 rounded-pill text-muted txt-body fw-bold border" @click="back">
            <i class="bi bi-arrow-left me-1"></i> Kembali
          </button>
          <button 
            type="button" 
            @click="submitFinal"
            class="btn btn-primary px-4 rounded-pill txt-body fw-bold shadow-sm"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-floppy-fill me-1"></i> 
            {{ isLoading ? 'Menyimpan...' : 'Simpan Event' }}
          </button>
        </div>

      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAlert } from '~/utils/swal';
import { useEventStore } from '~/stores/event';

const props = defineProps<{
  show: boolean;
  basicData: any; 
}>();

const emit = defineEmits(['close', 'back', 'saveFinal']);
const { alert: swalAlert } = useAlert();
const eventStore = useEventStore();
const isLoading = computed(() => eventStore.loading.savingBasic);
const { isShaking, triggerShake } = useModalShake();
const imagePreview = ref<string | null>(null);
const imageBase64 = ref<string | null>(null);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
// State Jadwal Multi-hari
const scheduleDays = ref<any[]>([]);

// Bikin minimal 1 hari jadwal saat modal dibuka
watch(() => props.show, (newVal) => {
  if (newVal && scheduleDays.value.length === 0) {
    addScheduleDay();
  }
});

const addScheduleDay = () => {
  scheduleDays.value.push({ tempId: Date.now(), date: '', start_time: '', end_time: '' });
};

const removeScheduleDay = (index: number) => {
  scheduleDays.value.splice(index, 1);
};


const processFile = (file: File) => {
  if (file.size > 2 * 1024 * 1024) { 
    swalAlert('Ukuran Terlalu Besar', 'Maksimal ukuran gambar adalah 2MB.', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
    imageBase64.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    processFile(file);
  } else {
    swalAlert('Format Salah', 'Harap masukkan file gambar (JPG/PNG).', 'error');
  }
};

const removeImage = () => {
  imagePreview.value = null;
  imageBase64.value = null;
  if (fileInput.value) fileInput.value.value = ''; 
};

// Utils Waktu ke AM/PM
const close = () => emit('close');
const back = () => emit('back');

const convertTo12h = (timeStr: string) => {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; 
  return `${String(hour).padStart(2, '0')}.${minuteStr} ${ampm}`;
};

const submitFinal = () => {
  if (!imageBase64.value) {
    swalAlert('Poster Kosong', 'Harap upload poster event terlebih dahulu.', 'warning');
    return;
  }

  if (scheduleDays.value.length === 0) {
    swalAlert('Jadwal Kosong', 'Harap tambahkan minimal 1 hari jadwal kegiatan.', 'warning');
    return;
  }

  let isScheduleValid = true;
  const schedulePayload: any = {};

  scheduleDays.value.forEach((day, index) => {
    if(!day.date || !day.start_time || !day.end_time) {
      isScheduleValid = false;
      return;
    }

    const startStr = `${day.date} ${day.start_time}`;
    const endStr = `${day.date} ${day.end_time}`;
    
    if (new Date(endStr) <= new Date(startStr)) {
      isScheduleValid = false;
    }
    schedulePayload[`day_${index + 1}`] = {
      date: day.date,
      start_time: convertTo12h(day.start_time),
      end_time: convertTo12h(day.end_time)
    };
  });

  if (!isScheduleValid) {
    swalAlert('Jadwal Tidak Valid', 'Pastikan semua field terisi dan waktu selesai logis.', 'warning');
    return;
  }
  const rawBase64 = imageBase64.value.split(',')[1];
  const finalPayload = {
    ...props.basicData,
    Date: schedulePayload, 
    Picture: rawBase64
  };

  emit('saveFinal', finalPayload);
};
</script>

<style scoped>
@import url('@/assets/css/components/modals.css');
.backdrop-blur { backdrop-filter: blur(2px); background-color: rgba(0, 0, 0, 0.4); }
.border-dashed { border-style: dashed !important; border-color: #dee2e6 !important; }
.transition-all { transition: all 0.3s ease; }
.cursor-pointer { cursor: pointer; }

.modern-input {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  transition: all 0.2s ease;
}

.modern-input:focus {
  background-color: #fff;
  border-color: var(--color-primary, #004754);
  box-shadow: 0 0 0 0.2rem rgba(0, 71, 84, 0.15);
  outline: none;
}
</style>