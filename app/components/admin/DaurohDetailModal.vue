<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Detail Event: {{ eventData ? eventData.Title : 'Memuat...' }}
          </h5>
          <button type="button" class="btn-close" @click="close" :disabled="isSavingPicture || isSavingSchedule || isConvertingPhoto"></button>
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
                    <dt class="col-4 text-truncate">SK</dt>
                    <dd class="col-8">{{ eventData?. SK }}</dd>

                    <dt class="col-4 text-truncate">Judul</dt>
                    <dd class="col-8">{{ eventData?.Title }}</dd>

                    <dt class="col-4 text-truncate">Tempat</dt>
                    <dd class="col-8">{{ eventData?.Place || '-' }}</dd>

                    <dt class="col-4 text-truncate">Target</dt>
                    <dd class="col-8 text-capitalize">{{ eventData?.Gender || 'Umum' }}</dd>

                    <dt class="col-4 text-truncate">Harga</dt>
                    <dd class="col-8">{{ formatCurrency(eventData?.Price) }}</dd>
                  </dl>
                  
                  <button @click="openEditBasicModal" class="btn btn-outline-secondary btn-sm w-100 mt-3">
                    <i class="bi bi-pencil me-1"></i> Edit Info Dasar
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
                      :id="'photoInputModal-' + (eventData?. SK || 'new')"
                    />
                    <label :for="'photoInputModal-' + (eventData?. SK || 'new')" class="btn btn-sm btn-outline-secondary w-100 mt-2">
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
                        <input :id="'date-modal-' + day.tempId" type="date" class="form-control form-control-sm" v-model="day.date" required />
                        </div>

                      <div class="col-6 col-sm-3">
                        <label :for="'start-time-modal-' + day.tempId" class="form-label small mb-1">Mulai *</label>
                        <input :id="'start-time-modal-' + day.tempId" type="time" class="form-control form-control-sm" v-model="day.start_time" required />
                      </div>

                      <div class="col-6 col-sm-3">
                        <label :for="'end-time-modal-' + day.tempId" class="form-label small mb-1">Selesai *</label>
                        <input :id="'end-time-modal-' + day.tempId" type="time" class="form-control form-control-sm" v-model="day.end_time" required />
                      </div>

                      <div class="col-12 col-sm-2 text-sm-end mt-2 mt-sm-0">
                        <label class="form-label small mb-1 d-block d-sm-none">&nbsp;</label> <label class="form-label small mb-1 d-none d-sm-block">&nbsp;</label> 
                        
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
                        :disabled="isSavingSchedule || formState.scheduleDays.length === 0"
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
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isSavingPicture || isSavingSchedule || isConvertingPhoto">Tutup</button>
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
// * import 'computed'
import { ref, reactive, watch, nextTick, computed } from 'vue';
import { useDaurohStore } from '@/stores/dauroh';
import Swal from 'sweetalert2';
import type { Dauroh, DaurohDayDetail, DaurohBasicData } from '@/stores/dauroh';

// * Ambil config runtime
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

// Definisikan tipe untuk item jadwal di form
interface ScheduleDayForm extends DaurohDayDetail {
  tempId: number;
}

// Props
const props = defineProps<{
  show: boolean;
  dauroh: Dauroh | null; // * Mengganti 'daurohSk' menjadi 'dauroh'
}>();

// Emits
const emit = defineEmits(['close', 'updated']);

const daurohStore = useDaurohStore();

// State Internal Modal
// const loading = ref(false); // * Dihapus
const isSavingPicture = ref(false);
const isSavingSchedule = ref(false);
// const eventData = ref<Dauroh | null>(null); // * Diganti dengan computed
const eventData = computed(() => props.dauroh); // * Data diambil dari props

const formState = reactive({ scheduleDays: [] as ScheduleDayForm[] });
const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);
const isConvertingPhoto = ref(false);
const showEditBasicModal = ref(false);
let nextTempId = 0;

const onImageError = (event: Event) => {
  (event.target as HTMLImageElement).style.display = 'none';
  previewUrl.value = null; 
};

// Fungsi Tutup Modal
const close = () => {
  if (!isSavingPicture.value && !isSavingSchedule.value && !isConvertingPhoto.value) {
    emit('close');
  } else {
    Swal.fire('Mohon tunggu', 'Sedang ada proses penyimpanan atau konversi.', 'warning');
  }
};

// Format Mata Uang
const formatCurrency = (value?: number | null) =>
  (value === null || value === undefined || value === 0)
    ? 'Gratis'
    : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

// * Mengganti watch fetch data dengan watch untuk populate form
watch(() => props.show, (newShow) => {
  if (newShow && props.dauroh) {
    // Reset states
    newPhotoBase64.value = null;
    photoError.value = null;
    isSavingPicture.value = false;
    isSavingSchedule.value = false;
    isConvertingPhoto.value = false;
    showEditBasicModal.value = false;
    if (fileInput.value) fileInput.value.value = '';

    // Set preview URL dari prop
    previewUrl.value = props.dauroh.Picture 
      ? `${imgBaseUrl.value}/${props.dauroh. SK}/${props.dauroh.Picture}.webp?t=${Date.now()}` 
      : null;

    // Populate schedule dari prop
    formState.scheduleDays = [];
    nextTempId = 0;
    if (props.dauroh.Date && typeof props.dauroh.Date === 'object') {
      Object.values(props.dauroh.Date).forEach((day) => {
        if (day?.date && day?.start_time && day?.end_time) {
          formState.scheduleDays.push({ tempId: nextTempId++, ...day });
        }
      });
      formState.scheduleDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }
}, { immediate: true });


// Fungsi Jadwal
const addScheduleDay = () => formState.scheduleDays.push({ tempId: nextTempId++, date: '', start_time: '', end_time: '' });
const removeScheduleDay = (index: number) => formState.scheduleDays.splice(index, 1);
const handleScheduleSubmit = async () => {
    // * Ambil SK dari eventData (computed)
    if (!eventData.value?. SK) return; 
    if (formState.scheduleDays.some((d) => !d.date || !d.start_time || !d.end_time))
        return Swal.fire('Error', 'Semua kolom jadwal (Tanggal, Mulai, Selesai) wajib diisi.', 'error');

    isSavingSchedule.value = true;
    const dateObject: Record<string, DaurohDayDetail> = {};
    const sortedDays = [...formState.scheduleDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedDays.forEach((d, i) => {
        const { tempId, ...dayData } = d;
        dateObject[`day_${i + 1}`] = dayData;
    });

    try {
        // Ambil SK dari eventData
        const ok = await daurohStore.updateDaurohSchedule(eventData.value. SK, dateObject);
        if (ok) {
            if (eventData.value) { 
                eventData.value.Date = dateObject;
                formState.scheduleDays = sortedDays.map((d, i) => ({ ...d, tempId: i }));
                nextTempId = sortedDays.length; 
            }
            Swal.fire('Berhasil', 'Jadwal berhasil disimpan.', 'success');
            emit('updated'); 
        } else {
            throw new Error('Gagal menyimpan jadwal (store).');
        }
    } catch (err: any) {
        console.error("Error simpan jadwal:", err);
        Swal.fire('Error', err.message || 'Terjadi kesalahan saat menyimpan jadwal.', 'error');
    } finally {
        isSavingSchedule.value = false;
    }
};

// --- Fungsi Picture ---
const handleFileChange = (e: Event) => {
  photoError.value = null;
  newPhotoBase64.value = null;
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) {
      previewUrl.value = eventData.value?.Picture 
        ? `${imgBaseUrl.value}/${eventData.value. SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
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
          ? `${imgBaseUrl.value}/${eventData.value. SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
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
        ? `${imgBaseUrl.value}/${eventData.value. SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
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
      ? `${imgBaseUrl.value}/${eventData.value. SK}/${eventData.value.Picture}.webp?t=${Date.now()}` 
      : null; 
    newPhotoBase64.value = null;
  };
  img.src = src;
};

const handlePictureSubmit = async () => {
  // Ambil SK dari eventData
  if (!eventData.value?. SK || !newPhotoBase64.value) return; 
  isSavingPicture.value = true;
  try {
    // Ambil SK dari eventData
    const success = await daurohStore.uploadEventPhoto(eventData.value. SK, newPhotoBase64.value);
    if (success) {
        // Ambil SK dari eventData
        const updatedData = await daurohStore.fetchDaurohDetail(eventData.value. SK);
        
        // tidak bisa update eventData (karena computed), tapi bisa update previewUrl
        if(updatedData) {
            previewUrl.value = updatedData.Picture ? `${imgBaseUrl.value}/${updatedData. SK}/${updatedData.Picture}.webp?t=${Date.now()}` : null; // Update preview dgn URL baru
        } else {
             previewUrl.value = newPhotoBase64.value; 
        }
        
        newPhotoBase64.value = null; 
        if (fileInput.value) fileInput.value.value = ''; 
        Swal.fire('Berhasil', 'Picture berhasil diperbarui.', 'success');
        emit('updated'); 
    } else {
        throw new Error('Gagal menyimpan Picture (store).');
    }
  } catch (err: any) {
    console.error("Error simpan Picture:", err);
    Swal.fire('Error', err.message || 'Gagal menyimpan Picture.', 'error');
  } finally {
    isSavingPicture.value = false;
  }
};

// --- Fungsi Modal Edit Info Dasar ---
const openEditBasicModal = () => (showEditBasicModal.value = true);
const closeEditBasicModal = () => (showEditBasicModal.value = false);
const handleUpdateBasicInfo = async (payload: { daurohData: DaurohBasicData, photoBase64: null }) => {
  if (!payload.daurohData. sk || payload.daurohData. sk !== eventData.value?. SK) {
    return Swal.fire('Error', 'SK tidak valid atau tidak cocok.', 'error');
  }

  // tidak punya state 'loading' internal lagi, tapi bisa pakai 'isSavingSchedule'
  isSavingSchedule.value = true; 
  const success = await daurohStore.updateTiketDaurohBasic(payload.daurohData);

  if (success) {
    closeEditBasicModal();
    //  tidak bisa update eventData.value, tapi bisa emit 'updated'
    // Parent (TiketDaurohManager) akan fetch ulang dan mengirim prop baru
    emit('updated');
    Swal.fire('Berhasil', 'Informasi dasar berhasil diperbarui.', 'success');
  }
  isSavingSchedule.value = false;
};

</script>

<style scoped>
.modal-body {
  max-height: 75vh;
}
.content-card {
  border: none;
  border-radius: 0.75rem;
  /* box-shadow: 0 4px 12px rgba(0,0,0,0.05); */ 
}
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
.fs-sm {
    font-size: 0.875rem;
}
.Picture-container {
  max-width: 100%;
  width: 280px;
}
.Picture-preview {
  max-height: 380px;
  width: 100%;
  object-fit: contain;
  border: 1px solid #dee2e6;
}
.Picture-preview-placeholder {
  width: 100%;
  min-height: 250px;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.5rem;
}
.day-label {
  font-size: 0.7rem;
  color: #6c757d;
  padding: 0.1rem 0.4rem;
  background-color: #e9ecef !important;
  top: -1px; 
  left: -1px; 
  border-bottom-right-radius: 0.25rem !important; 
  border-top-left-radius: 0.5rem !important; 
}
.schedule-day-row {
    background-color: #fff;
    padding-top: 1.5rem !important; 
}

@media (max-width: 575.98px) {
  .schedule-day-row .text-sm-end {
    text-align: left !important;
  }
   .schedule-day-row .btn-outline-danger {
       margin-top: 0.5rem;
   }
}

#scheduleFormModal > .schedule-day-row:first-child {
    margin-top: 0.5rem;
}

.fs-sm dt.text-truncate {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style>