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
          
          <div class="col-12 col-lg-6">
            <h6 class="fw-bold txt-subtitle mb-3 border-bottom pb-2 text-dark">1. Desain Sertifikat</h6>
            
            <div 
              class="upload-area border-2 border-dashed rounded-4 p-4 text-center bg-light w-100"
              :class="{ 'border-primary bg-primary bg-opacity-10': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <input type="file" id="fileInput" class="d-none" accept="image/jpeg, image/png" @change="handleFileSelect">

              <div v-if="!base64Image" class="w-100 py-3">
                <div class="bg-white rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                  <i class="bi bi-cloud-arrow-up fs-2 text-primary"></i>
                </div>
                <h6 class="txt-subtitle fw-bold mt-2 mb-1">Pilih atau Drag Template ke Sini</h6>
                
                <div class="txt-caption text-muted mb-3 d-inline-block text-start bg-white border p-3 rounded-3 mt-3 shadow-sm w-100">
                  <strong><i class="bi bi-info-circle me-1"></i> Syarat Gambar:</strong>
                  <ul class="mb-0 ps-3 mt-1">
                    <li>Format: JPG / PNG (Max 2MB)</li>
                    <li>Sediakan area kosong untuk penempatan teks nama.</li>
                    <li>Orientasi harus sesuai dengan pilihan di pengaturan.</li>
                  </ul>
                </div>
                
                <div class="d-block mt-2">
                  <label for="fileInput" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm cursor-pointer fw-bold txt-caption transition-hover">
                    <i class="bi bi-folder2-open me-1"></i> Browse File
                  </label>
                </div>
              </div>
              
              <div v-else class="w-100">
                <div class="d-flex align-items-center justify-content-center bg-white rounded-3 shadow-sm border p-2 mb-3" style="min-height: 200px;">
                  <img :src="base64Image" class="img-fluid rounded shadow-sm" alt="Preview" style="max-height: 250px; object-fit: contain;">
                </div>
                
                <div class="d-flex justify-content-center gap-3">
                  <label for="fileInput" class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold txt-caption mb-0 cursor-pointer transition-hover">
                    <i class="bi bi-arrow-repeat me-1"></i> Ganti
                  </label>
                  <button class="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold txt-caption transition-hover" @click="resetFile">
                    <i class="bi bi-trash me-1"></i> Hapus
                  </button>
                </div>
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

          <div class="col-12 col-lg-6">
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
                <div class="bg-light p-3 rounded-3 border">
                  
                  <div class="form-check form-switch d-flex align-items-center justify-content-between mb-2 p-0">
                    <label class="form-check-label txt-caption fw-medium" for="showName">Nama Peserta</label>
                    <input class="form-check-input ms-0" type="checkbox" id="showName" v-model="config.fields.name">
                  </div>
                  
                  <div class="form-check form-switch d-flex align-items-center justify-content-between mb-2 p-0">
                    <label class="form-check-label txt-caption fw-medium" for="showDomicile">Asal / Domisili</label>
                    <input class="form-check-input ms-0" type="checkbox" id="showDomicile" v-model="config.fields.domicile">
                  </div>
                  
                  <div class="form-check form-switch d-flex align-items-center justify-content-between p-0">
                    <label class="form-check-label txt-caption fw-medium" for="showEvent">Judul Event</label>
                    <input class="form-check-input ms-0" type="checkbox" id="showEvent" v-model="config.fields.eventTitle">
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
          <i class="bi bi-eye me-1"></i> Preview
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
import { ref, reactive, watch } from 'vue'; // 🟢 Tambahin 'watch' buat fitur reaktif
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { useGlobalEventStore } from '~/stores/globalEvent';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Template Sertifikat' });

const route = useRoute();
const globalStore = useGlobalEventStore();
const isDragging = ref(false);

const base64Image = ref<string | null>(null); 
const imageErrors = ref<string[]>([]);

// 🟢 Nyimpen metadata gambar asli biar bisa divalidasi ulang
const imageMeta = ref({ width: 0, height: 0, size: 0, type: '' });

const config = reactive({
  layout: 'landscape',
  fields: {
    name: true,
    domicile: false,
    eventTitle: true
  }
});

// 🟢 MESIN VALIDASI REAL-TIME
const validateImage = () => {
  imageErrors.value = []; 

  if (!base64Image.value) return; // Kalau blm ada gambar, gausah divalidasi

  // 1. Validasi Ukuran
  if (imageMeta.value.size > 2 * 1024 * 1024) {
    imageErrors.value.push('Ukuran file terlalu besar (Maksimal 2MB).');
  }

  // 2. Validasi Format
  if (!['image/jpeg', 'image/png'].includes(imageMeta.value.type)) {
    imageErrors.value.push('Format gambar tidak valid (Harus .JPG atau .PNG).');
  }

  // 3. Validasi Kesesuaian Orientasi (Berdasarkan Layout yg dipilih)
  if (config.layout === 'landscape' && imageMeta.value.width < imageMeta.value.height) {
    imageErrors.value.push('Orientasi tidak sesuai! Anda memilih Landscape, tapi mengunggah gambar Portrait.');
  } else if (config.layout === 'portrait' && imageMeta.value.height < imageMeta.value.width) {
    imageErrors.value.push('Orientasi tidak sesuai! Anda memilih Portrait, tapi mengunggah gambar Landscape.');
  }
};

// 🟢 PANTAU PERUBAHAN RADIO BUTTON
// Kalau admin ganti pilihan layout pas gambar udah di-upload, lgsg cek ulang!
watch(() => config.layout, () => {
  validateImage();
});

const handleFileSelect = (e: any) => {
  const file = e.target.files[0];
  if (file) processFile(file);
};

const handleDrop = (e: any) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
};

// 🟢 FUNGSI BACA FILE & SET METADATA
const processFile = (file: File) => {
  imageMeta.value.size = file.size;
  imageMeta.value.type = file.type;

  const reader = new FileReader();
  reader.onload = (e: any) => { 
    const base64 = e.target.result;
    
    // Cari tau dimensi gambar dlu sebelum ditampilin
    const img = new Image();
    img.onload = () => {
      imageMeta.value.width = img.width;
      imageMeta.value.height = img.height;
      
      base64Image.value = base64; // Tampilin gambar
      validateImage(); // Jalanin validasi setelah tau lebar x tingginya
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

const showPreview = () => {
  let fieldsText = [];
  if (config.fields.name) fieldsText.push("Nama");
  if (config.fields.domicile) fieldsText.push("Domisili");
  if (config.fields.eventTitle) fieldsText.push("Judul Event");

  Swal.fire({
    title: 'Preview Konfigurasi',
    html: `
      <div class="txt-caption text-start mb-3">
        <strong>Layout:</strong> ${config.layout === 'landscape' ? 'Mendatar (Landscape)' : 'Tegak (Portrait)'}<br>
        <strong>Data Ditampilkan:</strong> ${fieldsText.join(', ') || 'Tidak ada'}
      </div>
    `,
    imageUrl: base64Image.value,
    imageAlt: 'Preview Sertifikat',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#3085d6'
  });
};

const simpanTemplate = async () => {
  if (!base64Image.value || imageErrors.value.length > 0) return;

  console.log("Payload yang siap dikirim:", {
    image: base64Image.value,
    config: config
  });

  Swal.fire({
    title: 'Menyimpan Template...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  setTimeout(() => {
    Swal.fire('Berhasil!', 'Template dan konfigurasi sertifikat berhasil disimpan.', 'success');
  }, 1500);
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

.upload-area:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.05) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-hover {
  transition: all 0.2s ease-in-out;
}

.transition-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.btn-outline-primary:hover i, .btn-check:checked + .btn-outline-primary i {
  color: white !important;
}
</style>