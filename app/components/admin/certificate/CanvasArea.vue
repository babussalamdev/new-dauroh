<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <h6 class="fw-bold txt-subtitle mb-0 text-dark">Template Sertifikat</h6>
      <button class="btn btn-sm btn-info text-white rounded-pill px-3 fw-bold shadow-sm" @click="showPreview = true" v-if="certStore.base64Image">
        <i></i> Preview
      </button>
    </div>
    
    <div 
      class="upload-area border-2 border-dashed rounded-4 p-4 text-center w-100 mb-3"
      v-if="!certStore.base64Image"
      :class="{ 'border-primary bg-primary bg-opacity-10': isDragging, 'bg-light': !isDragging }"
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
        <div class="d-block mt-3">
          <label for="fileInput" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm cursor-pointer fw-bold txt-caption transition-hover">
            <i class="bi bi-folder2-open me-1"></i> Browse File
          </label>
        </div>
      </div>
    </div> 

    <div v-else class="w-100">
      <div class="workspace-wrapper shadow-inner mb-3">
        
        <div 
          class="certificate-container bg-white position-relative shadow-sm" 
          :class="certStore.config.layout"
          ref="certContainer"
        >
          <img 
            :src="displayImage" 
            class="template-img" 
            alt="Template"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          >

          <div class="center-guide-x" v-show="activeDraggingField"></div>
          
          <div 
            v-if="certStore.config.fields.eventTitle"
            class="draggable-text text-event"
            :style="eventTitleStyleObj"
            @mousedown="(e) => startDrag(e, 'eventTitle')"
          >
            {{ certStore.previewData.eventTitle }}
          </div>

          <div 
            v-if="certStore.config.fields.name"
            class="draggable-text text-name"
            :style="nameStyleObj"
            @mousedown="(e) => startDrag(e, 'name')"
          >
            {{ certStore.previewData.participantName }}
          </div>

          <div 
            v-if="certStore.config.fields.domicile"
            class="draggable-text text-domicile"
            :style="domicileStyleObj"
            @mousedown="(e) => startDrag(e, 'domicile')"
          >
            {{ certStore.previewData.domicile }}
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

    <div v-if="certStore.imageErrors.length > 0" class="alert alert-danger mt-3 p-3 rounded-3 shadow-sm border-0 bg-danger bg-opacity-10 w-100">
      <div class="d-flex align-items-center gap-2 mb-2">
        <i class="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
        <strong class="txt-caption text-danger m-0">Gagal Memenuhi Syarat:</strong>
      </div>
      <ul class="mb-0 ps-4 txt-caption text-danger">
        <li v-for="(err, index) in certStore.imageErrors" :key="index">{{ err }}</li>
      </ul>
    </div>

    <div v-if="showPreview" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8);" @click.self="showPreview = false">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-header border-0 d-flex justify-content-end p-2">
             <button type="button" class="btn-close btn-close-white" @click="showPreview = false"></button>
          </div>
          <div class="modal-body d-flex justify-content-center p-0">
             
             <div class="certificate-container shadow-lg w-100" style="max-width: 1123px;" :class="certStore.config.layout">
                <img :src="displayImage" class="template-img">
                <div v-if="certStore.config.fields.eventTitle" class="preview-text" :style="createTextStyleObj(certStore.config.styles.eventTitle, true)">{{ certStore.previewData.eventTitle }}</div>
                <div v-if="certStore.config.fields.name" class="preview-text" :style="createTextStyleObj(certStore.config.styles.name, true)">{{ certStore.previewData.participantName }}</div>
                <div v-if="certStore.config.fields.domicile" class="preview-text" :style="createTextStyleObj(certStore.config.styles.domicile, true)">{{ certStore.previewData.domicile }}</div>
             </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCertificateStore } from '~/stores/certificate';
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';

const route = useRoute();
const certStore = useCertificateStore();
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

const isDragging = ref(false);
const certContainer = ref<HTMLElement | null>(null);
const imageMeta = ref({ width: 0, height: 0, size: 0, type: '' });

// 🟢 STATE UNTUK BUKA/TUTUP MODAL
const showPreview = ref(false);

const displayImage = computed(() => {
  const imgData = certStore.base64Image;
  if (!imgData) return '';
  if (imgData.startsWith('data:image')) return imgData;
  if (imgData.startsWith('http')) return imgData;
  const eventSK = route.params.id as string; 
  return `${imgBaseUrl.value}/${eventSK}/${imgData}.webp`;
});

const validateImage = () => {
  let errors: string[] = []; 
  if (!certStore.base64Image) {
    certStore.imageErrors = [];
    return;
  }

  // 🟢 CEK FORMAT & UKURAN: Cuma jalan kalau gambar baru di-upload lokal
  if (imageMeta.value.size > 0) {
    if (imageMeta.value.size > 3 * 1024 * 1024) errors.push('Ukuran file terlalu besar (Maksimal 3MB).');
    if (!['image/jpeg', 'image/png'].includes(imageMeta.value.type)) errors.push('Format gambar tidak valid (Harus .JPG atau .PNG).');
  }

  // 🟢 CEK ORIENTASI: Cuma jalan kalau dimensi panjang/lebar diketahui
  if (imageMeta.value.width > 0 && imageMeta.value.height > 0) {
    if (certStore.config.layout === 'landscape' && imageMeta.value.width < imageMeta.value.height) {
      errors.push('Orientasi tidak sesuai! Pilih Landscape, tapi mengunggah gambar Portrait.');
    } else if (certStore.config.layout === 'portrait' && imageMeta.value.height < imageMeta.value.width) {
      errors.push('Orientasi tidak sesuai! Pilih Portrait, tapi mengunggah gambar Landscape.');
    }
  }

  certStore.imageErrors = errors;
};

watch(() => certStore.config.layout, () => validateImage());

const handleFileSelect = (e: any) => { const file = e.target.files[0]; if (file) processFile(file); };
const handleDrop = (e: any) => { isDragging.value = false; const file = e.dataTransfer.files[0]; if (file) processFile(file); };

const processFile = (file: File) => {
  imageMeta.value.size = file.size;
  imageMeta.value.type = file.type;
  const reader = new FileReader();
  
  reader.onload = async (e: any) => { 
    const base64 = e.target.result;
    const img = new Image();
    
    img.onload = async () => {
      imageMeta.value.width = img.width;
      imageMeta.value.height = img.height;
      certStore.base64Image = base64; 
      validateImage(); 
      
      if (certStore.imageErrors.length === 0) {
        const eventSK = route.params.id as string; 
        if (!eventSK) return;
        try {
          await certStore.uploadImageOnly(eventSK);
        } catch (err) {
          console.error("Gagal upload gambar:", err);
        }
      }
    };
    img.src = base64; 
  };
  reader.readAsDataURL(file); 
};

const resetFile = () => { 
  certStore.base64Image = null; 
  certStore.imageErrors = [];
  imageMeta.value = { width: 0, height: 0, size: 0, type: '' };
};

const activeDraggingField = ref<string | null>(null);

// Bikin Font Size Dinamis Ngikutin Ukuran Canvas
const createTextStyleObj = (fieldStyle: { top: number, left: number, fontSize: number, color: string }, isPreview = false) => {
  // Patokan ukuran A4
  const baseWidth = certStore.config.layout === 'landscape' ? 1123 : 794;
  const responsiveFontSize = (fieldStyle.fontSize / baseWidth) * 100;

  return {
    top: `${fieldStyle.top}%`,
    left: `${fieldStyle.left}%`,
    fontSize: `${responsiveFontSize}cqi`, // Menggunakan CSS Container Queries
    color: fieldStyle.color,
    transform: 'translate(-50%, -50%)',
    // Kalau mode preview, ilangin border dashed-nya
    border: isPreview ? 'none' : '2px dashed transparent',
    backgroundColor: isPreview ? 'transparent' : 'rgba(255, 255, 255, 0.4)'
  };
};

const eventTitleStyleObj = computed(() => createTextStyleObj(certStore.config.styles.eventTitle));
const nameStyleObj = computed(() => createTextStyleObj(certStore.config.styles.name));
const domicileStyleObj = computed(() => createTextStyleObj(certStore.config.styles.domicile));

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

  if (Math.abs(leftPos - 50) < 3) leftPos = 50; 

  const targetField = activeDraggingField.value as keyof typeof certStore.config.styles;
  certStore.config.styles[targetField].left = Number(leftPos.toFixed(2));
  certStore.config.styles[targetField].top = Number(topPos.toFixed(2));
};

const stopDrag = () => { activeDraggingField.value = null; };

onMounted(() => {
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
});
onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.transition-hover { transition: all 0.2s ease-in-out; }
.transition-hover:hover { transform: translateY(-2px); }

.border-dashed { border-style: dashed !important; }
.upload-area { transition: all 0.3s ease; min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
.cursor-pointer { cursor: pointer; }
.workspace-wrapper { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 20px;
  width: 100%;
}

.certificate-container { 
  overflow: hidden; 
  position: relative; 
  background-color: white; 
  width: 100% !important; 
  /* 🟢 max-width: 1123px dihapus dari sini */
  container-type: inline-size; 
}

/* 🟢 max-width disetting berdasar orientasinya biar pas! */
.certificate-container.landscape { 
  max-width: 1123px;
  aspect-ratio: 297 / 210; 
  height: auto !important; 
}
.certificate-container.portrait { 
  max-width: 794px;
  aspect-ratio: 210 / 297; 
  height: auto !important; 
}

.template-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block; 
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none; 
}

.draggable-text { 
  position: absolute; 
  cursor: move; 
  user-select: none; 
  font-weight: bold; 
  white-space: nowrap; 
  font-family: 'Arial', sans-serif;
  line-height: 1; 
  padding: 0;     
  transition: border-color 0.15s, background-color 0.15s; 
  border-radius: 4px; 
  z-index: 20; 
}
.draggable-text.text-event:hover, .draggable-text.text-event:active { border-color: #0d6efd; background-color: rgba(13, 110, 253, 0.1); }
.draggable-text.text-name:hover, .draggable-text.text-name:active { border-color: #198754; background-color: rgba(25, 135, 84, 0.1); }
.draggable-text.text-domicile:hover, .draggable-text.text-domicile:active { border-color: #dc3545; background-color: rgba(220, 53, 69, 0.1); }

.preview-text {
  position: absolute; 
  user-select: none; 
  font-weight: bold; 
  white-space: nowrap; 
  font-family: 'Arial', sans-serif;
  line-height: 1; 
  padding: 0; 
  z-index: 20; 
}

.center-guide-x { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background-color: rgba(255, 0, 0, 0.5); border-left: 1px dashed red; transform: translateX(-50%); pointer-events: none; z-index: 10; }
</style>