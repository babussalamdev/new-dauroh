<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption text-muted">Manajemen Event</NuxtLink>
        </li>
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Template Sertifikat</li>
      </ol>
    </nav>

    <div class="d-flex align-items-center mb-4">
      <NuxtLink to="/admin" class="btn btn-sm btn-light border rounded-circle me-3 shadow-sm">
        <i class="bi bi-arrow-left"></i>
      </NuxtLink>
      <div>
        <h4 class="mb-0 txt-title fw-bold text-dark">Template Sertifikat Event</h4>
        <p class="mb-0 txt-caption text-muted">Event ID: {{ route.params.id }}</p>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card content-card border-0 shadow-sm rounded-4">
          
          <div class="card-header bg-white p-4 border-bottom text-center">
            <h6 class="mb-0 fw-bold text-dark">Upload Desain Sertifikat Kosong</h6>
            <p class="txt-caption text-muted mt-1 mb-0">Nama peserta akan di-generate otomatis oleh sistem di sisi User.</p>
          </div>
          
          <div class="card-body p-4">
            
            <div 
              class="upload-area border-2 border-dashed rounded-4 p-4 text-center mb-3 bg-light"
              :class="{ 'border-primary bg-primary bg-opacity-10': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <input type="file" id="fileInput" class="d-none" accept="image/jpeg, image/png" @change="handleFileSelect">

              <div v-if="!base64Image" class="w-100">
                <i class="bi bi-image fs-1 text-primary opacity-50"></i>
                <p class="txt-body fw-medium mt-2 mb-1">Pilih atau Drag Template ke Sini</p>
                <div class="txt-caption text-muted mb-3 text-start bg-white border p-3 rounded-3 mt-3 shadow-sm">
                  <strong>Syarat Gambar:</strong>
                  <ul class="mb-0 ps-3 mt-1">
                    <li>Format: JPG / PNG (Max 2MB)</li>
                    <li>Rasio: A4 Landscape (Disarankan 2000 x 1414 px)</li>
                    <li>Sediakan area kosong di tengah untuk nama peserta.</li>
                  </ul>
                </div>
                <label for="fileInput" class="btn btn-primary px-4 rounded-pill shadow-sm cursor-pointer fw-bold txt-caption">
                  Browse File
                </label>
              </div>
              
              <div v-else class="w-100">
                <div class="d-flex align-items-center justify-content-center bg-white rounded-3 shadow-sm border p-2 mb-3" style="min-height: 250px;">
                  <img :src="base64Image" class="img-fluid rounded shadow-sm" alt="Preview" style="max-height: 300px; object-fit: contain;">
                </div>
                
                <div class="d-flex justify-content-center gap-2">
                  <label for="fileInput" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold txt-caption mb-0 cursor-pointer">
                    <i class="bi bi-arrow-repeat me-1"></i> Ganti Gambar
                  </label>
                  
                  <button class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold txt-caption" @click="resetFile">
                    <i class="bi bi-trash me-1"></i> Hapus
                  </button>
                </div>
              </div>
            </div> <div v-if="imageErrors.length > 0" class="alert alert-danger mt-3 mb-0 p-3 rounded-3 shadow-sm border-0 bg-danger bg-opacity-10">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
                <strong class="txt-caption text-danger m-0">Sertifikat Gagal Memenuhi Syarat:</strong>
              </div>
              <ul class="mb-0 ps-4 txt-caption text-danger">
                <li v-for="(err, index) in imageErrors" :key="index">{{ err }}</li>
              </ul>
            </div>

          </div>

          <div class="card-footer bg-white p-4 border-top">
            <button 
              class="btn btn-primary w-100 rounded-pill fw-medium shadow-sm py-2" 
              :disabled="!base64Image || imageErrors.length > 0"
              @click="simpanTemplate"
            >
              <i class="bi bi-cloud-arrow-up-fill me-2"></i> Simpan Template Sertifikat
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const isDragging = ref(false);

const base64Image = ref<string | null>(null); 
const imageErrors = ref<string[]>([]); // 🟢 Nampung error

const handleFileSelect = (e: any) => {
  const file = e.target.files[0];
  if (file) processFileToBase64(file);
};

const handleDrop = (e: any) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) processFileToBase64(file);
};

// 🟢 MESIN VALIDASI & PERUBAH GAMBAR JADI BASE64
const processFileToBase64 = (file: File) => {
  imageErrors.value = []; // Reset error sebelumnya

  // 1. Cek Ukuran File (Maks 2MB)
  if (file.size > 2 * 1024 * 1024) {
    imageErrors.value.push('Ukuran file terlalu besar (Maksimal 2MB).');
  }

  // 2. Cek Format File
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    imageErrors.value.push('Format gambar tidak valid (Harus .JPG atau .PNG).');
  }

  const reader = new FileReader();
  reader.onload = (e: any) => { 
    const base64 = e.target.result;
    base64Image.value = base64; 

    // 3. Cek Dimensi (Wajib Landscape / Mendatar)
    const img = new Image();
    img.onload = () => {
      // Kalau tinggi lebih besar/sama dengan lebar = Portrait
      if (img.width <= img.height) {
        imageErrors.value.push('Orientasi gambar salah! Harus berbentuk Landscape (Mendatar), bukan Portrait (Berdiri).');
      } else {
        // Cek toleransi rasio A4 (Idealnya 1.414)
        const ratio = img.width / img.height;
        if (ratio < 1.3 || ratio > 1.5) {
          imageErrors.value.push('Rasio gambar kurang pas. Disarankan menggunakan ukuran A4 agar tidak terpotong saat dicetak.');
        }
      }
    };
    img.src = base64; // Trigger load
  };
  reader.readAsDataURL(file); 
};

// 🟢 RESET GAMBAR DAN ERROR
const resetFile = () => { 
  base64Image.value = null; 
  imageErrors.value = [];
};

// 🟢 SIMPAN KE BE
const simpanTemplate = () => {
  console.log("Data Base64 yang siap dikirim:", base64Image.value);

  Swal.fire({
    title: 'Menyimpan Template...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  // Simulasi API BE
  setTimeout(() => {
    Swal.fire('Berhasil!', 'Template sertifikat berhasil disimpan.', 'success');
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
  align-items: center;
  justify-content: center;
  cursor: pointer; /* Biar kalau diarahin kursor jadi bentuk tangan */
}

.upload-area:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.cursor-pointer {
  cursor: pointer;
}
</style>