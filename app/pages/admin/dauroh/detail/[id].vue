// app/pages/admin/dauroh/detail/[id].vue
<template>
  <div>
    <AdminBreadcrumb :items="breadcrumbItems" />

    <CommonLoadingSpinner v-if="loading" class="my-5" />

    <div v-else-if="eventData" class="row g-4">
      <div class="col-md-5 col-lg-4">
        <div class="card content-card shadow-sm mb-4">
           <div class="card-header bg-light py-2">
             <h6 class="mb-0 fw-semibold">Informasi Dasar</h6>
           </div>
           <div class="card-body p-3">
             <dl class="row mb-0 fs-sm">
               <dt class="col-sm-4">ID Event</dt>
               <dd class="col-sm-8">{{ eventData.id }}</dd>

               <dt class="col-sm-4">Judul</dt>
               <dd class="col-sm-8">{{ eventData.Title }}</dd>

               <dt class="col-sm-4">Tempat</dt>
               <dd class="col-sm-8">{{ eventData.Place || '-' }}</dd>

               <dt class="col-sm-4">Target</dt>
               <dd class="col-sm-8 text-capitalize">{{ eventData.Gender || 'Umum' }}</dd>

               <dt class="col-sm-4">Harga</dt>
               <dd class="col-sm-8">{{ formatCurrency(eventData.Price) }}</dd>
             </dl>
             <button @click="openEditBasicModal" class="btn btn-outline-secondary btn-sm w-100 mt-3">
                <i class="bi bi-pencil me-1"></i> Edit Info Dasar
             </button>
           </div>
         </div>

        <div class="card content-card shadow-sm">
          <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-semibold">Poster Event</h6>
             <button
                type="button"
                class="btn btn-primary btn-sm"
                :disabled="!newPhotoBase64 || isSavingPoster || isConvertingPhoto"
                @click="handlePosterSubmit"
             >
                <span v-if="isSavingPoster" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{ isSavingPoster ? 'Menyimpan...' : 'Simpan Poster' }}
             </button>
          </div>
          <div class="card-body p-3 text-center">
            <div class="poster-container mb-2 d-inline-block mx-auto position-relative">
              <img
                v-if="previewUrl"
                :src="previewUrl"
                alt="Preview Poster"
                class="img-fluid rounded shadow-sm poster-preview d-block mx-auto"
              />
              <div v-else class="poster-preview-placeholder d-flex flex-column justify-content-center align-items-center text-muted mx-auto">
                <i class="bi bi-image fs-1"></i>
                <span>Belum ada poster</span>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                style="display: none;"
                id="photoInputDetail"
              />
              <label for="photoInputDetail" class="btn btn-sm btn-outline-secondary w-100 mt-2">
                <i class="bi bi-upload me-1"></i> {{ previewUrl ? 'Ganti Poster' : 'Pilih Poster' }}
              </label>
            </div>
            <canvas ref="canvas" style="display: none;"></canvas>
            <div v-if="photoError" class="alert alert-danger mt-2 small p-2">
              {{ photoError }}
            </div>
            <small v-if="isConvertingPhoto" class="text-muted d-block mt-1">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Mengonversi...
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
            <form @submit.prevent="handleScheduleSubmit" id="scheduleForm">
               <div v-if="formState.scheduleDays.length === 0" class="text-muted small mb-3 text-center py-3">
                 Belum ada jadwal. Klik "Tambah Hari" untuk memulai.
               </div>
               <div v-for="(day, index) in formState.scheduleDays" :key="day.tempId" class="schedule-day-row row g-2 mb-3 align-items-center border rounded p-2 pt-3 position-relative">
                   <span class="day-label position-absolute top-0 start-0 bg-light border rounded-bottom px-2 py-1 small">Hari ke-{{ index + 1 }}</span>
                   <div class="col-sm-4">
                     <label :for="'date-' + day.tempId" class="form-label small mb-1">Tanggal *</label>
                     <input type="date" class="form-control form-control-sm" :id="'date-' + day.tempId" v-model="day.date" required>
                   </div>
                   <div class="col-sm-3">
                     <label :for="'start-' + day.tempId" class="form-label small mb-1">Mulai *</label>
                     <input type="time" class="form-control form-control-sm" :id="'start-' + day.tempId" v-model="day.start_time" required>
                   </div>
                   <div class="col-sm-3">
                     <label :for="'end-' + day.tempId" class="form-label small mb-1">Selesai *</label>
                     <input type="time" class="form-control form-control-sm" :id="'end-' + day.tempId" v-model="day.end_time" required>
                   </div>
                   <div class="col-sm-2 text-end">
                       <label class="form-label small mb-1 d-block">&nbsp;</label>
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
                 <NuxtLink to="/admin" class="btn btn-secondary btn-sm me-2">Kembali</NuxtLink>
                 <button type="submit" class="btn btn-primary btn-sm" :disabled="isSavingSchedule || formState.scheduleDays.length === 0">
                   <span v-if="isSavingSchedule" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                   {{ isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal' }}
                 </button>
               </div>
            </form>
          </div>
        </div>
      </div>
    </div>

     <div v-else-if="!loading && !eventData" class="alert alert-warning text-center">
       Event tidak ditemukan atau gagal dimuat. <NuxtLink to="/admin">Kembali ke Manajemen Event</NuxtLink>.
     </div>

     <AdminDaurohFormModal
        v-if="showEditBasicModal"
        :show="showEditBasicModal"
        :is-editing="true"
        :dauroh="eventData || undefined"
        @close="closeEditBasicModal"
        @save="handleUpdateBasicInfo"
      />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDaurohStore } from '@/stores/dauroh';
import type { Dauroh, DaurohDayDetail } from '@/stores/dauroh';
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';

// Interface helper
interface ScheduleDayForm extends DaurohDayDetail {
    tempId: number;
}

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }
});

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const { $apiBase } = useNuxtApp();

const daurohIdParam = route.params.id;
const currentDaurohId = computed(() => daurohIdParam && daurohIdParam !== 'new' ? Number(daurohIdParam) : null);

// State Loading & Saving
const loading = ref(true);
const isSavingPoster = ref(false);
const isSavingSchedule = ref(false);

// State Data Event
const eventData = ref<Dauroh | null>(null);

// State Form Jadwal
const formState = reactive({
  scheduleDays: [] as ScheduleDayForm[],
});

// State Upload Foto
const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);
const isConvertingPhoto = ref(false);

// State untuk Modal Edit Basic
const showEditBasicModal = ref(false);

// Deklarasi nextTempId
let nextTempId = 0;

// Breadcrumb
const breadcrumbItems = computed(() => [
  { text: 'Home', to: '/admin' },
  { text: 'Manajemen Event', to: '/admin' },
  { text: eventData.value ? `Detail: ${eventData.value.Title}` : 'Detail Event' }
]);

// Helper Format Currency
const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return 'Gratis'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};


// --- Fetch Data ---
onMounted(async () => {
  if (!currentDaurohId.value) {
    Swal.fire('Error', 'ID Event tidak valid.', 'error');
    router.push('/admin');
    return;
  }
  loading.value = true;
  eventData.value = await daurohStore.fetchDaurohDetail(currentDaurohId.value);
  if (eventData.value) {
    previewUrl.value = eventData.value.poster || null;
    formState.scheduleDays = [];
    nextTempId = 0; // Reset counter tempId
    if (eventData.value.Date && typeof eventData.value.Date === 'object') {
        Object.values(eventData.value.Date).forEach((dayDetail) => {
             if (dayDetail && dayDetail.date && dayDetail.start_time && dayDetail.end_time) {
                 formState.scheduleDays.push({
                     tempId: nextTempId++,
                     date: dayDetail.date,
                     start_time: dayDetail.start_time,
                     end_time: dayDetail.end_time
                 });
             }
        });
        formState.scheduleDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  } else {
      console.error("Gagal memuat data event.");
  }
  loading.value = false;
});

// --- Logika Jadwal Dinamis ---
const addScheduleDay = () => {
  formState.scheduleDays.push({
      tempId: nextTempId++,
      date: '',
      start_time: '',
      end_time: ''
  });
};
const removeScheduleDay = (index: number) => {
  formState.scheduleDays.splice(index, 1);
};

// --- Logika Upload Foto ---
const handleFileChange = (event: Event) => {
  photoError.value = null;
  newPhotoBase64.value = null;
  isConvertingPhoto.value = false;
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
      if(!eventData.value?.poster) previewUrl.value = null; // Reset preview hanya jika belum ada poster
      return;
  }
  if (!file.type.startsWith('image/')) { photoError.value = 'File harus berupa gambar.'; return; }
  const maxSizeInMB = 5;
  if (file.size > maxSizeInMB * 1024 * 1024) { photoError.value = `Ukuran file maks ${maxSizeInMB}MB.`; return; }
  const reader = new FileReader();
  reader.onload = (e) => { const base64 = e.target?.result as string; previewUrl.value = base64; convertToWebP(base64); };
  reader.onerror = () => photoError.value = 'Gagal membaca file.';
  reader.readAsDataURL(file);
};
const convertToWebP = (imageBase64: string) => {
  isConvertingPhoto.value = true; newPhotoBase64.value = null;
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.value?.getContext('2d');
    if (ctx && canvas.value) {
      const MAX_WIDTH = 800; let width = img.naturalWidth; let height = img.naturalHeight;
      if (width > MAX_WIDTH) { const ratio = MAX_WIDTH / width; width = MAX_WIDTH; height = height * ratio; }
      canvas.value.width = width; canvas.value.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const webPDataUrl = canvas.value.toDataURL('image/webp', 0.8);
        if (!webPDataUrl || webPDataUrl === 'data:,') throw new Error('Canvas empty');
        newPhotoBase64.value = webPDataUrl;
      } catch (e) {
        console.error("Gagal konversi WebP:", e);
        photoError.value = 'Gagal konversi ke WebP.';
        newPhotoBase64.value = null;
        previewUrl.value = eventData.value?.poster || null; // Kembalikan ke poster asli
      }
      finally { isConvertingPhoto.value = false; }
    } else { photoError.value = 'Gagal siapkan kanvas.'; isConvertingPhoto.value = false; }
  };
  img.onerror = () => { photoError.value = 'Gagal muat gambar.'; isConvertingPhoto.value = false; }
  img.src = imageBase64;
};


// --- Submit Handler ---
const handlePosterSubmit = async () => {
    if (!currentDaurohId.value || !newPhotoBase64.value || isSavingPoster.value || isConvertingPhoto.value) return;
    isSavingPoster.value = true;
    try {
        const success = await daurohStore.uploadEventPhoto(currentDaurohId.value, newPhotoBase64.value);
        if (success) {
            Swal.fire('Berhasil!', 'Poster berhasil diperbarui.', 'success');
            if(eventData.value) {
                 eventData.value.poster = newPhotoBase64.value; // Tampilkan base64 sementara
            }
            newPhotoBase64.value = null;
            // Fetch ulang seluruh data event agar dapat URL poster baru
             const updatedEvent = await daurohStore.fetchDaurohDetail(currentDaurohId.value);
             if(updatedEvent) {
                 eventData.value = updatedEvent;
                 previewUrl.value = updatedEvent.poster || null;
             }
        }
    } catch (error) {
        console.error("Error simpan poster:", error);
        Swal.fire('Error', 'Terjadi kesalahan saat menyimpan poster.', 'error');
    } finally {
        isSavingPoster.value = false;
    }
};

const handleScheduleSubmit = async () => {
    if (!currentDaurohId.value || isSavingSchedule.value) return;

    if (formState.scheduleDays.length === 0) {
      // Tidak ada jadwal, mungkin tidak perlu disimpan? Atau konfirmasi?
       Swal.fire('Info', 'Tidak ada jadwal untuk disimpan.', 'info');
       // Jika ingin menghapus semua jadwal, API mungkin perlu handle 'Date: {}'
       // return; // Hentikan jika tidak ingin menyimpan jadwal kosong
    }
    for (const day of formState.scheduleDays) {
        if (!day.date || !day.start_time || !day.end_time) {
            Swal.fire('Error', 'Semua kolom tanggal, waktu mulai, dan waktu selesai wajib diisi.', 'error');
            return;
        }
    }

    isSavingSchedule.value = true;
    const dateObject: { [key: string]: DaurohDayDetail } = {};
    formState.scheduleDays.forEach((day, index) => {
      dateObject[`day_${index + 1}`] = { date: day.date, start_time: day.start_time, end_time: day.end_time };
    });

    try {
        const success = await daurohStore.updateDaurohSchedule(currentDaurohId.value, dateObject);
        if (success) {
            Swal.fire('Berhasil!', 'Jadwal event berhasil diperbarui.', 'success');
            if(eventData.value) eventData.value.Date = dateObject;
        }
    } catch (error) {
         console.error("Error simpan jadwal:", error);
         Swal.fire('Error', 'Terjadi kesalahan saat menyimpan jadwal.', 'error');
    } finally {
        isSavingSchedule.value = false;
    }
};

// --- Modal Edit Basic Info ---
const openEditBasicModal = () => { showEditBasicModal.value = true; };
const closeEditBasicModal = () => { showEditBasicModal.value = false; };
const handleUpdateBasicInfo = async (payload: { daurohData: Omit<Dauroh, 'Date' | 'poster' | 'scheduleDays'>, photoBase64: null }) => {
     let success = false;
      if (payload.daurohData.id) {
          success = await daurohStore.updateTiketDaurohBasic(payload.daurohData);
          if (success) {
              closeEditBasicModal();
              // Refresh data di halaman detail
              loading.value = true;
              const updatedEvent = await daurohStore.fetchDaurohDetail(payload.daurohData.id);
               if(updatedEvent) eventData.value = updatedEvent; // Update data lokal
              loading.value = false;
          }
      }
};

</script>

<style scoped>
/* Style sama seperti sebelumnya */
.content-card {
  border: none;
  border-radius: 0.75rem;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); */
}
.card-header {
  background-color: #f8f9fa; /* Warna header lebih lembut */
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 1rem;
}
.card-body .fs-sm dd {
    font-weight: 500;
    margin-bottom: 0.5rem; /* Beri jarak antar baris */
}
.card-body .fs-sm dt {
    color: var(--bs-secondary-color);
    font-weight: 400;
     margin-bottom: 0.5rem;
}
.poster-container {
  max-width: 300px;
}
.poster-preview {
  max-height: 400px;
  width: 100%;
  object-fit: contain;
  border: 1px solid var(--bs-border-color);
}
.poster-preview-placeholder {
  height: 250px;
  width: 100%;
  max-width: 300px;
  border: 2px dashed var(--bs-border-color);
  background-color: var(--bs-tertiary-bg);
  border-radius: 0.375rem;
  flex-direction: column;
}
.schedule-day-row {
  background-color: #f8f9fa;
  padding-top: 1.75rem !important;
  margin-left: 0;
  margin-right: 0;
}
.day-label {
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    margin-left: -0.5rem;
    margin-top: -0.5rem;
    color: var(--bs-secondary-color);
}

.form-label.small {
    font-size: 0.8rem;
    color: var(--bs-secondary-color);
    margin-bottom: 0.2rem !important;
}
.form-control-sm {
    font-size: 0.875rem;
}
.text-capitalize {
  text-transform: capitalize;
}
</style>