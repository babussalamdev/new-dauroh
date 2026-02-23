<template>
  <div class="container-fluid px-4 py-4">
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <AdminBreadcrumb :items="breadcrumbItems" />
      <div v-if="eventData">
        <span class="badge px-3 py-2 rounded-pill d-flex align-items-center gap-2"
          :class="eventData.Status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
          <i class="bi" :class="eventData.Status === 'active' ? 'bi-circle-fill' : 'bi-pause-circle-fill'"
            style="font-size: 0.6rem;"></i>
          {{ eventData.Status === 'active' ? 'Published' : 'Draft' }}
        </span>
      </div>
    </div>

    <div v-if="eventStore.loading.detail" class="text-center py-5">
      <div class="spinner-border text-primary border-2" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted fw-medium ls-1 small">MEMUAT DATA EVENT...</p>
    </div>

    <div v-else-if="eventData" class="row g-4">
      <div class="col-lg-4 col-xl-3">
        <div class="sticky-sidebar">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
            <div class="card-body p-3">
              <div
                class="Picture-container mx-auto position-relative rounded-3 overflow-hidden bg-light border border-dashed d-flex align-items-center justify-content-center">
                <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="Picture-preview" @error="onImageError" />
                <div v-else class="text-muted p-4 text-center">
                  <i class="bi bi-image fs-1 opacity-25"></i>
                  <div class="small mt-2">Belum ada gambar</div>
                </div>
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="d-none"
                  id="posterUploadPage" />
              </div>
              <canvas ref="canvasRef" style="display: none;"></canvas>
              <div v-if="photoError" class="alert alert-danger mt-2 x-small p-2 text-center">{{ photoError }}</div>
            </div>

            <div class="d-flex gap-2 px-3 pb-3">
              <label for="posterUploadPage" class="btn btn-sm btn-light fw-medium flex-grow-1">
                <i class="bi bi-camera me-2"></i> {{ previewUrl ? 'Ganti' : 'Upload' }}
              </label>
              <button v-if="newPhotoBase64" type="button" class="btn btn-success btn-sm fw-bold flex-grow-1"
                :disabled="isSavingPicture" @click="handlePictureSubmit">
                <span v-if="isSavingPicture" class="spinner-border spinner-border-sm me-1" />
                {{ isSavingPicture ? '...' : 'Simpan' }}
              </button>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 class="fw-bold mb-0 text-dark small text-uppercase">Info Dasar</h6>
              <button @click="openEditBasicModal"
                class="btn btn-light btn-sm text-primary py-1 px-2 rounded-pill fw-bold">Edit</button>
            </div>
            <div class="info-list d-flex flex-column gap-3">
              <div class="d-flex justify-content-between"><span class="text-muted small">Registrasi</span><span
                  class="small fw-medium">{{ formatRegDates(eventData.Registration) }}</span></div>
              <div class="d-flex justify-content-between"><span class="text-muted small">Lokasi</span><span
                  class="small fw-medium text-truncate" style="max-width: 120px;">{{ eventData.Place }}</span></div>
              <div class="d-flex justify-content-between"><span class="text-muted small">Harga</span><span
                  class="small fw-bold text-primary">{{ formatCurrency(eventData.Price) }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-8 col-xl-9">
        <section class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
          <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i class="bi bi-file-text text-primary"></i> Deskripsi
            </h5>
            <div v-if="isContentChanged" class="text-warning small fw-bold animate-pulse">
              <i class="bi bi-circle-fill me-1" style="font-size: 8px;"></i> Belum Tersimpan
            </div>
          </div>
          <div class="quill-wrapper bg-light">
            <div ref="editorContainer" style="height: 350px;"></div>
          </div>
          <div class="px-4 py-3 bg-white border-top d-flex justify-content-end">
            <button @click="handleContentSubmit" class="btn btn-primary rounded-pill px-4 fw-bold"
              :disabled="isSavingBasic || !isContentChanged">
              {{ isSavingBasic ? 'Menyimpan...' : 'Simpan Deskripsi' }}
            </button>
          </div>
        </section>

        <section class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h6 class="fw-bold mb-0 text-dark small text-uppercase">Jadwal Kegiatan</h6>
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold" @click="addScheduleDay">+ Tambah
              Hari</button>
          </div>

          <form @submit.prevent="handleScheduleSubmit">
            <div v-if="formState.scheduleDays.length === 0"
              class="text-center py-5 rounded-4 bg-light border border-dashed">
              <p class="text-muted small">Belum ada jadwal yang ditambahkan.</p>
            </div>
            <div v-else class="d-flex flex-column gap-3">
              <div v-for="(day, index) in formState.scheduleDays" :key="day.tempId"
                class="bg-light p-3 rounded-4 border position-relative">
                <div class="row g-2 align-items-end">
                  <div class="col-md-4">
                    <label class="x-small text-muted mb-1 ps-1">Tanggal</label>
                    <input type="date" class="form-control modern-input" v-model="day.date" required>
                  </div>
                  <div class="col-md-3">
                    <label class="x-small text-muted mb-1 ps-1">Mulai</label>
                    <input type="time" class="form-control modern-input" v-model="day.start_time" required>
                  </div>
                  <div class="col-md-3">
                    <label class="x-small text-muted mb-1 ps-1">Selesai</label>
                    <input type="time" class="form-control modern-input" v-model="day.end_time" required>
                  </div>
                  <div class="col-md-2 text-end">
                    <button type="button" class="btn btn-light text-danger rounded-circle"
                      @click="removeScheduleDay(index)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="text-end mt-3 border-top pt-3">
                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold" :disabled="isSavingSchedule">
                  {{ isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal' }}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>

    <AdminEventFormModal v-if="showEditBasicModal" :show="showEditBasicModal" :is-editing="true"
      :event="eventData || undefined" @close="closeEditBasicModal" @save="handleUpdateBasicInfo" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEventStore } from '@/stores/event';
import { useToastStore } from '@/stores/toast';
import Swal from 'sweetalert2';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// --- CONFIG & STORE ---
definePageMeta({ layout: 'admin' });
const config = useRuntimeConfig();
const route = useRoute();
const eventStore = useEventStore();
const toastStore = useToastStore();
const eventSK = String(route.params.id);

// --- STATE ---
const canvasRef = ref<HTMLCanvasElement | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
let quillInstance: any = null;

const isSavingPicture = ref(false);
const isSavingSchedule = ref(false);
const isSavingBasic = ref(false);
const isContentChanged = ref(false);
const showEditBasicModal = ref(false);

const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);

const formState = reactive({
  scheduleDays: [] as any[]
});
const contentForm = reactive({
  Description: ''
});

// --- COMPUTED ---
const eventData = computed(() => eventStore.currentEventDetail);
const breadcrumbItems = computed(() => [
  { text: 'Manajemen Event', to: '/admin/events' },
  { text: eventData.value?.Title || 'Detail Event' }
]);

// --- INITIALIZE DATA ---
const initializeData = () => {
  if (!eventData.value) return;

  // Setup Image Preview
  previewUrl.value = eventData.value.Picture
    ? `${config.public.img}/${eventData.value.SK}/${eventData.value.Picture}.webp?t=${Date.now()}`
    : null;

  // Setup Schedule
  if (eventData.value.Date) {
    formState.scheduleDays = Object.values(eventData.value.Date).map((day: any, index: number) => ({
      tempId: index,
      ...day,
      start_time: convertTo24h(day.start_time),
      end_time: convertTo24h(day.end_time)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Setup Description
  contentForm.Description = eventData.value.Description || '';
  if (quillInstance && contentForm.Description) {
    quillInstance.root.innerHTML = contentForm.Description;
    isContentChanged.value = false;
  }
};

// --- QUILL EDITOR LOGIC ---
const initQuill = () => {
  if (!editorContainer.value || quillInstance) return;

  quillInstance = new Quill(editorContainer.value, {
    theme: 'snow',
    placeholder: 'Tulis deskripsi event...',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'clean']
      ]
    }
  });

  quillInstance.root.innerHTML = contentForm.Description;
  quillInstance.on('text-change', () => {
    contentForm.Description = quillInstance.root.innerHTML;
    isContentChanged.value = true;
  });
};

// --- IMAGE HANDLING ---
const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { photoError.value = 'Hanya file gambar!'; return; }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target?.result as string;
    previewUrl.value = base64;
    processWebP(base64);
  };
  reader.readAsDataURL(file);
};

const processWebP = (src: string) => {
  const img = new Image();
  img.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const MAX_WIDTH = 1000;
    let { width, height } = img;

    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }
    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(img, 0, 0, width, height);
    newPhotoBase64.value = canvas.toDataURL('image/webp', 0.8);
  };
  img.src = src;
};

const handlePictureSubmit = async () => {
  if (!eventData.value?.SK || !newPhotoBase64.value) return;
  isSavingPicture.value = true;
  const success = await eventStore.uploadEventPhoto(eventData.value.SK, newPhotoBase64.value);
  if (success) {
    toastStore.showToast({ message: 'Poster diperbarui', type: 'success' });
    newPhotoBase64.value = null;
  }
  isSavingPicture.value = false;
};

// --- SCHEDULE LOGIC ---
const addScheduleDay = () => {
  formState.scheduleDays.push({ tempId: Date.now(), date: '', start_time: '', end_time: '' });
};

const removeScheduleDay = (index: number) => {
  formState.scheduleDays.splice(index, 1);
};

const handleScheduleSubmit = async () => {
  if (!eventData.value?.SK) return;
  isSavingSchedule.value = true;

  const payload: Record<string, any> = {};
  formState.scheduleDays.forEach((day, i) => {
    payload[`day_${i + 1}`] = {
      date: day.date,
      start_time: convertTo12h(day.start_time),
      end_time: convertTo12h(day.end_time)
    };
  });

  try {
    await eventStore.updateEventSchedule(eventData.value.SK, payload);
    toastStore.showToast({ message: 'Jadwal disimpan', type: 'success' });
  } finally {
    isSavingSchedule.value = false;
  }
};

const handleContentSubmit = async () => {
  if (!eventData.value?.SK) return;
  isSavingBasic.value = true;
  const success = await eventStore.updateTiketEventBasic({
    SK: eventData.value.SK,
    Description: contentForm.Description
  });
  if (success) {
    toastStore.showToast({ message: 'Konten disimpan', type: 'success' });
    isContentChanged.value = false;
  }
  isSavingBasic.value = false;
};

// --- UTILS (Time Converter) ---
const convertTo24h = (timeStr?: string) => {
  // Jika timeStr kosong atau undefined, langsung return string kosong
  if (!timeStr) return '';

  const parts = timeStr.split(' ');
  const time = parts[0]; // '08.00'
  const modifier = parts[1]; // 'AM'

  // Tambahkan pengecekan 'time' di sini
  if (!time) return '';

  let [hours, minutes] = time.split('.');

  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);

  return `${hours.padStart(2, '0')}:${minutes}`;
};

const convertTo12h = (time24: string | undefined) => {
  // Gunakan guard clause untuk memastikan time24 bukan undefined/kosong
  if (!time24) return '';

  const parts = time24.split(':');
  // Pastikan split menghasilkan array yang lengkap
  if (parts.length < 2) return '';

  const h = parts[0];
  const m = parts[1];

  const hours = parseInt(h, 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = ((hours + 11) % 12 + 1);

  return `${String(hours12).padStart(2, '0')}.${m} ${suffix}`;
};

const formatCurrency = (v: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

const formatRegDates = (reg: any) => {
  if (!reg?.start_registration) return 'Belum diatur';
  const options: any = { day: 'numeric', month: 'short' };
  return `${new Date(reg.start_registration).toLocaleDateString('id-ID', options)} - ${new Date(reg.end_registration).toLocaleDateString('id-ID', options)}`;
};

// --- LIFECYCLE ---
onMounted(async () => {
  await eventStore.fetchEventDetail(eventSK);
  initializeData();
  setTimeout(initQuill, 200);
});

onBeforeUnmount(() => {
  if (quillInstance) quillInstance = null;
});

watch(eventData, () => initializeData());

const openEditBasicModal = () => showEditBasicModal.value = true;
const closeEditBasicModal = () => showEditBasicModal.value = false;
const handleUpdateBasicInfo = async (payload: any) => {
  const success = await eventStore.updateTiketEventBasic({ ...payload.eventData, SK: eventSK });
  if (success) closeEditBasicModal();
};

const onImageError = () => previewUrl.value = null;
</script>

<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 1.5rem;
}

.Picture-container {
  height: 320px;
  border-radius: 12px;
}

.Picture-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.modern-input {
  border: 1px solid #eee;
  padding: 0.6rem;
}

.x-small {
  font-size: 0.75rem;
}

:deep(.ql-container) {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background: white;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  background: #f8f9fa;
  border-color: #eee !important;
}
</style>