<template>
  <div class="container-fluid px-4 py-4">
    <CommonBreadcrumb :items="breadcrumbItems" class="mb-4" />

    <div v-if="eventStore.loading.detail" class="text-center py-5">
      <div class="spinner-border text-primary border-2" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted fw-bold ls-1 txt-label">MEMUAT DATA EVENT...</p>
    </div>

    <div v-else-if="eventData">
      <!-- BARIS 1: POSTER & DESKRIPSI -->
      <div class="row g-4 mb-4">
        <div class="col-lg-4 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 d-flex flex-column">
            <div class="card-header bg-white p-3 border-bottom text-center">
              <h6 class="mb-0 fw-bold text-dark txt-label">POSTER EVENT</h6>
            </div>
            <div class="card-body p-3 d-flex flex-column justify-content-center">
              <div 
                class="upload-area border-2 border-dashed rounded-4 p-4 text-center mx-auto position-relative bg-light w-100"
                :class="{ 'border-primary bg-primary bg-opacity-10': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
              >
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="d-none" id="posterUploadPage" />
                <div v-if="!previewUrl" class="w-100">
                  <i class="bi bi-image fs-1 text-primary opacity-50"></i>
                  <p class="txt-caption fw-medium mt-2 mb-3 text-muted">Pilih atau Drag Poster ke Sini</p>
                  <label for="posterUploadPage" class="btn btn-primary btn-sm px-4 rounded-pill shadow-sm txt-caption fw-bold cursor-pointer">Browse File</label>
                </div>
                <div v-else class="w-100">
                  <div class="d-flex align-items-center justify-content-center bg-white rounded-3 shadow-sm border p-2 mb-3" style="height: 280px;">
                    <img :src="previewUrl" alt="Preview" class="Picture-preview" @error="onImageError" />
                  </div>
                  <div class="d-flex justify-content-center gap-2">
                    <label for="posterUploadPage" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold txt-caption mb-0 cursor-pointer">Ganti</label>
                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold txt-caption" @click="handleDeletePicture">Hapus</button>
                  </div>
                </div>
              </div>
              <canvas ref="canvasRef" style="display: none;"></canvas>
              <div v-if="photoError" class="alert alert-danger mt-2 txt-caption p-2 text-center">{{ photoError }}</div>
            </div>
            <div class="card-footer bg-white p-3 border-top mt-auto">
              <button type="button" class="btn btn-success w-100 rounded-pill fw-bold txt-body shadow-sm" :disabled="!newPhotoBase64 || isSavingPicture" @click="handlePictureSubmit">
                <span v-if="isSavingPicture" class="spinner-border spinner-border-sm me-1" />
                <i v-else class="bi bi-cloud-arrow-up-fill me-1"></i>
                {{ isSavingPicture ? 'Menyimpan...' : 'Simpan Poster Baru' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-8 col-xl-9">
          <section class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 d-flex flex-column">
            <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2 txt-subtitle"><i class="bi bi-file-text text-primary"></i> Deskripsi</h5>
              <div v-if="isContentChanged" class="text-warning txt-caption fw-bold animate-pulse"><i class="bi bi-circle-fill me-1" style="font-size: 8px;"></i> Belum Tersimpan</div>
            </div>
            <div class="quill-wrapper bg-light flex-grow-1">
              <div ref="editorContainer" style="height: 350px;"></div>
            </div>
            <div class="px-4 py-3 bg-white border-top d-flex justify-content-end mt-auto">
              <button @click="handleContentSubmit" class="btn btn-primary rounded-pill px-4 txt-body fw-bold" :disabled="isSavingBasic || !isContentChanged">
                <i v-if="!isSavingBasic" class="bi bi-floppy-fill me-1"></i>
                {{ isSavingBasic ? 'Menyimpan...' : 'Simpan Deskripsi' }}
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- BARIS 2: INFO DASAR & JADWAL -->
      <div class="row g-4">
        <div class="col-lg-4 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 class="fw-bold mb-0 text-dark txt-label">INFO DASAR</h6>
              <button @click="openEditBasicModal" class="btn btn-light btn-sm text-primary py-1 px-3 rounded-pill fw-bold txt-caption">Edit</button>
            </div>
            <div class="info-list d-flex flex-column gap-3 mb-4">
              <div class="d-flex justify-content-between align-items-start"><span class="text-muted txt-caption">Registrasi</span><span class="txt-body fw-bold text-end">{{ formatRegDates(eventData.Registration) }}</span></div>
              <div class="d-flex justify-content-between align-items-start"><span class="text-muted txt-caption">Lokasi</span><span class="txt-body fw-bold text-end text-truncate" style="max-width: 140px;">{{ eventData.Place }}</span></div>
              <div class="d-flex justify-content-between align-items-start"><span class="text-muted txt-caption">Peserta</span><span class="txt-body fw-bold text-end text-capitalize">{{ eventData.Gender || '-' }}</span></div>
              
              <div class="d-flex justify-content-between align-items-start">
                <span class="text-muted txt-caption">WhatsApp</span>
                <span class="txt-body fw-bold text-end">{{ eventData.Whatsapp || '-' }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-start">
                <span class="text-muted txt-caption">Kuota</span>
                <div class="text-end">
                  
                  <template v-if="eventData.Gender.toLowerCase().includes('ikhwan') && eventData.Gender.toLowerCase().includes('akhwat')">
                    <span class="txt-body fw-bold d-block">
                      {{ eventData.Quota_Total === 'non-quota' ? 'Tidak Terbatas' : (eventData.Quota_Total || '-') }}
                    </span>
                    <small v-if="eventData.Quota_Total !== 'non-quota'" class="txt-caption text-muted">
                      (Ikhwan: {{ eventData.Quota_Ikhwan || 0 }}, Akhwat: {{ eventData.Quota_Akhwat || 0 }})
                    </small>
                  </template>

                  <template v-else-if="eventData.Gender.toLowerCase() === 'ikhwan'">
                    <span class="txt-body fw-bold d-block">
                      {{ eventData.Quota_Ikhwan === 'non-quota' ? 'Tidak Terbatas' : (eventData.Quota_Ikhwan || '-') }}
                    </span>
                  </template>

                  <template v-else-if="eventData.Gender.toLowerCase() === 'akhwat'">
                    <span class="txt-body fw-bold d-block">
                      {{ eventData.Quota_Akhwat === 'non-quota' ? 'Tidak Terbatas' : (eventData.Quota_Akhwat || '-') }}
                    </span>
                  </template>

                  <template v-else>
                    <span class="txt-body fw-bold d-block">-</span>
                  </template>

                </div>
              </div>
              <div class="d-flex justify-content-between align-items-start"><span class="text-muted txt-caption">Harga</span><span class="txt-body fw-bold text-primary text-end">{{ formatCurrency(eventData.Price) }}</span></div>
            </div>
            </div>
        </div>

        <div class="col-lg-8 col-xl-9">
          <section class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 class="fw-bold mb-0 text-dark txt-label">JADWAL KEGIATAN</h6>
              <button class="btn btn-outline-primary btn-sm rounded-pill px-3 txt-caption fw-bold" @click="addScheduleDay"><i class="bi bi-plus-lg me-1"></i>Tambah Hari</button>
            </div>
            <form @submit.prevent="handleScheduleSubmit" class="d-flex flex-column flex-grow-1">
              <div v-if="formState.scheduleDays.length === 0" class="text-center py-5 rounded-4 bg-light border border-dashed flex-grow-1 d-flex align-items-center justify-content-center">
                <p class="text-muted txt-caption mb-0">Belum ada jadwal.</p>
              </div>
              <div v-else class="d-flex flex-column gap-2 flex-grow-1 overflow-auto pe-1" style="max-height: 250px;">
                <div v-for="(day, index) in formState.scheduleDays" :key="day.tempId" class="bg-light p-3 rounded-3 border position-relative">
                  <div class="row g-2 align-items-end">
                    <div class="col-md-4"><label class="txt-caption fw-bold text-muted mb-1 ps-1">Tanggal</label><input type="date" class="form-control form-control-sm modern-input txt-body fw-bold" v-model="day.date" :min="minDateJadwal" required></div>
                    <div class="col-md-3"><label class="txt-caption fw-bold text-muted mb-1 ps-1">Mulai</label><input type="time" class="form-control form-control-sm modern-time-input txt-body fw-bold" v-model="day.start_time" required></div>
                    <div class="col-md-3"><label class="txt-caption fw-bold text-muted mb-1 ps-1">Selesai</label><input type="time" class="form-control form-control-sm modern-time-input txt-body fw-bold" v-model="day.end_time" required></div>
                    <div class="col-md-2 text-end pb-1"><button type="button" class="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none" @click="removeScheduleDay(index)"><i class="bi bi-trash fs-5"></i></button></div>
                  </div>
                </div>
              </div>
              <div class="text-end mt-3 border-top pt-3 mt-auto">
                <button type="submit" class="btn btn-primary btn-sm rounded-pill px-4 txt-body fw-bold" :disabled="isSavingSchedule || !isScheduleChanged">
                  <span v-if="isSavingSchedule" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-floppy-fill me-1"></i> Simpan Jadwal
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>

    <AdminEventFormModal v-if="showEditBasicModal" :show="showEditBasicModal" :is-editing="true" :event="eventData || undefined" @close="closeEditBasicModal" @save="handleUpdateBasicInfo" />
  </div> 
</template>

<script setup lang="ts">
import { useAlert } from '~/utils/swal';
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEventStore } from '@/stores/event';
import { useToastStore } from '@/stores/toast';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

definePageMeta({ layout: 'admin' });

useHead({ title: 'Detail Event' });

const { alert: swalAlert, confirm: swalConfirm } = useAlert();
const config = useRuntimeConfig();
const route = useRoute();
const eventStore = useEventStore();
const toastStore = useToastStore();
const eventSK = String(route.params.id);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
let quillInstance: any = null;

const isSavingPicture = ref(false);
const isSavingSchedule = ref(false);
const isSavingBasic = ref(false);
let isUpdatingQuill = false;
const isSavingContact = ref(false);
const contactWaInput = ref('');
const isContentChanged = ref(false);
const showEditBasicModal = ref(false);

const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);

const formState = reactive({ scheduleDays: [] as any[] });
const contentForm = reactive({ Description: '' });

const eventData = computed(() => eventStore.currentEventDetail);
const breadcrumbItems = computed(() => [{ text: 'Manajemen Event', to: '/admin/events' }, { text: eventData.value?.Title || 'Detail Event' }]);
const minDateJadwal = computed(() => eventData.value?.Registration?.end_registration ? eventData.value.Registration.end_registration.split(' ')[0] : '');

const isScheduleChanged = computed(() => {
  if (!eventData.value?.Date && formState.scheduleDays.length > 0) return true;
  if (Object.keys(eventData.value?.Date || {}).length !== formState.scheduleDays.length) return true;
  return JSON.stringify(formState.scheduleDays) !== JSON.stringify(
    Object.values(eventData.value?.Date || {}).map((day: any, index: number) => ({
      tempId: index, ...day,
      start_time: convertTo24h(day.start_time), end_time: convertTo24h(day.end_time)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );
});

const convertTo24h = (timeStr?: string) => {
  if (!timeStr) return '';
  const cleanStr = timeStr.replace('.', ':');
  const [time, modifier] = cleanStr.split(' ');
  if (!time) return '';
  let [hours, minutes] = time.split(':');
  let h = parseInt(hours || "0", 10);
  if (modifier === 'PM' && h < 12) h += 12;
  if (modifier === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${minutes}`;
};

const initializeData = () => {
  if (!eventData.value) return;
  contactWaInput.value = eventData.value.Whatsapp || '';
  previewUrl.value = eventData.value.Picture ? `${config.public.img}/${eventData.value.SK}/${eventData.value.Picture}.webp?t=${Date.now()}` : null;

  if (eventData.value.Date) {
    formState.scheduleDays = Object.values(eventData.value.Date).map((day: any, index: number) => ({
      tempId: index, ...day,
      start_time: convertTo24h(day.start_time), end_time: convertTo24h(day.end_time)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  contentForm.Description = eventData.value.Description || '';
  if (quillInstance) {
    isUpdatingQuill = true;
    quillInstance.root.innerHTML = contentForm.Description;
    setTimeout(() => { isContentChanged.value = false; isUpdatingQuill = false; }, 150);
  }
};

const initQuill = () => {
  if (!editorContainer.value || quillInstance) return;
  quillInstance = new Quill(editorContainer.value, {
    theme: 'snow',
    placeholder: 'Tulis deskripsi event...',
    modules: { toolbar: [[{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'clean']] }
  });

  isUpdatingQuill = true;
  quillInstance.root.innerHTML = contentForm.Description;
  setTimeout(() => { isContentChanged.value = false; isUpdatingQuill = false; }, 150);

  quillInstance.on('text-change', () => {
    if (isUpdatingQuill) return;
    contentForm.Description = quillInstance.root.innerHTML;
    isContentChanged.value = true;
  });
};

const isDragging = ref(false);
const processImageFile = (file: File) => {
  if (!file.type.startsWith('image/')) { photoError.value = 'Hanya file gambar!'; return; }
  photoError.value = null;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target?.result as string;
    previewUrl.value = base64;
    processWebP(base64);
  };
  reader.readAsDataURL(file);
};

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) processImageFile(file);
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) processImageFile(file);
};

const processWebP = (src: string) => {
  const img = new Image();
  img.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const MAX_WIDTH = 1000;
    let { width, height } = img;
    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
    canvas.width = width; canvas.height = height;
    ctx?.drawImage(img, 0, 0, width, height);
    newPhotoBase64.value = canvas.toDataURL('image/webp', 0.8);
  };
  img.src = src;
};

const handlePictureSubmit = async () => {
  if (!eventData.value?.SK || !newPhotoBase64.value) return;
  isSavingPicture.value = true;
  const success = await eventStore.uploadEventPhoto(eventData.value.SK, newPhotoBase64.value);
  if (success) { toastStore.showToast({ message: 'Poster diperbarui', type: 'success' }); newPhotoBase64.value = null; }
  isSavingPicture.value = false;
};

const handleDeletePicture = async () => {
  // 1. Kalau cuma ngehapus preview gambar baru yang belum di-save
  if (newPhotoBase64.value && !eventData.value?.Picture) {
    previewUrl.value = null;
    newPhotoBase64.value = null;
    return;
  }

  // 2. Kalau beneran ada gambar lama dari server
  if (eventData.value?.Picture && eventData.value?.SK) {
    const result = await swalConfirm(
      'Hapus Poster?',
      'Poster event ini akan dihapus permanen dari sistem.',
      'Ya, Hapus'
    );

    if (result.isConfirmed) {
      const success = await eventStore.deleteEventPhoto(eventData.value.SK, eventData.value.Picture);
      if (success) {
        swalAlert('Berhasil!', 'Poster berhasil dihapus.', 'success');
        previewUrl.value = null;
        newPhotoBase64.value = null;
        // Opsional: update lokal state eventData biar gambarnya kosong
        eventData.value.Picture = undefined; 
      } else {
        swalAlert('Gagal', 'Terjadi kesalahan saat menghapus poster dari server.', 'error');
      }
    }
  } else {
     previewUrl.value = null;
     newPhotoBase64.value = null;
  }
};

const addScheduleDay = () => { formState.scheduleDays.push({ tempId: Date.now(), date: '', start_time: '', end_time: '' }); };
const removeScheduleDay = (index: number) => { formState.scheduleDays.splice(index, 1); };

const handleScheduleSubmit = async () => {
  if (!eventSK) return;
  isSavingSchedule.value = true;
  const payload: any = {};
  formState.scheduleDays.forEach((day, i) => {
    payload[`day_${i + 1}`] = { date: day.date, start_time: convertTo12h(day.start_time), end_time: convertTo12h(day.end_time) };
  });
  try {
    const success = await eventStore.updateEventSchedule(eventSK, payload);
    if (success) toastStore.showToast({ message: 'Jadwal berhasil disimpan', type: 'success' });
  } catch (err) { toastStore.showToast({ message: 'Gagal menyimpan jadwal', type: 'danger' }); }
  finally { isSavingSchedule.value = false; }
};

const handleContentSubmit = async () => {
  if (!eventData.value?.SK) return;
  isSavingBasic.value = true;
  const success = await eventStore.updateTiketEventBasic({ SK: eventData.value.SK, Description: contentForm.Description });
  if (success) { toastStore.showToast({ message: 'Konten disimpan', type: 'success' }); isContentChanged.value = false; }
  isSavingBasic.value = false;
};

const handleContactSubmit = async () => {
  if (!eventData.value?.SK) return;
  isSavingContact.value = true;
  const success = await eventStore.updateTiketEventBasic({ SK: eventData.value.SK, Whatsapp: contactWaInput.value });
  if (success) toastStore.showToast({ message: 'Kontak WA berhasil disimpan', type: 'success' });
  else toastStore.showToast({ message: 'Gagal menyimpan Kontak WA', type: 'danger' });
  isSavingContact.value = false;
};

const formatCurrency = (v: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);
const formatRegDates = (reg: any) => {
  if (!reg?.start_registration) return 'Belum diatur';
  const options: any = { day: 'numeric', month: 'short' };
  return `${new Date(reg.start_registration).toLocaleDateString('id-ID', options)} - ${new Date(reg.end_registration).toLocaleDateString('id-ID', options)}`;
};

onMounted(async () => {
  await eventStore.fetchEventDetail(eventSK);
  initializeData();
  setTimeout(initQuill, 200);
});

onBeforeUnmount(() => { if (quillInstance) quillInstance = null; });

watch(eventData, () => initializeData());

const openEditBasicModal = () => showEditBasicModal.value = true;
const closeEditBasicModal = () => showEditBasicModal.value = false;

const handleUpdateBasicInfo = async (payload: any) => {
  const success = await eventStore.updateTiketEventBasic({ ...payload, SK: eventSK } as any);
  if (success) {
    toastStore.showToast({ message: 'Info Dasar diperbarui', type: 'success' });
    closeEditBasicModal();
  }
};

const onImageError = () => previewUrl.value = null;
</script>

<style scoped>
@import url("@/assets/css/admin/timepicker.css");
.border-dashed { border-style: dashed !important; }
.upload-area { transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.upload-area:hover { background-color: rgba(var(--bs-primary-rgb), 0.05); }
.Picture-preview { width: 100%; height: 100%; object-fit: contain; }
.modern-input { border: 1px solid #eee; padding: 0.6rem; }
.x-small { font-size: 0.75rem; }
:deep(.ql-container) { border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; background: white; }
:deep(.ql-toolbar) { border-top-left-radius: 12px; border-top-right-radius: 12px; background: #f8f9fa; border-color: #eee !important; }
.cursor-pointer { cursor: pointer; }
</style>