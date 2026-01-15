<template>
  <div v-if="show" class="modal fade show d-block backdrop-blur" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
        
        <div class="modal-header border-0 px-4 pt-3 pb-2 d-flex align-items-center">
          <div class="d-flex align-items-center gap-3">
             <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                <i class="bi bi-calendar-check fs-5"></i>
             </div>
             <div>
               <h5 class="modal-title fw-bold text-dark mb-0 fs-5">Detail Event</h5>
               <p class="text-muted small mb-0">{{ eventData ? eventData.Title : 'Memuat data...' }}</p>
             </div>
          </div>
          <button type="button" class="btn-close bg-light p-2 rounded-circle" @click="close" :disabled="isSavingPicture || isSavingSchedule || isConvertingPhoto || isSavingBasic"></button>
        </div>

        <div class="modal-body px-4 py-3 bg-soft-gray">
          
          <div v-if="!eventData" class="alert alert-warning text-center border-0 shadow-sm rounded-3">
            <i class="bi bi-exclamation-triangle me-2"></i> Data event tidak ditemukan.
          </div>

          <div v-if="eventData" class="row g-4">
            <div class="col-lg-4 d-flex flex-column gap-3">
              
              <div class="bg-white p-3 rounded-3 shadow-sm border border-light">
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                   <h6 class="fw-bold mb-0 text-dark small text-uppercase ls-1">Informasi Dasar</h6>
                   <button @click="openEditBasicModal" class="btn btn-light btn-sm text-primary py-0 px-2" style="font-size: 0.75rem;">
                      <i class="bi bi-pencil me-1"></i> Edit
                   </button>
                </div>

                <div class="info-list small">
                   <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Tanggal</span>
                      <span class="fw-medium text-end">{{ formatEventDates(eventData?.Date) }}</span>
                   </div>
                   <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Tempat</span>
                      <span class="fw-medium text-end">{{ eventData?.Place || '-' }}</span>
                   </div>
                   <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Target</span>
                      <span class="fw-medium text-end text-capitalize">
                        {{ eventData?.Gender === 'ikhwan, akhwat' ? 'Umum (Mix)' : eventData?.Gender }}
                      </span>
                   </div>
                   <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Harga</span>
                      <span class="fw-bold text-primary text-end">{{ formatCurrency(eventData?.Price) }}</span>
                   </div>

                   <div class="bg-light p-2 rounded-2 mt-3 mb-2">
                      <div class="d-flex justify-content-between mb-1" v-if="showTotal">
                         <span class="text-muted x-small">Total Kuota</span>
                         <span class="fw-bold x-small">{{ formatQuota(eventData?.Quota_Total) }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-1" v-if="showIkhwan">
                         <span class="text-muted x-small">Ikhwan</span>
                         <span class="fw-bold x-small">{{ formatQuota(eventData?.Quota_Ikhwan) }}</span>
                      </div>
                      <div class="d-flex justify-content-between" v-if="showAkhwat">
                         <span class="text-muted x-small">Akhwat</span>
                         <span class="fw-bold x-small">{{ formatQuota(eventData?.Quota_Akhwat) }}</span>
                      </div>
                   </div>

                   <template v-if="eventData.Registration">
                      <div class="border-top pt-2 mt-2">
                         <span class="d-block text-muted x-small mb-1">Periode Pendaftaran</span>
                         <div class="d-flex gap-2 x-small">
                            <span class="badge bg-success-subtle text-success border border-success-subtle">
                               <i class="bi bi-play-fill"></i> {{ formatDate(eventData.Registration.start_registration) }}
                            </span>
                            <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
                               <i class="bi bi-stop-fill"></i> {{ formatDate(eventData.Registration.end_registration) }}
                            </span>
                         </div>
                      </div>
                   </template>
                </div>
              </div>

              <div class="bg-white p-3 rounded-3 shadow-sm border border-light flex-grow-1">
                 <div class="d-flex justify-content-between align-items-center mb-3">
                   <h6 class="fw-bold mb-0 text-dark small text-uppercase ls-1">Poster / Gambar</h6>
                   <button
                    v-if="newPhotoBase64"
                    type="button"
                    class="btn btn-primary btn-sm py-0 px-2 x-small"
                    :disabled="isSavingPicture || isConvertingPhoto"
                    @click="handlePictureSubmit"
                  >
                    <span v-if="isSavingPicture" class="spinner-border spinner-border-sm me-1" />
                    {{ isSavingPicture ? 'Simpan' : 'Simpan' }}
                  </button>
                 </div>
                 
                 <div class="text-center">
                    <div class="Picture-container mx-auto position-relative rounded-3 overflow-hidden bg-light border border-dashed d-flex align-items-center justify-content-center">
                        <img
                          v-if="previewUrl"
                          :src="previewUrl"
                          alt="Preview"
                          class="Picture-preview"
                          @error="onImageError"
                        />
                        <div v-else class="text-muted p-4">
                           <i class="bi bi-image fs-1 opacity-50"></i>
                           <div class="small mt-2">Belum ada gambar</div>
                        </div>

                        <div class="position-absolute bottom-0 start-0 end-0 p-2 bg-gradient-dark">
                             <input
                              ref="fileInput"
                              type="file"
                              accept="image/*"
                              @change="handleFileChange"
                              class="d-none"
                              :id="'photoInputModal-' + (eventData?.SK || 'new')"
                            />
                            <label :for="'photoInputModal-' + (eventData?.SK || 'new')" class="btn btn-sm btn-light w-100 shadow-sm opacity-90">
                              <i class="bi bi-camera me-1"></i> {{ previewUrl ? 'Ganti' : 'Upload' }}
                            </label>
                        </div>
                    </div>
                    
                    <canvas ref="canvas" style="display: none;"></canvas>
                    <div v-if="photoError" class="alert alert-danger mt-2 x-small p-1 mb-0">{{ photoError }}</div>
                    <div v-if="isConvertingPhoto" class="text-muted mt-2 x-small">
                        <span class="spinner-border spinner-border-sm me-1"></span> Mengompres...
                    </div>
                 </div>
              </div>

            </div>

            <div class="col-lg-8">
              <div class="bg-white p-4 rounded-3 shadow-sm border border-light h-100">
                <div class="d-flex justify-content-between align-items-center mb-4">
                   <div>
                      <h6 class="fw-bold mb-1 text-dark small text-uppercase ls-1">Jadwal Kegiatan</h6>
                      <p class="text-muted x-small mb-0">Atur rundown hari pelaksanaan.</p>
                   </div>
                   <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="addScheduleDay">
                    <i class="bi bi-plus-lg me-1"></i> Tambah Hari
                  </button>
                </div>

                <form @submit.prevent="handleScheduleSubmit" id="scheduleFormModal">
                    <div v-if="formState.scheduleDays.length === 0" class="text-center py-5 border border-dashed rounded-3 bg-light text-muted">
                       <i class="bi bi-calendar-x fs-1 opacity-50"></i>
                       <p class="small mt-2 mb-0">Belum ada jadwal yang diatur.</p>
                       <button type="button" class="btn btn-link btn-sm text-decoration-none" @click="addScheduleDay">Mulai tambah jadwal</button>
                    </div>

                    <div class="schedule-list">
                      <div
                      v-for="(day, index) in formState.scheduleDays"
                      :key="day.tempId"
                      class="schedule-card mb-3"
                      >
                      <div class="position-relative bg-light p-3 rounded-3 border border-light-subtle schedule-item pe-5">
        
                        <button 
                        type="button" 
                        class="btn btn-icon btn-sm text-danger position-absolute top-0 end-0 mt-2 me-2 border-0 bg-transparent" 
                        @click="removeScheduleDay(index)" 
                        title="Hapus Hari Ini"
                        style="z-index: 5;"
                        >
                        <i class="bi bi-trash-fill fs-6"></i>
                      </button>

                      <div class="d-flex align-items-center gap-3">
                        <div class="d-flex flex-column align-items-center justify-content-center bg-white border rounded-3 p-2 shadow-sm flex-shrink-0" style="min-width: 60px; height: 60px;">
                          <small class="text-muted x-small text-uppercase" style="font-size: 0.65rem;">Hari</small>
                          <span class="fw-bold fs-4 text-primary lh-1">{{ index + 1 }}</span>
                        </div>

                        <div class="flex-grow-1 row g-2">
                          <div class="col-12 col-md-5">
                            <label class="form-label x-small text-muted mb-1">Tanggal</label>
                            <input type="date" class="form-control modern-input" v-model="day.date" :min="minDate" required>
                          </div>
                          <div class="col-6 col-md-3">
                            <label class="form-label x-small text-muted mb-1">Mulai</label>
                            <input type="time" class="form-control modern-input" v-model="day.start_time" :min="getMinStartTime(day.date)" required>
                          </div>
                          <div class="col-6 col-md-3">
                            <label class="form-label x-small text-muted mb-1">Selesai</label>
                            <input type="time" class="form-control modern-input" v-model="day.end_time" required>
                          </div>
                        </div>
                      </div>
                         </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-top text-end" v-if="formState.scheduleDays.length > 0">
                      <button
                        type="submit"
                        class="btn btn-primary px-4 rounded-3 shadow-sm"
                        :disabled="isSaveDisabled" 
                      >
                        <span v-if="isSavingSchedule" class="spinner-border spinner-border-sm me-2" />
                        {{ isSavingSchedule ? 'Menyimpan...' : 'Simpan Perubahan Jadwal' }}
                      </button>
                    </div>
                </form>

              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer border-0 px-4 py-3 bg-light">
          <button type="button" class="btn btn-secondary px-4 rounded-3" @click="close" :disabled="isSavingPicture || isSavingSchedule || isConvertingPhoto || isSavingBasic">Tutup</button>
        </div>

      </div>
    </div>
  </div>

  <AdminDaurohFormModal
    v-if="showEditBasicModal"
    :show="showEditBasicModal"
    :is-editing="true"
    :dauroh="eventData || undefined"
    @close="closeEditBasicModal"
    @save="handleUpdateBasicInfo"
  />

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
// SCRIPT TIDAK DIUBAH SAMA SEKALI, HANYA TEMPLATE & STYLE
// Copy isi script dari codingan kamu sebelumnya.
import { ref, reactive, watch, computed } from 'vue';
import { useDaurohStore } from '@/stores/dauroh';
import Swal from 'sweetalert2';
import { useToastStore } from '@/stores/toast';
import type { Dauroh, DaurohDayDetail, DaurohBasicData } from '@/stores/dauroh';

const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

interface ScheduleDayForm extends DaurohDayDetail {
  tempId: number;
}

const props = defineProps<{
  show: boolean;
  dauroh: Dauroh | null; 
}>();

const emit = defineEmits(['close', 'updated']);

const daurohStore = useDaurohStore();
const toastStore = useToastStore();

const isSavingPicture = ref(false);
const isSavingSchedule = ref(false);
const isSavingBasic = ref(false); 

const isConvertingPhoto = ref(false);
const showEditBasicModal = ref(false);
let nextTempId = 0;

const eventData = computed(() => props.dauroh); 

const showTotal = computed(() => eventData.value?.Gender?.toLowerCase().includes('ikhwan, akhwat'));
const showIkhwan = computed(() => {
    const g = eventData.value?.Gender?.toLowerCase() || '';
    return g === 'ikhwan' || g.includes('ikhwan, akhwat');
});
const showAkhwat = computed(() => {
    const g = eventData.value?.Gender?.toLowerCase() || '';
    return g === 'akhwat' || g.includes('ikhwan, akhwat');
});

const formState = reactive({ scheduleDays: [] as ScheduleDayForm[] });
const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);

const hasOriginalSchedule = computed(() => {
    const dates = eventData.value?.Date;
    return dates && typeof dates === 'object' && Object.keys(dates).length > 0;
});

const isSaveDisabled = computed(() => {
    const isEmptyNow = formState.scheduleDays.length === 0;
    if (isSavingSchedule.value) return true;
    if (isEmptyNow && !hasOriginalSchedule.value) return true;
    return false;
});

const minDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const getMinStartTime = (selectedDate: string) => {
  if (!selectedDate) return undefined;
  if (selectedDate === minDate.value) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return undefined;
};

const convertToInputTime = (timeStr: string) => {
  if (!timeStr) return '';
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  const cleanStr = timeStr.replace('.', ':'); 
  const parts = cleanStr.split(' ');
  const time = parts[0] || '';
  const modifier = parts[1] || '';

  if (!time) return '';

  const timeParts = time.split(':');
  let hours = timeParts[0] || '00';
  const minutes = timeParts[1] || '00';

  if (hours === '12') hours = '00';
  if (modifier === 'PM') {
    const h = parseInt(hours, 10);
    if (!isNaN(h)) hours = (h + 12).toString();
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
};

const convertFromInputTime = (timeStr: string) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const hourStr = parts[0] || '00';
  const minStr = parts[1] || '00';

  let hour = parseInt(hourStr, 10);
  
  const modifier = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;

  const padHour = hour.toString().padStart(2, '0');
  return `${padHour}.${minStr} ${modifier}`;
};

const onImageError = (event: Event) => {
  (event.target as HTMLImageElement).style.display = 'none';
  previewUrl.value = null; 
};

const close = () => {
  if (!isSavingPicture.value && !isSavingSchedule.value && !isConvertingPhoto.value && !isSavingBasic.value) {
    emit('close');
  } else {
    Swal.fire('Mohon tunggu', 'Sedang ada proses penyimpanan atau konversi.', 'warning');
  }
};

const formatCurrency = (value?: number | null) =>
  (value === null || value === undefined || value === 0)
    ? 'Gratis'
    : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatQuota = (value?: number | string | null) => {
  if (value === 'non-quota') return '(Non-Quota)';
  if (value === undefined || value === null || isNaN(Number(value))) return '(Non-Quota)';
  return `${value} Orang`;
};

// Helper format date lengkap (Tgl + Jam + Menit + Detik)
const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    // 'new Date(dateStr.replace(" ", "T"))'
    const safeDateStr = dateStr.replace(' ', 'T');
    return new Date(safeDateStr).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', year: 'numeric',
    });
};

const formatEventDates = (dateObj: any) => {
  if (!dateObj || typeof dateObj !== 'object') return '-';
  
  const rawDates = Object.values(dateObj)
    .map((d: any) => d?.date)
    .filter((d: any) => typeof d === 'string' && d) as string[]; 

  const validDates = rawDates
    .map(dateStr => new Date(dateStr))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (validDates.length === 0) return '-';

  const first = validDates[0] !;
  const toDateStr = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const toMonthYear = (d: Date) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const last = validDates[validDates.length - 1] !;
  const sameMonthYear = (parsedDate: Date) => parsedDate.getMonth() === first.getMonth() && parsedDate.getFullYear() === first.getFullYear();
  const isSameMonthYear = validDates.every(sameMonthYear);

  if (isSameMonthYear) {
     const days = validDates.map(d => d.getDate()); 
     const monthYear = toMonthYear(first);
     return `${days.join(', ')} ${monthYear}`;
  }

  return validDates.map(toDateStr).join(', ');
};

watch(() => props.show, (newShow) => {
  if (newShow && props.dauroh) {
    newPhotoBase64.value = null;
    photoError.value = null;
    isSavingPicture.value = false;
    isSavingSchedule.value = false;
    isSavingBasic.value = false;
    isConvertingPhoto.value = false;
    showEditBasicModal.value = false;
    if (fileInput.value) fileInput.value.value = '';

    previewUrl.value = props.dauroh.Picture 
      ? `${imgBaseUrl.value}/${props.dauroh.SK}/${props.dauroh.Picture}.webp?t=${Date.now()}` 
      : null;

    formState.scheduleDays = [];
    nextTempId = 0;
    if (props.dauroh.Date && typeof props.dauroh.Date === 'object') {
      Object.values(props.dauroh.Date).forEach((day) => {
        if (day?.date && day?.start_time && day?.end_time) {
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
  }
}, { immediate: true });

const addScheduleDay = () => formState.scheduleDays.push({ tempId: nextTempId++, date: '', start_time: '', end_time: '' });
const removeScheduleDay = (index: number) => formState.scheduleDays.splice(index, 1);

const handleScheduleSubmit = async () => {
    if (!eventData.value?.SK) return; 
    
    if (formState.scheduleDays.length > 0) {
        if (formState.scheduleDays.some((d) => !d.date || !d.start_time || !d.end_time))
            return Swal.fire('Error', 'Semua kolom jadwal (Tanggal, Mulai, Selesai) wajib diisi.', 'error');
    }

    for (let i = 0; i < formState.scheduleDays.length; i++) {
        const day = formState.scheduleDays[i];
        if (!day) continue; 
        if (day.end_time <= day.start_time) {
            return Swal.fire(
                'Jam Tidak Valid', 
                `Pada Hari ke-${i + 1}: Jam selesai (${day.end_time}) tidak boleh lebih awal atau sama dengan jam mulai (${day.start_time}).`, 
                'warning'
            );
        }
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

        const ok = await daurohStore.updateDaurohSchedule(eventData.value.SK, dateObject);
        
        if (ok) {
            toastStore.showToast({ message: 'Jadwal berhasil disimpan.', type: 'success' });
            emit('updated'); 
        }
    } catch (err: any) {
        console.error(err);
        Swal.fire('Error', err.message || 'Terjadi kesalahan saat menyimpan jadwal.', 'error');
    } finally {
        isSavingSchedule.value = false;
    }
};

const handleFileChange = (e: Event) => {
  photoError.value = null;
  newPhotoBase64.value = null;
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) {
      previewUrl.value = eventData.value?.Picture 
        ? `${imgBaseUrl.value}/${eventData.value.SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
        : null;
      if (fileInput.value) fileInput.value.value = ''; 
      return;
  }
  if (!file.type.startsWith('image/')) {
      photoError.value = 'File harus berupa gambar.';
      if (fileInput.value) fileInput.value.value = ''; 
      return;
  }
  if (file.size > 5 * 1024 * 1024) {
      photoError.value = 'Ukuran file maks 5MB.';
      if (fileInput.value) fileInput.value.value = ''; 
      return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target?.result as string;
    previewUrl.value = base64; 
    convertToWebP(base64);
  };
  reader.onerror = () => {
      photoError.value = 'Gagal membaca file.';
      if (fileInput.value) fileInput.value.value = ''; 
  };
  reader.readAsDataURL(file);
};

const convertToWebP = (src: string) => {
  isConvertingPhoto.value = true;
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx || !canvas.value) {
        photoError.value = 'Kanvas tidak tersedia.';
        isConvertingPhoto.value = false;
        if (fileInput.value) fileInput.value.value = ''; 
        previewUrl.value = eventData.value?.Picture 
          ? `${imgBaseUrl.value}/${eventData.value.SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
          : null; 
        return;
    }
    const MAX_WIDTH = 800;
    let { naturalWidth: w, naturalHeight: h } = img;
    if (w > MAX_WIDTH) { const r = MAX_WIDTH / w; w = MAX_WIDTH; h *= r; }
    canvas.value.width = w; canvas.value.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    try {
      const webpData = canvas.value.toDataURL('image/webp', 0.8);
      if (!webpData || webpData === 'data:,') throw new Error('Gagal konversi WebP: data kosong.');
      newPhotoBase64.value = webpData; 
    } catch (err: any) {
      console.error("Gagal konversi ke WebP:", err);
      photoError.value = 'Gagal konversi ke WebP. Coba format lain.';
      newPhotoBase64.value = null;
      if (fileInput.value) fileInput.value.value = ''; 
      previewUrl.value = eventData.value?.Picture 
        ? `${imgBaseUrl.value}/${eventData.value.SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
        : null; 
    } finally {
      isConvertingPhoto.value = false;
    }
  };
  img.onerror = () => {
    photoError.value = 'Gagal memuat gambar.';
    isConvertingPhoto.value = false;
    if (fileInput.value) fileInput.value.value = ''; 
    previewUrl.value = eventData.value?.Picture 
      ? `${imgBaseUrl.value}/${eventData.value.SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
      : null; 
    newPhotoBase64.value = null;
  };
  img.src = src;
};

const handlePictureSubmit = async () => {
  if (!eventData.value?.SK || !newPhotoBase64.value) return; 
  isSavingPicture.value = true;
  try {
    const success = await daurohStore.uploadEventPhoto(eventData.value.SK, newPhotoBase64.value);
    if (success) {
            toastStore.showToast({ message: 'Gambar berhasil disimpan.', type: 'success' });
            emit('updated'); 
        }

  } catch (err: any) {
    Swal.fire('Error', err.message || 'Gagal menyimpan Picture.', 'error');
  } finally {
    isSavingPicture.value = false;
  }
};

const openEditBasicModal = () => {
    if (eventData.value) {
          showEditBasicModal.value = true;
    }
};
const closeEditBasicModal = () => (showEditBasicModal.value = false);

const handleUpdateBasicInfo = async (payload: { daurohData: DaurohBasicData, photoBase64: null }) => {
  if (!payload.daurohData.SK || payload.daurohData.SK !== eventData.value?.SK) {
    return Swal.fire('Error', 'SK tidak valid atau tidak cocok.', 'error');
  }

  isSavingBasic.value = true; 
  const success = await daurohStore.updateTiketDaurohBasic(payload.daurohData);

  if (success) {
            toastStore.showToast({ message: 'Event berhasil disimpan.', type: 'success' });
            emit('updated'); 
        }
  isSavingBasic.value = false;
};
</script>

<style scoped>
/* BACKGROUND BLUR */
.backdrop-blur {
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.4);
}

.bg-soft-gray { background-color: #f9fbfd; }
.bg-gradient-dark { background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); }

/* PICTURE STYLES (DIMENSIONS KEPT AS IS) */
.Picture-container { max-width: 100%; width: 280px; height: 380px; position: relative; }
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
  border-color: var(--color-primary, #004754);
  box-shadow: 0 0 0 2px rgba(0, 71, 84, 0.1);
}

/* UTILITY */
.ls-1 { letter-spacing: 0.5px; }
.x-small { font-size: 0.75rem; }
.btn-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.border-dashed { border-style: dashed !important; }
.opacity-90 { opacity: 0.9; }
.opacity-50 { opacity: 0.5; }

/* HOVER EFFECTS */
.schedule-item { transition: background-color 0.2s; }
.schedule-item:hover { background-color: #fff !important; border-color: var(--color-primary) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

</style>