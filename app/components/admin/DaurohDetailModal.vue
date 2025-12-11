<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Detail Event: {{ eventData ? eventData.Title : 'Memuat...' }}
          </h5>
          <button type="button" class="btn-close" @click="close" :disabled="isSavingPicture || isSavingSchedule || isConvertingPhoto || isSavingBasic"></button>
        </div>

        <div class="modal-body">
          <div v-if="!eventData" class="alert alert-warning text-center">
            Data event tidak ditemukan.
          </div>

          <div v-if="eventData" class="row g-4">
            <div class="col-md-5 col-lg-4">
              <div class="card content-card shadow-sm mb-4">
                <div class="card-header bg-light py-2">
                  <h6 class="mb-0 fw-semibold">Informasi Dasar</h6>
                </div>
                <div class="card-body p-3">

                  <dl class="row mb-0 fs-sm">
                    <dt class="col-4 text-truncate">Tanggal</dt>
                    <dd class="col-8">{{ formatEventDates(eventData?.Date) }}</dd>

                    <dt class="col-4 text-truncate">Judul</dt>
                    <dd class="col-8">{{ eventData?.Title }}</dd>
                    <dt class="col-4 text-truncate">Tempat</dt>
                    <dd class="col-8">{{ eventData?.Place || '-' }}</dd>
                    <dt class="col-4 text-truncate">Target</dt>
                    <dd class="col-8 text-capitalize">
                        {{ eventData?.Gender === 'ikhwan, akhwat' ? 'Umum (Ikhwan & Akhwat)' : eventData?.Gender }}
                    </dd>
                    <dt class="col-4 text-truncate">Harga</dt>
                    <dd class="col-8">{{ formatCurrency(eventData?.Price) }}</dd>
                    
                    <template v-if="eventData.Registration">
                        <div class="col-12"><hr class="my-2 text-muted"></div>
                        <dt class="col-12 mb-1 text-primary">Periode Pendaftaran:</dt>
                        <dd class="col-12 ps-3 mb-0 small">
                            <div class="mb-1">
                                <span class="fw-bold">Mulai:</span> {{ formatDate(eventData.Registration.start_registration) }}
                            </div>
                            <div>
                                <span class="fw-bold">Selesai:</span> {{ formatDate(eventData.Registration.end_registration) }}
                            </div>
                        </dd>
                    </template>

                    <div class="col-12"><hr class="my-2"></div>
                    
                    <template v-if="showTotal">
                        <dt class="col-4 text-truncate">Total Kuota</dt>
                        <dd class="col-8 fw-bold text-primary">{{ formatQuota(eventData?.Quota_Total) }}</dd>
                    </template>
                    
                    <template v-if="showIkhwan">
                        <dt class="col-4 text-truncate">Ikhwan</dt>
                        <dd class="col-8">{{ formatQuota(eventData?.Quota_Ikhwan) }}</dd>
                    </template>

                    <template v-if="showAkhwat">
                        <dt class="col-4 text-truncate">Akhwat</dt>
                        <dd class="col-8">{{ formatQuota(eventData?.Quota_Akhwat) }}</dd>
                    </template>
                  </dl>
                  
                  <button @click="openEditBasicModal" class="btn btn-outline-secondary btn-sm w-100 mt-3">
                    <i class="bi bi-pencil me-1"></i> Edit Info & Status
                  </button>
                </div>
              </div>

              <div class="card content-card shadow-sm">
                <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-semibold">Picture Event</h6>
                  <button
                    v-if="newPhotoBase64"
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="isSavingPicture || isConvertingPhoto"
                    @click="handlePictureSubmit"
                  >
                    <span v-if="isSavingPicture" class="spinner-border spinner-border-sm me-1" />
                    {{ isSavingPicture ? 'Menyimpan...' : 'Simpan Picture' }}
                  </button>
                </div>
                <div class="card-body p-3 text-center">
                  <div class="Picture-container mb-2 d-inline-block mx-auto position-relative">
                    <img
                      v-if="previewUrl"
                      :src="previewUrl"
                      alt="Preview Picture"
                      class="img-fluid rounded shadow-sm Picture-preview d-block mx-auto"
                      @error="onImageError"
                    />
                    <div
                      v-else
                      class="Picture-preview-placeholder d-flex flex-column justify-content-center align-items-center text-muted mx-auto"
                    >
                      <i class="bi bi-image fs-1"></i>
                      <span>Belum ada Picture</span>
                    </div>

                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      @change="handleFileChange"
                      style="display: none;"
                      :id="'photoInputModal-' + (eventData?.SK || 'new')"
                    />
                    <label :for="'photoInputModal-' + (eventData?.SK || 'new')" class="btn btn-sm btn-outline-secondary w-100 mt-2">
                      <i class="bi bi-upload me-1"></i> {{ previewUrl ? 'Ganti Picture' : 'Pilih Picture' }}
                    </label>
                  </div>

                  <canvas ref="canvas" style="display: none;"></canvas>
                  <div v-if="photoError" class="alert alert-danger mt-2 small p-2">
                    {{ photoError }}
                  </div>
                  <small v-if="isConvertingPhoto" class="text-muted d-block mt-1">
                    <span class="spinner-border spinner-border-sm me-1" /> Mengonversi...
                  </small>
                </div>
              </div>
            </div>

            <div class="col-md-7 col-lg-8">
              <div class="card content-card shadow-sm">
                <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-semibold">Jadwal Event</h6>
                  <button type="button" class="btn btn-outline-primary btn-sm" @click="addScheduleDay">
                    <i class="bi bi-plus-lg me-1"></i> Tambah Hari
                  </button>
                </div>
                <div class="card-body p-3">
                  <form @submit.prevent="handleScheduleSubmit" id="scheduleFormModal">
                    <div v-if="formState.scheduleDays.length === 0" class="text-muted small mb-3 text-center py-3">
                      Belum ada jadwal. Klik "Tambah Hari" untuk memulai.
                    </div>

                    <div
                      v-for="(day, index) in formState.scheduleDays"
                      :key="day.tempId"
                      class="schedule-day-row row g-2 mb-3 align-items-center border rounded p-2 pt-3 position-relative"
                    >
                      <span class="day-label position-absolute top-0 start-0 bg-light border rounded-bottom px-2 py-1 small">
                        Hari ke-{{ index + 1 }}
                      </span>
                      <div class="col-12 col-sm-4">
                        <label :for="'date-modal-' + day.tempId" class="form-label small mb-1">Tanggal *</label>
                        <input 
                            :id="'date-modal-' + day.tempId" 
                            type="date" 
                            class="form-control form-control-sm" 
                            v-model="day.date" 
                            :min="minDate"
                            required 
                        />
                        </div>
                      <div class="col-6 col-sm-3">
                        <label :for="'start-time-modal-' + day.tempId" class="form-label small mb-1">Mulai *</label>
                        <input 
                            :id="'start-time-modal-' + day.tempId" 
                            type="time" 
                            class="form-control form-control-sm" 
                            v-model="day.start_time" 
                            :min="getMinStartTime(day.date)"
                            required 
                        />
                      </div>
                      <div class="col-6 col-sm-3">
                        <label :for="'end-time-modal-' + day.tempId" class="form-label small mb-1">Selesai *</label>
                        <input :id="'end-time-modal-' + day.tempId" type="time" class="form-control form-control-sm" v-model="day.end_time" required />
                      </div>
                      <div class="col-12 col-sm-2 text-sm-end mt-2 mt-sm-0">
                        <button
                           type="button"
                           class="btn btn-outline-danger btn-sm"
                           @click="removeScheduleDay(index)"
                           title="Hapus Hari"
                         >
                            <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="mt-3 pt-3 border-top text-end">
                      <button
                        type="submit"
                        class="btn btn-primary btn-sm"
                        :disabled="isSaveDisabled" 
                      >
                        <span v-if="isSavingSchedule" class="spinner-border spinner-border-sm me-2" />
                        {{ isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isSavingPicture || isSavingSchedule || isConvertingPhoto || isSavingBasic">Tutup</button>
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
  return `${value} Peserta`;
};

// Helper format date lengkap (Tgl + Jam + Menit + Detik)
const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    // 'new Date(dateStr.replace(" ", "T"))'
    const safeDateStr = dateStr.replace(' ', 'T');
    return new Date(safeDateStr).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
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
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/components/modals.css");
.fs-sm { font-size: 0.875rem; }
.Picture-container { max-width: 100%; width: 280px; }
.Picture-preview { max-height: 380px; width: 100%; object-fit: contain; border: 1px solid #dee2e6; }
.day-label { font-size: 0.7rem; color: #6c757d; padding: 0.1rem 0.4rem; background-color: #e9ecef !important; top: -1px; left: -1px; border-bottom-right-radius: 0.25rem !important; border-top-left-radius: 0.5rem !important; }
.schedule-day-row { background-color: #fff; padding-top: 1.5rem !important; }
#scheduleFormModal > .schedule-day-row:first-child { margin-top: 0.5rem; }
.fs-sm dt.text-truncate { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
</style>