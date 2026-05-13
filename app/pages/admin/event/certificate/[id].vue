<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin/events" class="text-decoration-none txt-caption text-muted">Manajemen Event</NuxtLink>
        </li>
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Template Sertifikat</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
      
      <div class="card-header bg-white p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h5 class="mb-0 fw-bold text-dark txt-title">Upload Template Sertifikat</h5>
          <p class="txt-caption text-muted mt-1 mb-0">
            Event: <span class="fw-bold text-primary">{{ globalStore.activeEvent?.Title || 'Memuat Nama Event...' }}</span>
          </p>
        </div>
        <div>
          <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill txt-caption fw-bold shadow-sm d-flex align-items-center gap-2">
            <i class="bi bi-image"></i> Setup Mode
          </span>
        </div>
      </div>

      <div class="card-body p-4 p-md-5">
        
        <div class="row g-4 g-xl-5 align-items-start">
          
          <div class="col-12 col-lg-7">
            <h6 class="fw-bold txt-subtitle mb-3 border-bottom pb-2 text-dark">1. Desain Sertifikat (A4)</h6>
            
            <div 
              class="upload-area border-2 border-dashed rounded-4 p-4 text-center bg-light w-100 mb-3"
              v-if="!base64Image"
              :class="{ 'border-primary bg-primary bg-opacity-10': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <input type="file" id="fileInput" class="d-none" accept="image/jpeg, image/png" @change="handleFileSelect">

              <div class="w-100 py-3">
                <div class="bg-white rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                  <i class="bi bi-cloud-arrow-up fs-2 text-primary"></i>
                </div>
                <h6 class="txt-subtitle fw-bold mt-2 mb-1">Pilih atau Drag Template ke Sini</h6>
                
                <div class="txt-caption text-muted mb-3 d-inline-block text-start bg-white border p-3 rounded-3 mt-3 shadow-sm w-100">
                  <strong><i class="bi bi-info-circle me-1"></i> Syarat Gambar:</strong>
                  <ul class="mb-0 ps-3 mt-1">
                    <li>Format: JPG / PNG (Max 3MB)</li>
                    <li>Rasio gambar harus sesuai ukuran A4.</li>
                  </ul>
                </div>
                
                <div class="d-block mt-2">
                  <label for="fileInput" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm cursor-pointer fw-bold txt-caption transition-hover">
                    <i class="bi bi-folder2-open me-1"></i> Browse File
                  </label>
                </div>
              </div>
            </div> 

            <div v-else class="w-100">
              <div class="workspace-wrapper  overflow-auto mb-3 d-flex justify-content-center align-items-center" style="min-height: 400px; max-height: 600px; position: relative;">
                
                <div 
                  class="certificate-container bg-white position-relative shadow" 
                  :class="config.layout"
                  ref="certContainer"
                >
                  <img :src="base64Image" class="template-img" alt="Template">

                  <div class="center-guide-x" v-show="activeDraggingField"></div>
                  <div 
                    v-if="config.fields.eventTitle"
                    class="draggable-text text-event"
                    :style="eventTitleStyleObj"
                    @mousedown="(e) => startDrag(e, 'eventTitle')"
                  >
                    Dauroh Ilmu Al-Qur'an
                  </div>

                  <div 
                    v-if="config.fields.name"
                    class="draggable-text text-name"
                    :style="nameStyleObj"
                    @mousedown="(e) => startDrag(e, 'name')"
                  >
                    Akbar Hermawan
                  </div>

                  <div 
                    v-if="config.fields.domicile"
                    class="draggable-text text-domicile"
                    :style="domicileStyleObj"
                    @mousedown="(e) => startDrag(e, 'domicile')"
                  >
                    Depok
                  </div>
                </div>

              </div>
              
              <div class="d-flex justify-content-center gap-3">
                <input type="file" id="fileInputChange" class="d-none" accept="image/jpeg, image/png" @change="handleFileSelect">
                <label for="fileInputChange" class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold txt-caption mb-0 cursor-pointer transition-hover">
                  <i class="bi bi-arrow-repeat me-1"></i> Ganti
                </label>
                <button class="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold txt-caption transition-hover" @click="resetFile">
                  <i class="bi bi-trash me-1"></i> Hapus
                </button>
              </div>
            </div>

            <div v-if="imageErrors.length > 0" class="alert alert-danger mt-3 p-3 rounded-3 shadow-sm border-0 bg-danger bg-opacity-10 w-100">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
                <strong class="txt-caption text-danger m-0">Gagal Memenuhi Syarat:</strong>
              </div>
              <ul class="mb-0 ps-4 txt-caption text-danger">
                <li v-for="(err, index) in imageErrors" :key="index">{{ err }}</li>
              </ul>
            </div>
          </div>

          <div class="col-12 col-lg-5">
            <h6 class="fw-bold txt-subtitle mb-3 border-bottom pb-2 text-dark">2. Pengaturan Konten</h6>
            
            <div class="d-flex flex-column gap-4">
              <div>
                <label class="fw-bold text-muted txt-caption mb-2">Orientasi Gambar</label>
                <div class="d-flex gap-2">
                  <div class="flex-fill">
                    <input type="radio" class="btn-check" name="layout" id="landscape" value="landscape" v-model="config.layout">
                    <label class="btn btn-outline-primary w-100 rounded-pill py-1 px-2 text-center d-flex align-items-center justify-content-center gap-2 transition-hover" for="landscape">
                      <i class="bi bi-layout-sidebar-reverse" style="transform: rotate(90deg);"></i>
                      <span class="txt-caption fw-bold mb-0">Landscape</span>
                    </label>
                  </div>
                  <div class="flex-fill">
                    <input type="radio" class="btn-check" name="layout" id="portrait" value="portrait" v-model="config.layout">
                    <label class="btn btn-outline-primary w-100 rounded-pill py-1 px-2 text-center d-flex align-items-center justify-content-center gap-2 transition-hover" for="portrait">
                      <i class="bi bi-layout-sidebar-reverse"></i>
                      <span class="txt-caption fw-bold mb-0">Portrait</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label class="fw-bold text-muted txt-caption mb-2">Data yang Ditampilkan</label>
                <div class="bg-light p-3 rounded-3 border mb-3 flex-column d-flex gap-2">
                  <div class="form-check form-switch d-flex align-items-center justify-content-between p-0 mb-0">
                    <label class="form-check-label txt-caption fw-medium" for="showEvent">Judul Event</label>
                    <input class="form-check-input ms-0" type="checkbox" id="showEvent" v-model="config.fields.eventTitle">
                  </div>
                  <hr class="my-1 text-muted opacity-25">
                  <div class="form-check form-switch d-flex align-items-center justify-content-between p-0 mb-0">
                    <label class="form-check-label txt-caption fw-medium" for="showName">Nama Peserta</label>
                    <input class="form-check-input ms-0" type="checkbox" id="showName" v-model="config.fields.name">
                  </div>
                  <hr class="my-1 text-muted opacity-25">
                  <div class="form-check form-switch d-flex align-items-center justify-content-between p-0 mb-0">
                    <label class="form-check-label txt-caption fw-medium" for="showDomicile">Asal / Domisili</label>
                    <input class="form-check-input ms-0" type="checkbox" id="showDomicile" v-model="config.fields.domicile">
                  </div>
                </div>
              </div>

              <div v-if="base64Image" class="d-flex flex-column gap-3">
                
                <div v-if="config.fields.eventTitle" class="setting-panel">
                  <label class="fw-bold text-dark txt-caption mb-2 d-flex align-items-center gap-2">
                    <i class="bi bi-type-h1 text-primary"></i> Gaya Teks Judul Event
                  </label>
                  <div class="bg-light p-3 rounded-3 border">
                    <div class="row g-2 mb-2">
                      <div class="col-6">
                        <label class="form-label txt-caption fw-medium mb-1">Ukuran (px)</label>
                        <input type="number" class="form-control form-control-sm" v-model="config.styles.eventTitle.fontSize" min="10" max="100">
                      </div>
                      <div class="col-6">
                        <label class="form-label txt-caption fw-medium mb-1">Warna</label>
                        <div class="d-flex align-items-center gap-2">
                          <input type="color" class="form-control form-control-color border-0 p-0 shadow-none" style="width: 100%; height: 31px;" v-model="config.styles.eventTitle.color">
                        </div>
                      </div>
                    </div>
                    <div class="alert alert-primary py-1 px-2 mb-0 txt-caption border-0 d-flex gap-2 align-items-start bg-primary bg-opacity-10 text-primary-emphasis">
                      <i class="bi bi-arrows-move mt-1"></i>
                      <span>Drag teks <strong class="text-primary">[JUDUL EVENT]</strong>. Otomatis menempel (snap) saat berada di tengah.</span>
                    </div>
                  </div>
                </div>

                <div v-if="config.fields.name" class="setting-panel">
                  <label class="fw-bold text-dark txt-caption mb-2 d-flex align-items-center gap-2">
                    <i class="bi bi-person-badge text-success"></i> Gaya Teks Nama Peserta
                  </label>
                  <div class="bg-light p-3 rounded-3 border">
                    <div class="row g-2 mb-2">
                      <div class="col-6">
                        <label class="form-label txt-caption fw-medium mb-1">Ukuran (px)</label>
                        <input type="number" class="form-control form-control-sm" v-model="config.styles.name.fontSize" min="10" max="100">
                      </div>
                      <div class="col-6">
                        <label class="form-label txt-caption fw-medium mb-1">Warna</label>
                        <div class="d-flex align-items-center gap-2">
                          <input type="color" class="form-control form-control-color border-0 p-0 shadow-none" style="width: 100%; height: 31px;" v-model="config.styles.name.color">
                        </div>
                      </div>
                    </div>
                    <div class="alert alert-success py-1 px-2 mb-0 txt-caption border-0 d-flex gap-2 align-items-start bg-success bg-opacity-10 text-success-emphasis">
                      <i class="bi bi-arrows-move mt-1"></i>
                      <span>Drag teks <strong class="text-success">[NAMA PESERTA]</strong>. Otomatis menempel (snap) saat berada di tengah.</span>
                    </div>
                  </div>
                </div>

                <div v-if="config.fields.domicile" class="setting-panel">
                  <label class="fw-bold text-dark txt-caption mb-2 d-flex align-items-center gap-2">
                    <i class="bi bi-geo-alt text-danger"></i> Gaya Teks Domisili
                  </label>
                  <div class="bg-light p-3 rounded-3 border">
                    <div class="row g-2 mb-2">
                      <div class="col-6">
                        <label class="form-label txt-caption fw-medium mb-1">Ukuran (px)</label>
                        <input type="number" class="form-control form-control-sm" v-model="config.styles.domicile.fontSize" min="10" max="100">
                      </div>
                      <div class="col-6">
                        <label class="form-label txt-caption fw-medium mb-1">Warna</label>
                        <div class="d-flex align-items-center gap-2">
                          <input type="color" class="form-control form-control-color border-0 p-0 shadow-none" style="width: 100%; height: 31px;" v-model="config.styles.domicile.color">
                        </div>
                      </div>
                    </div>
                    <div class="alert alert-danger py-1 px-2 mb-0 txt-caption border-0 d-flex gap-2 align-items-start bg-danger bg-opacity-10 text-danger-emphasis">
                      <i class="bi bi-arrows-move mt-1"></i>
                      <span>Drag teks <strong class="text-danger">[DOMISILI]</strong>. Otomatis menempel (snap) saat berada di tengah.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      <div class="card-footer bg-light p-4 border-top d-flex flex-column flex-sm-row justify-content-end gap-2">
        <button 
          class="btn btn-outline-dark rounded-pill px-4 fw-bold shadow-sm py-2 txt-caption transition-hover" 
          :disabled="!base64Image" 
          @click="showPreview"
        >
          <i class="bi bi-eye me-1"></i> Preview Info
        </button>
        
        <button 
          class="btn btn-primary rounded-pill px-5 fw-bold shadow-sm py-2 txt-body transition-hover" 
          :disabled="!base64Image || imageErrors.length > 0"
          @click="simpanTemplate"
        >
          <i class="bi bi-cloud-arrow-up-fill me-2"></i> Simpan Konfigurasi
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'; 
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2'; 
import { useAlert } from '~/utils/swal';
import { useGlobalEventStore } from '~/stores/globalEvent';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Template Sertifikat' });

const route = useRoute();
const globalStore = useGlobalEventStore();
const isDragging = ref(false);
const { alert: swalAlert } = useAlert();
const base64Image = ref<string | null>(null); 
const imageErrors = ref<string[]>([]);
const certContainer = ref<HTMLElement | null>(null);

const imageMeta = ref({ width: 0, height: 0, size: 0, type: '' });

// 🟢 CONFIG LENGKAP
const config = reactive({
  layout: 'landscape',
  fields: {
    eventTitle: true,
    name: true,
    domicile: true,
  },
  styles: {
    eventTitle: { top: 35, left: 50, fontSize: 32, color: '#004754' },
    name: { top: 55, left: 50, fontSize: 40, color: '#000000' },
    domicile: { top: 68, left: 50, fontSize: 20, color: '#444444' }
  }
});

// --- LOGIC VALIDASI GAMBAR ---
const validateImage = () => {
  imageErrors.value = []; 
  if (!base64Image.value) return; 

  if (imageMeta.value.size > 3 * 1024 * 1024) {
    imageErrors.value.push('Ukuran file terlalu besar (Maksimal 3MB).');
  }
  if (!['image/jpeg', 'image/png'].includes(imageMeta.value.type)) {
    imageErrors.value.push('Format gambar tidak valid (Harus .JPG atau .PNG).');
  }

  if (config.layout === 'landscape' && imageMeta.value.width < imageMeta.value.height) {
    imageErrors.value.push('Orientasi tidak sesuai! Anda memilih Landscape, tapi mengunggah gambar Portrait.');
  } else if (config.layout === 'portrait' && imageMeta.value.height < imageMeta.value.width) {
    imageErrors.value.push('Orientasi tidak sesuai! Anda memilih Portrait, tapi mengunggah gambar Landscape.');
  }
};

watch(() => config.layout, () => validateImage());

const handleFileSelect = (e: any) => {
  const file = e.target.files[0];
  if (file) processFile(file);
};

const handleDrop = (e: any) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
};

const processFile = (file: File) => {
  imageMeta.value.size = file.size;
  imageMeta.value.type = file.type;

  const reader = new FileReader();
  reader.onload = (e: any) => { 
    const base64 = e.target.result;
    const img = new Image();
    img.onload = () => {
      imageMeta.value.width = img.width;
      imageMeta.value.height = img.height;
      base64Image.value = base64; 
      validateImage(); 
    };
    img.src = base64; 
  };
  reader.readAsDataURL(file); 
};

const resetFile = () => { 
  base64Image.value = null; 
  imageErrors.value = [];
  imageMeta.value = { width: 0, height: 0, size: 0, type: '' };
};

// --- LOGIC DRAG AND DROP TEKS (DENGAN SNAPPING KE TENGAH) ---
const activeDraggingField = ref<string | null>(null);

const createTextStyleObj = (fieldStyle: { top: number, left: number, fontSize: number, color: string }) => ({
  top: `${fieldStyle.top}%`,
  left: `${fieldStyle.left}%`,
  fontSize: `${fieldStyle.fontSize}px`,
  color: fieldStyle.color,
  transform: 'translate(-50%, -50%)'
});

const eventTitleStyleObj = computed(() => createTextStyleObj(config.styles.eventTitle));
const nameStyleObj = computed(() => createTextStyleObj(config.styles.name));
const domicileStyleObj = computed(() => createTextStyleObj(config.styles.domicile));

const startDrag = (e: MouseEvent, field: string) => {
  e.preventDefault();
  activeDraggingField.value = field;
};

const onDrag = (e: MouseEvent) => {
  if (!activeDraggingField.value || !certContainer.value) return;

  const containerRect = certContainer.value.getBoundingClientRect();
  
  let x = e.clientX - containerRect.left;
  let y = e.clientY - containerRect.top;

  x = Math.max(0, Math.min(x, containerRect.width));
  y = Math.max(0, Math.min(y, containerRect.height));

  let leftPos = (x / containerRect.width) * 100;
  let topPos = (y / containerRect.height) * 100;

  // 🟢 LOGIC SNAPPING (MAGNET KE TENGAH)
  // Kalau posisi X mendekati 50% (margin of error 3%), otomatis dikunci di 50%
  if (Math.abs(leftPos - 50) < 3) {
    leftPos = 50;
  }

  const targetStyle = config.styles[activeDraggingField.value as keyof typeof config.styles];
  targetStyle.left = Number(leftPos.toFixed(2));
  targetStyle.top = Number(topPos.toFixed(2));
};

const stopDrag = () => {
  activeDraggingField.value = null;
};

onMounted(() => {
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
});

// --- FUNGSI BUTTON ---
const showPreview = () => {
  // Generate rekap posisi untuk preview JSON
  const posRekap = {
    layout: config.layout,
    fields: {
      eventTitle: config.fields.eventTitle ? { ...config.styles.eventTitle } : 'Hidden',
      name: config.fields.name ? { ...config.styles.name } : 'Hidden',
      domicile: config.fields.domicile ? { ...config.styles.domicile } : 'Hidden',
    }
  };

  // Kita panggil Swal dengan HTML custom yang ada sistem Tab-nya
  Swal.fire({
    title: 'Preview Hasil & Data JSON',
    width: '800px', // Bikin modalnya lebih lebar biar enak liat gambar
    html: `
      <div class="d-flex justify-content-center gap-2 mb-3">
        <button id="btn-show-image" class="btn btn-sm btn-primary px-3 rounded-pill">Lihat Gambar Full</button>
        <button id="btn-show-json" class="btn btn-sm btn-outline-secondary px-3 rounded-pill">Lihat Data JSON</button>
      </div>

      <div id="preview-image-container" class="position-relative border rounded-3 overflow-hidden bg-light" style="display: block;">
        <img src="${base64Image.value}" style="width: 100%; height: auto; display: block;">
        
        ${config.fields.eventTitle ? `<div style="position: absolute; top: ${config.styles.eventTitle.top}%; left: ${config.styles.eventTitle.left}%; font-size: ${config.styles.eventTitle.fontSize}px; color: ${config.styles.eventTitle.color}; transform: translate(-50%, -50%); font-weight: bold; white-space: nowrap;">Dauroh Ilmu Al-Qur'an</div>` : ''}
        ${config.fields.name ? `<div style="position: absolute; top: ${config.styles.name.top}%; left: ${config.styles.name.left}%; font-size: ${config.styles.name.fontSize}px; color: ${config.styles.name.color}; transform: translate(-50%, -50%); font-weight: bold; white-space: nowrap;">Akbar Hermawan</div>` : ''}
        ${config.fields.domicile ? `<div style="position: absolute; top: ${config.styles.domicile.top}%; left: ${config.styles.domicile.left}%; font-size: ${config.styles.domicile.fontSize}px; color: ${config.styles.domicile.color}; transform: translate(-50%, -50%); font-weight: bold; white-space: nowrap;">Depok</div>` : ''}
      </div>

      <div id="preview-json-container" class="text-start mb-0 bg-light p-3 rounded border font-monospace" style="display: none; font-size: 13px; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">${JSON.stringify(posRekap, null, 2)}</div>
    `,
    showConfirmButton: false, // Hilangin tombol default biar bersih
    showCloseButton: true, // Munculin tanda silang (X) di pojok kanan atas
    customClass: { popup: 'rounded-4' },
    didRender: () => {
      // Logic buat gonta-ganti tab pake Vanilla JS di dalem Swal
      const btnImg = document.getElementById('btn-show-image');
      const btnJson = document.getElementById('btn-show-json');
      const containerImg = document.getElementById('preview-image-container');
      const containerJson = document.getElementById('preview-json-container');

      if(btnImg && btnJson && containerImg && containerJson) {
        btnImg.addEventListener('click', () => {
          containerImg.style.display = 'block';
          containerJson.style.display = 'none';
          btnImg.className = 'btn btn-sm btn-primary px-3 rounded-pill'; // Jadi aktif
          btnJson.className = 'btn btn-sm btn-outline-secondary px-3 rounded-pill'; // Jadi gak aktif
        });

        btnJson.addEventListener('click', () => {
          containerImg.style.display = 'none';
          containerJson.style.display = 'block';
          btnJson.className = 'btn btn-sm btn-primary px-3 rounded-pill'; // Jadi aktif
          btnImg.className = 'btn btn-sm btn-outline-secondary px-3 rounded-pill'; // Jadi gak aktif
        });
      }
    }
  });
};

const simpanTemplate = async () => {
  if (!base64Image.value || imageErrors.value.length > 0) return;

  const payload = {
    event_id: globalStore.activeEventSK,
    image_base64: base64Image.value, 
    config: {
      layout: config.layout,
      show_event_title: config.fields.eventTitle,
      show_name: config.fields.name,
      show_domicile: config.fields.domicile,
      event_title_style: config.styles.eventTitle,
      name_style: config.styles.name,
      domicile_style: config.styles.domicile
    }
  };

  console.log("PAYLOAD KE BACKEND:", payload);

  Swal.fire({
    title: 'Menyimpan Template...',
    html: 'Mohon tunggu sebentar, sedang mengunggah konfigurasi.',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    Swal.close();
    swalAlert('Berhasil!', 'Konfigurasi template sertifikat berhasil disimpan.', 'success');
  } catch (error) {
    Swal.close();
    swalAlert('Gagal', 'Terjadi kesalahan saat menyimpan template.', 'error');
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");

.border-dashed {
  border-style: dashed !important;
}

.upload-area {
  transition: all 0.3s ease;
  min-height: 250px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer; 
}

.cursor-pointer { cursor: pointer; }
.transition-hover { transition: all 0.2s ease-in-out; }
.transition-hover:hover { transform: translateY(-2px); }

.shadow-inner {
  box-shadow: inset 0 0 10px  rgba(0,0,0,0.5);
}

.certificate-container {
  overflow: hidden;
  border: 1px solid #ddd;
}

/* 🟢 PERBAIKAN RASIO GAMBAR (Biar ga penyok) */
.certificate-container.landscape {
  width: 100%; 
  max-width: 650px; /* Lebar max biar ga nabrak pinggir layar */
  aspect-ratio: 1.414 / 1; /* Rasio murni A4 Landscape (akar 2) */
  height: auto;
}

.certificate-container.portrait {
  width: 100%;
  max-width: 460px;
  aspect-ratio: 1 / 1.414; /* Rasio murni A4 Portrait */
  height: auto;
}

.template-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 🟢 Ganti jadi cover/contain biar proporsional */
  display: block;
  pointer-events: none; 
}

/* 🟢 GARIS BANTU TENGAH (Ruler) */
.center-guide-x {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background-color: rgba(255, 0, 0, 0.5);
  border-left: 1px dashed red;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 10;
}

/* Optional horizontal ruler */
.center-guide-y {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background-color: rgba(255, 0, 0, 0.5);
  border-top: 1px dashed red;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 10;
}

.draggable-text {
  position: absolute;
  cursor: move;
  user-select: none;
  font-weight: bold;
  white-space: nowrap;
  padding: 4px 10px;
  border: 2px dashed transparent;
  background-color: rgba(255, 255, 255, 0.4);
  transition: border-color 0.15s, background-color 0.15s;
  border-radius: 4px;
  z-index: 20;
}

.draggable-text.text-event:hover, .draggable-text.text-event:active {
  border-color: #0d6efd; 
  background-color: rgba(13, 110, 253, 0.1);
}

.draggable-text.text-name:hover, .draggable-text.text-name:active {
  border-color: #198754; 
  background-color: rgba(25, 135, 84, 0.1);
}

.draggable-text.text-domicile:hover, .draggable-text.text-domicile:active {
  border-color: #dc3545; 
  background-color: rgba(220, 53, 69, 0.1);
}

.form-check-input:checked {
    background-color: #004754;
    border-color: #004754;
}

.form-control-color {
  padding: 0.2rem;
}
</style>