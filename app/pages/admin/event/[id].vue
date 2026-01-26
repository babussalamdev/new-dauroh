<template>
  <div class="container-fluid px-4 py-4">
    
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <AdminBreadcrumb :items="breadcrumbItems" />
      <div v-if="eventData">
         <span class="badge px-3 py-2 rounded-pill d-flex align-items-center gap-2 align-self-start"
               :class="eventData.Status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
            <i class="bi" :class="eventData.Status === 'active' ? 'bi-circle-fill' : 'bi-pause-circle-fill'" style="font-size: 0.6rem;"></i>
            {{ eventData.Status === 'active' ? 'Published' : 'Draft' }}
         </span>
      </div>
    </div>

    <div v-if="daurohStore.loading.detail" class="text-center py-5">
       <div class="spinner-border text-primary border-2" role="status" style="width: 3rem; height: 3rem;"></div>
       <p class="mt-3 text-muted fw-medium ls-1 small">MEMUAT DATA EVENT...</p>
    </div>

    <div v-else-if="eventData" class="row g-4">
      
      <div class="col-lg-4 col-xl-3">
        <div class="sticky-sidebar">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white mx-auto" style="max-width: 320px;">
            <div class="card-body p-3">
                <div class="Picture-container mx-auto position-relative rounded-3 overflow-hidden bg-light border border-dashed d-flex align-items-center justify-content-center">
                    <img
                        v-if="previewUrl"
                        :src="previewUrl"
                        alt="Preview"
                        class="Picture-preview"
                        @error="onImageError"
                    />
                    <div v-else class="text-muted p-4 text-center">
                        <i class="bi bi-image fs-1 opacity-25"></i>
                        <div class="small mt-2">Belum ada gambar</div>
                    </div>

                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        @change="handleFileChange"
                        class="d-none"
                        id="posterUploadPage"
                    />
                </div>
                
                <canvas ref="canvas" style="display: none;"></canvas>
                <div v-if="photoError" class="alert alert-danger mt-2 x-small p-2 text-center rounded-3 mb-0">{{ photoError }}</div>
            </div>

            <div class="d-flex gap-2 px-3 pb-3">
                <label for="posterUploadPage" class="btn btn-sm btn-light shadow-sm opacity-90 fw-medium border-0 cursor-pointer flex-grow-1 d-flex align-items-center justify-content-center">
                    <i class="bi bi-camera me-2"></i> {{ previewUrl ? 'Ganti' : 'Upload' }}
                </label>

                <button
                    v-if="newPhotoBase64"
                    type="button"
                    class="btn btn-success btn-sm shadow-sm fw-bold flex-grow-1 animate-slide-down d-flex align-items-center justify-content-center"
                    :disabled="isSavingPicture"
                    @click="handlePictureSubmit"
                >
                    <span v-if="isSavingPicture" class="spinner-border spinner-border-sm me-1" />
                    {{ isSavingPicture ? '...' : 'Simpan' }}
                </button>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
             <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h6 class="fw-bold mb-0 text-dark small text-uppercase ls-1">Info Dasar</h6>
                <button @click="openEditBasicModal" class="btn btn-light btn-sm text-primary py-1 px-2 rounded-pill x-small fw-bold">
                   <i></i> Edit
                </button>
             </div>

             <div class="info-list d-flex flex-column gap-3">
                <div class="d-flex justify-content-between align-items-center">
                   <span class="text-muted small">Registrasi</span>
                   <span class="fw-medium text-end small text-dark">{{ formatRegDates(eventData.Registration) }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                   <span class="text-muted small">Lokasi</span>
                   <span class="fw-medium text-end small text-dark text-truncate" style="max-width: 150px;" :title="eventData.Place">{{ eventData.Place }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                   <span class="text-muted small">Harga</span>
                   <span class="fw-bold text-primary text-end small">{{ formatCurrency(eventData.Price) }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                   <span class="text-muted small">Target</span>
                   <span class="badge bg-light text-secondary border fw-normal text-capitalize">{{ eventData.Gender }}</span>
                </div>
             </div>
          </div>

        </div>
      </div>

      <div class="col-lg-8 col-xl-9">
        
        <section class="card border-0 shadow-sm rounded-4 p-0 overflow-hidden mb-4 bg-white">
           <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                  <i class="bi bi-file-text text-primary"></i> Deskripsi
              </h5>
              <div v-if="isContentChanged" class="text-warning small fw-bold animate-pulse">
                 <i class="bi bi-circle-fill me-1" style="font-size: 8px;"></i> Unsaved Changes
              </div>
           </div>
           <div class="p-0">
             <form @submit.prevent="handleContentSubmit">
               <div class="quill-wrapper bg-light">
                  <div ref="editorContainer" style="height: 350px; border: none;"></div>
               </div>
               <div class="px-4 py-3 bg-white border-top d-flex justify-content-end">
                  <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" :disabled="isSavingBasic || !isContentChanged">
                     <span v-if="isSavingBasic" class="spinner-border spinner-border-sm me-2"></span>
                     {{ isSavingBasic ? 'Menyimpan...' : 'Simpan Deskripsi' }}
                  </button>
               </div>
             </form>
           </div>
        </section>

        <section v-if="contentForm.Description" class="card border-0 shadow-sm rounded-4 mb-4 bg-white transition-all">
            <div class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold text-muted small text-uppercase m-0">Preview</h6>
                <button @click="showPreview = !showPreview" class="btn btn-sm btn-light rounded-circle shadow-sm" :title="showPreview ? 'Sembunyikan' : 'Tampilkan'">
                    <i class="bi" :class="showPreview ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                </button>
            </div>
            <div v-show="showPreview" class="card-body p-4 pt-0">
                <div class="preview-box p-3 rounded-3 bg-soft-gray border text-secondary" v-html="contentForm.Description"></div>
            </div>
        </section>

        <section class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
           <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                 <h6 class="fw-bold mb-1 text-dark small text-uppercase ls-1">Jadwal Kegiatan</h6>
              </div>
              <button class="btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary border" @click="addScheduleDay">
                 <i></i> Tambah
              </button>
           </div>

           <form @submit.prevent="handleScheduleSubmit">
              <div v-if="formState.scheduleDays.length === 0" class="text-center py-5 rounded-4 bg-light border border-dashed">
                 <i class="bi bi-calendar-range fs-1 text-muted opacity-25"></i>
                 <p class="text-muted small mt-2">Belum ada jadwal.</p>
              </div>
              
              <div v-else class="d-flex flex-column gap-3">
                 <div v-for="(day, index) in formState.scheduleDays" :key="day.tempId" 
                      class="position-relative bg-light p-3 rounded-4 border border-transparent hover-border-primary transition-all">
                    
                    <div class="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center">
                        <div class="bg-white shadow-sm rounded-3 p-2 text-center d-flex flex-column justify-content-center flex-shrink-0" style="width: 50px; height: 50px;">
                           <small class="d-block x-small text-uppercase text-muted fw-bold lh-1 mb-1">Hari</small>
                           <span class="fs-5 fw-bold text-primary lh-1">{{ index + 1 }}</span>
                        </div>

                        <div class="flex-grow-1 w-100">
                           <div class="row g-2">
                              <div class="col-12 col-md-5">
                                 <label class="x-small text-muted mb-1 ps-1">Tanggal</label>
                                 <input type="date" class="form-control modern-input" v-model="day.date" :min="minDate" required>
                              </div>
                              <div class="col-6 col-md-3">
                                 <label class="x-small text-muted mb-1 ps-1">Mulai</label>
                                 <input type="time" class="form-control modern-input text-center" v-model="day.start_time" required>
                              </div>
                              <div class="col-6 col-md-3">
                                 <label class="x-small text-muted mb-1 ps-1">Selesai</label>
                                 <input type="time" class="form-control modern-input text-center" v-model="day.end_time" required>
                              </div>
                              <div class="col-md-1 d-none d-md-flex align-items-end justify-content-center pb-1">
                                 <button type="button" class="btn btn-icon btn-light text-danger rounded-circle shadow-sm" @click="removeScheduleDay(index)" title="Hapus"><i class="bi bi-trash-fill"></i></button>
                              </div>
                           </div>
                        </div>

                        <button type="button" class="btn btn-icon btn-white text-danger rounded-circle shadow-sm position-absolute top-0 end-0 mt-2 me-2 d-md-none" @click="removeScheduleDay(index)"><i class="bi bi-trash-fill"></i></button>
                    </div>
                 </div>

                 <div class="text-end mt-3 border-top pt-3">
                    <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" :disabled="isSavingSchedule">
                       <span v-if="isSavingSchedule" class="spinner-border spinner-border-sm me-2"></span>
                       {{ isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal' }}
                    </button>
                 </div>
              </div>
           </form>
        </section>

      </div>
    </div>

    <AdminDaurohFormModal v-if="showEditBasicModal" :show="showEditBasicModal" :is-editing="true" :dauroh="eventData || undefined" @close="closeEditBasicModal" @save="handleUpdateBasicInfo" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useDaurohStore } from '@/stores/dauroh';
import Swal from 'sweetalert2';
import { useToastStore } from '@/stores/toast';
import { useRoute } from 'vue-router';
import type { Dauroh, DaurohDayDetail, DaurohBasicData } from '@/stores/dauroh';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');
const route = useRoute();
const daurohStore = useDaurohStore();
const toastStore = useToastStore();

const eventSK = String(route.params.id);

const eventData = computed(() => daurohStore.currentDaurohDetail);
const breadcrumbItems = computed(() => [
  { text: 'Manajemen Event', to: '/admin' },
  { text: eventData.value?.Title || 'Detail Event' }
]);

const isSavingPicture = ref(false);
const isSavingSchedule = ref(false);
const isSavingBasic = ref(false); 
const isContentChanged = ref(false);
const showPreview = ref(true); 

const showEditBasicModal = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
let quillInstance: Quill | null = null;

const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);

interface ScheduleDayForm extends DaurohDayDetail { tempId: number; }
const formState = reactive({ scheduleDays: [] as ScheduleDayForm[] });
let nextTempId = 0;

const contentForm = reactive({
  Description: '',
});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

onMounted(async () => {
    if(eventSK) {
        await daurohStore.fetchDaurohDetail(eventSK);
        initializeData();
    }
});

const initQuill = () => {
  if (editorContainer.value && !quillInstance) {
    quillInstance = new Quill(editorContainer.value, {
      theme: 'snow',
      placeholder: 'Tulis deskripsi event lengkap di sini...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ]
      }
    });

    if (contentForm.Description) {
      quillInstance.clipboard.dangerouslyPasteHTML(contentForm.Description);
    }

    quillInstance.on('text-change', () => {
      if (quillInstance) {
        const html = quillInstance.root.innerHTML;
        if (contentForm.Description !== html) {
           contentForm.Description = html;
           isContentChanged.value = true;
        }
      }
    });
  }
};
watch(eventData, () => initializeData());

const initializeData = () => {
  if (eventData.value) {
    newPhotoBase64.value = null;
    previewUrl.value = eventData.value.Picture 
      ? `${imgBaseUrl.value}/${eventData.value.SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
      : null;

    formState.scheduleDays = [];
    nextTempId = 0;
    if (eventData.value.Date && typeof eventData.value.Date === 'object') {
      Object.values(eventData.value.Date).forEach((day) => {
        if (day?.date) {
          formState.scheduleDays.push({ 
            tempId: nextTempId++, 
            ...day,
            start_time: convertToInputTime(day.start_time),
            end_time: convertToInputTime(day.end_time)
          });
        }
      });
      formState.scheduleDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    contentForm.Description = eventData.value.Description || '';
    isContentChanged.value = false;
    setTimeout(() => initQuill(), 100); 
  }
};

const handleContentSubmit = async () => {
  if (!eventData.value?.SK) return;
  isSavingBasic.value = true;
  try {
    await daurohStore.updateTiketDaurohBasic({
        SK: eventData.value.SK,
        ...contentForm
    });
    toastStore.showToast({ message: 'Deskripsi berhasil disimpan.', type: 'success' });
    isContentChanged.value = false;
  } catch (err) {
    Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan konten.', 'error');
  } finally {
    isSavingBasic.value = false;
  }
};

const openEditBasicModal = () => (showEditBasicModal.value = true);
const closeEditBasicModal = () => (showEditBasicModal.value = false);
const handleUpdateBasicInfo = async (payload: { daurohData: DaurohBasicData }) => {
  isSavingBasic.value = true;
  if(!payload.daurohData.SK) payload.daurohData.SK = eventSK;
  const success = await daurohStore.updateTiketDaurohBasic({
      ...payload.daurohData,
      SK: payload.daurohData.SK!
  });
  if (success) toastStore.showToast({ message: 'Info dasar berhasil diperbarui.', type: 'success' });
  isSavingBasic.value = false;
};

const addScheduleDay = () => formState.scheduleDays.push({ tempId: nextTempId++, date: '', start_time: '', end_time: '' });
const removeScheduleDay = (idx: number) => formState.scheduleDays.splice(idx, 1);

const handleScheduleSubmit = async () => {
    if (!eventData.value?.SK) return;
    if (formState.scheduleDays.some((d) => !d.date || !d.start_time || !d.end_time)) {
        return Swal.fire('Error', 'Lengkapi semua kolom jadwal.', 'error');
    }

    isSavingSchedule.value = true;
    try {
        const dateObject: Record<string, DaurohDayDetail> = {};
        const sortedDays = [...formState.scheduleDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        sortedDays.forEach((d, i) => {
            const { tempId, ...dayData } = d;
            dateObject[`day_${i + 1}`] = {
                ...dayData,
                start_time: convertFromInputTime(dayData.start_time),
                end_time: convertFromInputTime(dayData.end_time)
            };
        });
        await daurohStore.updateDaurohSchedule(eventData.value.SK, dateObject);
        toastStore.showToast({ message: 'Jadwal berhasil disimpan.', type: 'success' });
    } catch (err) {
        Swal.fire('Error', 'Gagal menyimpan jadwal.', 'error');
    } finally {
        isSavingSchedule.value = false;
    }
};

const handleFileChange = (e: Event) => {
  photoError.value = null;
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { photoError.value = 'File harus gambar.'; return; }
  
  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target?.result as string;
    previewUrl.value = base64;
    convertToWebP(base64);
  };
  reader.readAsDataURL(file);
};

const convertToWebP = (src: string) => {
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx || !canvas.value) return;
    const MAX_WIDTH = 800;
    let { naturalWidth: w, naturalHeight: h } = img;
    if (w > MAX_WIDTH) { const r = MAX_WIDTH / w; w = MAX_WIDTH; h *= r; }
    canvas.value.width = w; canvas.value.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    newPhotoBase64.value = canvas.value.toDataURL('image/webp', 0.8);
  };
  img.src = src;
};

const handlePictureSubmit = async () => {
  if (!eventData.value?.SK || !newPhotoBase64.value) return;
  isSavingPicture.value = true;
  await daurohStore.uploadEventPhoto(eventData.value.SK, newPhotoBase64.value);
  toastStore.showToast({ message: 'Poster berhasil diperbarui.', type: 'success' });
  isSavingPicture.value = false;
  newPhotoBase64.value = null;
};

const onImageError = (e: Event) => {
    (e.target as HTMLImageElement).src = '';
    previewUrl.value = null;
};

const convertToInputTime = (t: string) => {
  if (!t) return '';
  if (t.includes(' ')) { 
     const parts = t.split(' ');
     const time = parts[0];
     const mod = parts[1];
     if (!time) return t; 
     const timeParts = time.split('.');
     let h = timeParts[0];
     const m = timeParts[1];
     if (mod === 'PM' && h !== '12') h = String(Number(h) + 12);
     if (mod === 'AM' && h === '12') h = '00';
     return `${h}:${m}`;
  }
  return t.substring(0, 5);
};

const convertFromInputTime = (t: string) => {
   if (!t) return '';
   let [h, m] = t.split(':');
   let hh = Number(h);
   let mod = hh >= 12 ? 'PM' : 'AM';
   if (hh > 12) hh -= 12;
   if (hh === 0) hh = 12;
   return `${String(hh).padStart(2,'0')}.${m} ${mod}`;
};
const formatCurrency = (v: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

const formatRegDates = (reg: any) => {
  if (!reg || !reg.start_registration || !reg.end_registration) {
    return 'Belum diatur';
  }
  const start = new Date(reg.start_registration);
  const end = new Date(reg.end_registration);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startStr = start.toLocaleDateString('id-ID', options);
  const endStr = end.toLocaleDateString('id-ID', { ...options, year: 'numeric' });
  if (start.getTime() === end.getTime()) {
      return end.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return `${startStr} - ${endStr}`;
};
</script>

<style scoped>
.bg-soft-gray { background-color: #f9fbfd; }
.bg-gradient-dark { background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); }
.sticky-sidebar { position: sticky; top: 1.5rem; z-index: 10; }
.cursor-pointer { cursor: pointer; }
.animate-pulse { animation: pulse 2s infinite; }
.animate-slide-down { animation: slideDown 0.3s ease-out; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* PICTURE CONTAINER */
.Picture-container { width: 100%; height: 350px; position: relative; }
.Picture-preview { width: 100%; height: 100%; object-fit: contain; }

/* MODERN INPUT */
.modern-input {
  background-color: #f8f9fa; 
  border: 1px solid #e9ecef;
  border-radius: 0.375rem; 
  font-size: 0.9rem;
  transition: all 0.2s;
}
.modern-input:focus {
  background-color: #fff;
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 2px rgba(var(--bs-primary-rgb), 0.1);
}

.hover-border-primary:hover { border-color: var(--bs-primary) !important; }

/* Fix Quill Styles */
:deep(.ql-toolbar) { border: none !important; border-bottom: 1px solid #eee !important; background-color: #fff; border-radius: 0.75rem 0.75rem 0 0; padding: 12px 16px !important; }
:deep(.ql-container) { border: none !important; background-color: #fff; border-radius: 0 0 0.75rem 0.75rem; font-family: inherit; font-size: 0.95rem; }
:deep(.ql-editor) { min-height: 350px; padding: 20px; line-height: 1.6; }
</style>