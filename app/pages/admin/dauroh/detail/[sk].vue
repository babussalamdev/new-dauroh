<!-- app/pages/admin/dauroh/detail/[sk].vue -->
<template>
  <div>
    <AdminBreadcrumb :items="breadcrumbItems" />

    <CommonLoadingSpinner v-if="loading" class="my-5" />

    <div v-else-if="eventData" class="row g-4">
      <!-- LEFT COLUMN -->
      <div class="col-md-5 col-lg-4">
        <!-- Informasi Dasar -->
        <div class="card content-card shadow-sm mb-4">
          <div class="card-header bg-light py-2">
            <h6 class="mb-0 fw-semibold">Informasi Dasar</h6>
          </div>
          <div class="card-body p-3">
            <dl class="row mb-0 fs-sm">
              <dt class="col-sm-4">SK</dt>
              <dd class="col-sm-8">{{ eventData?.sk }}</dd>

              <dt class="col-sm-4">Judul</dt>
              <dd class="col-sm-8">{{ eventData?.Title }}</dd>

              <dt class="col-sm-4">Tempat</dt>
              <dd class="col-sm-8">{{ eventData?.Place || '-' }}</dd>

              <dt class="col-sm-4">Target</dt>
              <dd class="col-sm-8 text-capitalize">{{ eventData?.Gender || 'Umum' }}</dd>

              <dt class="col-sm-4">Harga</dt>
              <dd class="col-sm-8">{{ formatCurrency(eventData?.Price) }}</dd>
            </dl>
            <button @click="openEditBasicModal" class="btn btn-outline-secondary btn-sm w-100 mt-3">
              <i class="bi bi-pencil me-1"></i> Edit Info Dasar
            </button>
          </div>
        </div>

        <!-- Poster -->
        <div class="card content-card shadow-sm">
          <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-semibold">Poster Event</h6>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="!newPhotoBase64 || isSavingPoster || isConvertingPhoto"
              @click="handlePosterSubmit"
            >
              <span v-if="isSavingPoster" class="spinner-border spinner-border-sm me-1" />
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
              <div
                v-else
                class="poster-preview-placeholder d-flex flex-column justify-content-center align-items-center text-muted mx-auto"
              >
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
              <span class="spinner-border spinner-border-sm me-1" /> Mengonversi...
            </small>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
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

              <div
                v-for="(day, index) in formState.scheduleDays"
                :key="day.tempId"
                class="schedule-day-row row g-2 mb-3 align-items-center border rounded p-2 pt-3 position-relative"
              >
                <span class="day-label position-absolute top-0 start-0 bg-light border rounded-bottom px-2 py-1 small">
                  Hari ke-{{ index + 1 }}
                </span>

                <div class="col-sm-4">
                  <label :for="'date-' + day.tempId" class="form-label small mb-1">Tanggal *</label>
                  <input type="date" class="form-control form-control-sm" v-model="day.date" required />
                </div>

                <div class="col-sm-3">
                  <label class="form-label small mb-1">Mulai *</label>
                  <input type="time" class="form-control form-control-sm" v-model="day.start_time" required />
                </div>

                <div class="col-sm-3">
                  <label class="form-label small mb-1">Selesai *</label>
                  <input type="time" class="form-control form-control-sm" v-model="day.end_time" required />
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

    <div v-else-if="!loading && !eventData" class="alert alert-warning text-center">
      Event tidak ditemukan atau gagal dimuat.
      <NuxtLink to="/admin">Kembali ke Manajemen Event</NuxtLink>.
    </div>

    <!-- Modal Edit Info Dasar -->
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDaurohStore } from '@/stores/dauroh';
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';
import type { Dauroh, DaurohDayDetail } from '@/stores/dauroh';

interface ScheduleDayForm extends DaurohDayDetail {
  tempId: number;
}

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/admin/login');
  },
});

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();

const loading = ref(true);
const isSavingPoster = ref(false);
const isSavingSchedule = ref(false);
const eventData = ref<Dauroh | null>(null);

const daurohSkParam = route.params.sk;
const currentDaurohSk = computed(() =>
  typeof daurohSkParam === 'string' && daurohSkParam !== 'new' ? daurohSkParam : null
);

const formState = reactive({ scheduleDays: [] as ScheduleDayForm[] });
const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);
const isConvertingPhoto = ref(false);
const showEditBasicModal = ref(false);
let nextTempId = 0;

const breadcrumbItems = computed(() => [
  { text: 'Home', to: '/admin' },
  { text: 'Manajemen Event', to: '/admin' },
  { text: eventData.value ? `Detail: ${eventData.value.Title}` : 'Detail Event' },
]);

const formatCurrency = (value?: number | null) =>
  !value ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

onMounted(async () => {
  if (!currentDaurohSk.value) {
    Swal.fire('Error', 'SK Event tidak valid.', 'error');
    return router.push('/admin');
  }
  loading.value = true;
  eventData.value = await daurohStore.fetchDaurohDetail(currentDaurohSk.value);
  if (eventData.value) {
    previewUrl.value = eventData.value.poster || null;
    nextTempId = 0;
    formState.scheduleDays = [];

    if (eventData.value.Date && typeof eventData.value.Date === 'object') {
      Object.values(eventData.value.Date).forEach((day) => {
        if (day?.date && day?.start_time && day?.end_time) {
          formState.scheduleDays.push({ tempId: nextTempId++, ...day });
        }
      });
      formState.scheduleDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }
  loading.value = false;
});

const addScheduleDay = () => formState.scheduleDays.push({ tempId: nextTempId++, date: '', start_time: '', end_time: '' });
const removeScheduleDay = (i: number) => formState.scheduleDays.splice(i, 1);

// --- Poster upload & convert ---
const handleFileChange = (e: Event) => {
  photoError.value = null;
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return (photoError.value = 'File harus berupa gambar.');
  if (file.size > 5 * 1024 * 1024) return (photoError.value = 'Ukuran file maks 5MB.');

  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target?.result as string;
    previewUrl.value = base64;
    convertToWebP(base64);
  };
  reader.onerror = () => (photoError.value = 'Gagal membaca file.');
  reader.readAsDataURL(file);
};

const convertToWebP = (src: string) => {
  isConvertingPhoto.value = true;
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx || !canvas.value) return (photoError.value = 'Kanvas tidak tersedia.');
    const MAX_WIDTH = 800;
    let { naturalWidth: w, naturalHeight: h } = img;
    if (w > MAX_WIDTH) {
      const r = MAX_WIDTH / w;
      w = MAX_WIDTH;
      h *= r;
    }
    canvas.value.width = w;
    canvas.value.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    try {
      newPhotoBase64.value = canvas.value.toDataURL('image/webp', 0.8);
    } catch {
      photoError.value = 'Gagal konversi ke WebP.';
    } finally {
      isConvertingPhoto.value = false;
    }
  };
  img.onerror = () => (photoError.value = 'Gagal memuat gambar.');
  img.src = src;
};

const handlePosterSubmit = async () => {
  if (!currentDaurohSk.value || !newPhotoBase64.value) return;
  isSavingPoster.value = true;
  try {
    const success = await daurohStore.uploadEventPhoto(currentDaurohSk.value, newPhotoBase64.value);
    if (success) {
      const updated = await daurohStore.fetchDaurohDetail(currentDaurohSk.value);
      eventData.value = updated;
      previewUrl.value = updated?.poster || newPhotoBase64.value;
      Swal.fire('Berhasil', 'Poster berhasil diperbarui.', 'success');
    }
  } catch {
    Swal.fire('Error', 'Gagal menyimpan poster.', 'error');
  } finally {
    isSavingPoster.value = false;
  }
};

// --- Schedule submit ---
const handleScheduleSubmit = async () => {
  if (!currentDaurohSk.value) return;
  if (formState.scheduleDays.some((d) => !d.date || !d.start_time || !d.end_time))
    return Swal.fire('Error', 'Semua kolom wajib diisi.', 'error');

  isSavingSchedule.value = true;
  const dateObject: Record<string, DaurohDayDetail> = {};
  formState.scheduleDays.forEach((d, i) => (dateObject[`day_${i + 1}`] = { ...d }));
  try {
    const ok = await daurohStore.updateDaurohSchedule(currentDaurohSk.value, dateObject);
    if (ok) {
      eventData.value!.Date = dateObject;
      Swal.fire('Berhasil', 'Jadwal berhasil disimpan.', 'success');
    }
  } catch {
    Swal.fire('Error', 'Terjadi kesalahan saat menyimpan jadwal.', 'error');
  } finally {
    isSavingSchedule.value = false;
  }
};

// --- Basic Info Modal ---
const openEditBasicModal = () => (showEditBasicModal.value = true);
const closeEditBasicModal = () => (showEditBasicModal.value = false);

const handleUpdateBasicInfo = async (payload: { daurohData: Omit<Dauroh, 'Date'> }) => {
  if (!payload.daurohData.sk) return Swal.fire('Error', 'SK tidak valid.', 'error');
  loading.value = true;
  const success = await daurohStore.updateTiketDaurohBasic(payload.daurohData);
  if (success) {
    closeEditBasicModal();
    eventData.value = await daurohStore.fetchDaurohDetail(payload.daurohData.sk);
    Swal.fire('Berhasil', 'Informasi dasar berhasil diperbarui.', 'success');
  }
  loading.value = false;
};
</script>

<style scoped>
.content-card {
  border: none;
  border-radius: 0.75rem;
}
.poster-container {
  max-width: 320px;
}
.poster-preview {
  max-height: 420px;
  object-fit: contain;
}
.poster-preview-placeholder {
  width: 100%;
  height: 320px;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.5rem;
}
.day-label {
  font-size: 0.75rem;
  color: #555;
}
</style>
