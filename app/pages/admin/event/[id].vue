<template>
  <div class="container-fluid px-4 py-4">
    
    <div class="d-flex align-items-center justify-content-between mb-4">
      <AdminBreadcrumb :items="breadcrumbItems" />
      <div v-if="eventData">
         <span class="badge px-3 py-2 rounded-pill d-flex align-items-center gap-2"
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
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white group-hover-img">
            <div class="position-relative aspect-ratio-3x4 bg-light d-flex align-items-center justify-content-center overflow-hidden">
               <img v-if="previewUrl" :src="previewUrl" class="w-100 h-100 object-fit-cover transition-transform" alt="Poster">
               <div v-else class="text-center text-muted p-4">
                  <i class="bi bi-image fs-1 opacity-25"></i>
                  <p class="small mt-2 mb-0">Belum ada poster</p>
               </div>
               
               <div class="position-absolute inset-0 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-opacity">
                  <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="d-none" id="posterUploadPage">
                  <label for="posterUploadPage" class="btn btn-light rounded-pill px-4 fw-bold shadow-sm transform-hover cursor-pointer">
                    <i class="bi bi-camera me-2"></i>Ganti Gambar
                  </label>
               </div>
            </div>
            
            <div class="card-body p-2" v-if="newPhotoBase64">
               <button class="btn btn-primary w-100 rounded-pill btn-sm fw-bold" @click="handlePictureSubmit" :disabled="isSavingPicture">
                 <span v-if="isSavingPicture" class="spinner-border spinner-border-sm me-1"></span>
                 {{ isSavingPicture ? 'Menyimpan...' : 'Simpan Gambar' }}
               </button>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 class="fw-bold text-dark mb-4 small text-uppercase ls-1 text-muted">Ringkasan Info</h6>
            <div class="d-flex flex-column gap-3 mb-4">
               <div class="d-flex align-items-center gap-3">
                  <div class="icon-sq bg-primary-subtle text-primary"><i class="bi bi-calendar-event"></i></div>
                  <div class="overflow-hidden">
                    <small class="d-block text-muted x-small text-uppercase">Tanggal</small>
                    <span class="fw-bold text-dark fs-6 text-truncate d-block">{{ formatEventDates(eventData.Date) }}</span>
                  </div>
               </div>
               <div class="d-flex align-items-center gap-3">
                  <div class="icon-sq bg-warning-subtle text-warning-emphasis"><i class="bi bi-geo-alt"></i></div>
                  <div class="overflow-hidden">
                    <small class="d-block text-muted x-small text-uppercase">Lokasi</small>
                    <span class="fw-bold text-dark fs-6 text-truncate d-block">{{ eventData.Place }}</span>
                  </div>
               </div>
               <div class="d-flex align-items-center gap-3">
                  <div class="icon-sq bg-success-subtle text-success"><i class="bi bi-ticket-perforated"></i></div>
                  <div>
                    <small class="d-block text-muted x-small text-uppercase">Harga</small>
                    <span class="fw-bold text-dark fs-6">{{ formatCurrency(eventData.Price) }}</span>
                  </div>
               </div>
            </div>
            <button @click="openEditBasicModal" class="btn btn-outline-dark w-100 rounded-pill py-2 fw-bold small border-2">
               <i class="bi bi-pencil-square me-2"></i>Edit Info Dasar
            </button>
          </div>
        </div>
      </div>

      <div class="col-lg-8 col-xl-9">
        <div class="mb-4">
           <h2 class="fw-bold text-dark mb-1">{{ eventData.Title }}</h2>
           <span class="text-muted small">Kelola detail konten dan rundown acara.</span>
        </div>

        <section class="card border-0 shadow-sm rounded-4 p-4 p-lg-5 mb-4 bg-white">
           <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-bold text-dark m-0"><i class="bi bi-file-text me-2 text-primary"></i>Detail Konten</h5>
              <div v-if="isContentChanged" class="text-warning small fw-bold animate-pulse">
                 <i class="bi bi-circle-fill me-1" style="font-size: 8px;"></i> Perubahan belum disimpan
              </div>
           </div>

           <form @submit.prevent="handleContentSubmit">
             <div class="row g-4">
               <div class="col-12">
                 <label class="form-label fw-bold text-dark x-small text-uppercase">1. Intro / Deskripsi Singkat</label>
                 <textarea class="form-control modern-textarea" rows="4" v-model="contentForm.Description" placeholder="Contoh: Dengan mengharap ridho Allah..." @input="isContentChanged = true"></textarea>
               </div>
               <div class="col-12">
                 <label class="form-label fw-bold text-dark x-small text-uppercase">2. Pemateri & Tema</label>
                 <textarea class="form-control modern-textarea" rows="5" v-model="contentForm.Speakers" placeholder="Contoh: 🎙️ Ustadz Fulan - Tema A..." @input="isContentChanged = true"></textarea>
               </div>
               <div class="col-md-6">
                 <label class="form-label fw-bold text-dark x-small text-uppercase">3. Maklumat / Syarat</label>
                 <textarea class="form-control modern-textarea" rows="4" v-model="contentForm.Maklumat" placeholder="1. Khusus ikhwan... 2. Luruskan niat..." @input="isContentChanged = true"></textarea>
               </div>
               <div class="col-md-6">
                 <label class="form-label fw-bold text-dark x-small text-uppercase">4. Sponsor & Kontak</label>
                 <textarea class="form-control modern-textarea" rows="4" v-model="contentForm.Sponsors" placeholder="Sponsored by: @bbsslm... Info: 0812..." @input="isContentChanged = true"></textarea>
               </div>
             </div>
             <div class="mt-4 text-end">
                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" :disabled="isSavingBasic || !isContentChanged">
                   <span v-if="isSavingBasic" class="spinner-border spinner-border-sm me-2"></span>
                   {{ isSavingBasic ? 'Menyimpan...' : 'Simpan' }}
                </button>
             </div>
           </form>
        </section>

        <section class="card border-0 shadow-sm rounded-4 p-4 p-lg-5 mb-4 bg-white">
           <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-bold text-dark m-0"><i class="bi bi-clock-history me-2 text-primary"></i>Jadwal Kegiatan</h5>
              <button class="btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary border" @click="addScheduleDay">
                 <i class="bi bi-plus-lg me-1"></i> Tambah Hari
              </button>
           </div>

           <form @submit.prevent="handleScheduleSubmit">
              <div v-if="formState.scheduleDays.length === 0" class="text-center py-5 rounded-4 bg-light border border-dashed">
                 <i class="bi bi-calendar-range fs-1 text-muted opacity-25"></i>
                 <p class="text-muted small mt-2">Belum ada rundown acara.</p>
                 <button type="button" class="btn btn-link btn-sm text-decoration-none" @click="addScheduleDay">Mulai buat jadwal</button>
              </div>
              <div v-else class="d-flex flex-column gap-3">
                 <div v-for="(day, index) in formState.scheduleDays" :key="day.tempId" class="d-flex align-items-center gap-3 p-3 rounded-4 bg-light border border-transparent hover-border-primary transition-all">
                    <div class="bg-white shadow-sm rounded-3 p-2 text-center" style="min-width: 60px;">
                       <small class="d-block x-small text-uppercase text-muted fw-bold">Hari</small>
                       <span class="fs-4 fw-bold text-primary lh-1">{{ index + 1 }}</span>
                    </div>
                    <div class="flex-grow-1 row g-2 align-items-center">
                       <div class="col-md-5">
                          <label class="x-small text-muted mb-1 d-block">Tanggal</label>
                          <input type="date" class="form-control form-control-sm border-0 bg-white shadow-sm fw-bold" v-model="day.date" :min="minDate" required>
                       </div>
                       <div class="col-md-7">
                          <label class="x-small text-muted mb-1 d-block">Waktu</label>
                          <div class="d-flex align-items-center gap-2">
                             <input type="time" class="form-control form-control-sm border-0 bg-white shadow-sm text-center fw-bold" v-model="day.start_time" required>
                             <span class="text-muted fw-bold">-</span>
                             <input type="time" class="form-control form-control-sm border-0 bg-white shadow-sm text-center fw-bold" v-model="day.end_time" required>
                          </div>
                       </div>
                    </div>
                    <button type="button" class="btn btn-icon btn-light text-danger rounded-circle shadow-sm" @click="removeScheduleDay(index)" title="Hapus"><i class="bi bi-trash-fill"></i></button>
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

const showEditBasicModal = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);

interface ScheduleDayForm extends DaurohDayDetail { tempId: number; }
const formState = reactive({ scheduleDays: [] as ScheduleDayForm[] });
let nextTempId = 0;

const contentForm = reactive({
  Description: '',
  Speakers: '',
  Maklumat: '',
  Sponsors: ''
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
    contentForm.Speakers = eventData.value.Speakers || '';
    contentForm.Maklumat = eventData.value.Maklumat || '';
    contentForm.Sponsors = eventData.value.Sponsors || '';
    
    isContentChanged.value = false;
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
  // Pastikan payload.daurohData memiliki SK yang valid
  if(!payload.daurohData.SK) {
      // Jika SK kosong (misal dari form baru, walau edit), ambil dari route
      payload.daurohData.SK = eventSK;
  }
  const success = await daurohStore.updateTiketDaurohBasic({
      ...payload.daurohData,
      SK: payload.daurohData.SK! // Assert string karena sudah dicek
  });
  if (success) toastStore.showToast({ message: 'Info dasar berhasil diperbarui.', type: 'success' });
  isSavingBasic.value = false;
};

const addScheduleDay = () => formState.scheduleDays.push({ tempId: nextTempId++, date: '', start_time: '', end_time: '' });
const removeScheduleDay = (idx: number) => formState.scheduleDays.splice(idx, 1);

const handleScheduleSubmit = async () => {
    if (!eventData.value?.SK) return;
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
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
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
};

// [FIX] Helper Logic yang aman
const convertToInputTime = (t: string) => {
  if (!t) return '';
  if (t.includes(' ')) { 
     const parts = t.split(' ');
     const time = parts[0];
     const mod = parts[1];
     if (!time) return t; // Safety

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
const formatEventDates = (d: any) => { return d ? 'Lihat Jadwal' : '-'; }; 
</script>

<style scoped>
.bg-soft-gray { background-color: #f8f9fc; }
.sticky-sidebar { position: sticky; top: 1.5rem; z-index: 10; }
.aspect-ratio-3x4 { aspect-ratio: 3/4; }
.inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
.cursor-pointer { cursor: pointer; }
.icon-sq { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; flex-shrink: 0; }
.modern-textarea {
  background-color: #f8f9fa; border: 1px solid #edf2f7; border-radius: 0.75rem;
  font-size: 0.95rem; line-height: 1.6; padding: 1rem; resize: vertical; transition: all 0.2s;
}
.modern-textarea:focus { background-color: #fff; border-color: var(--bs-primary); box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.1); }
.group-hover-img .hover-opacity-100 { opacity: 0; }
.group-hover-img:hover .hover-opacity-100 { opacity: 1; }
.transition-opacity { transition: opacity 0.3s ease; }
.transform-hover:hover { transform: translateY(-2px); }
.hover-border-primary:hover { border-color: var(--bs-primary) !important; }
.animate-pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
</style>