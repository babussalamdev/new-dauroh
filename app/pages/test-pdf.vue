<template>
  <div class="container-fluid py-5 bg-light min-vh-100">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">
        
        <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded-4 shadow-sm">
          <div>
            <h4 class="fw-bold mb-1">Eksperimen Generate PDF (Stabil)</h4>
            <p class="text-muted txt-caption mb-0">Menggunakan rasio murni A4 (1123px) dan Font Multiplier.</p>
          </div>
          <button 
            class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
            @click="generatePDF"
            :disabled="isGenerating || !hasData"
          >
            <span v-if="isGenerating" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <i v-else class="bi bi-file-earmark-pdf-fill"></i>
            {{ isGenerating ? 'Memproses PDF...' : 'Download PDF Sekarang' }}
          </button>
        </div>

        <div v-if="!hasData" class="alert alert-warning text-center p-5 rounded-4 shadow-sm">
          <i class="bi bi-exclamation-circle display-4 text-warning mb-3 d-block"></i>
          <h5>Data Kosong!</h5>
          <p>Lu belum nyimpen konfigurasi di halaman Setup Admin.</p>
        </div>

        <div v-else class="bg-dark p-4 rounded-4 shadow-sm preview-wrapper">
          
          <div 
            id="certificate-print-area" 
            class="certificate-container shadow-lg"
            :class="certData.config?.layout"
          >
            <img :src="certData.bgImage" class="template-img" alt="Background">

            <div 
              v-if="certData.config.fields.eventTitle"
              class="dynamic-text" 
              :style="getStyle(certData.config.styles.eventTitle)"
            >
              {{ certData.eventTitle }}
            </div>

            <div 
              v-if="certData.config.fields.name"
              class="dynamic-text" 
              :style="getStyle(certData.config.styles.name)"
            >
              {{ certData.participantName }}
            </div>

            <div 
              v-if="certData.config.fields.domicile"
              class="dynamic-text" 
              :style="getStyle(certData.config.styles.domicile)"
            >
              {{ certData.domicile }}
            </div>
            
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import html2pdf from 'html2pdf.js';

useHead({ title: 'Test Real PDF' });
definePageMeta({ layout: 'default' });

const isGenerating = ref(false);
const hasData = ref(false);
const certData = ref<any>({});

onMounted(() => {
  const saved = localStorage.getItem('cert_test_data');
  if (saved) {
    certData.value = JSON.parse(saved);
    hasData.value = true;
  }
});

// 🟢 INI KUNCI RAHASIANYA: FONT MULTIPLIER 1.4
const getStyle = (styleObj: any) => {
  if (!styleObj) return {};
  return {
    top: `${styleObj.top}%`,
    left: `${styleObj.left}%`,
    fontSize: `${styleObj.fontSize}px`, // Langsung panggil aslinya
    color: styleObj.color
  };
};

const generatePDF = async () => {
  isGenerating.value = true;
  
  const printArea = document.getElementById('certificate-print-area');
  if (!printArea) return;

  const orientation = certData.value.config.layout === 'landscape' ? 'l' : 'p';

  const opt = {
    margin:       0,
    filename:     `Sertifikat-${certData.value.participantName.replace(/\s+/g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 1 },
    html2canvas:  { 
      scale: 2, // 🟢 Balikin ke 2 biar normal & ga kepotong
      useCORS: true, 
      logging: false 
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: orientation }
  };

  try {
    await html2pdf().set(opt).from(printArea).save();
  } catch (error) {
    alert("Terjadi kesalahan saat generate PDF.");
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style scoped>
/* 🟢 WRAPPER BISA DI SCROLL KIRI-KANAN */
.preview-wrapper {
  overflow: auto;
  display: flex;
  justify-content: center;
}

/* 🟢 KUNCI MATI UKURAN A4 DALAM PIXEL (1123 X 794) */
.certificate-container {
  position: relative;
  background-color: white;
  overflow: hidden;
  flex-shrink: 0; /* Biar ukurannya ga ketekan/nyusut */
}

.certificate-container.landscape { 
  width: 1123px !important; 
  height: 794px !important; 
}

.certificate-container.portrait { 
  width: 794px !important; 
  height: 1123px !important; 
}

.template-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.dynamic-text {
  position: absolute;
  transform: translate(-50%, -50%);
  font-weight: bold;
  white-space: nowrap;
  font-family: 'Arial', sans-serif;
  line-height: 1;
  z-index: 10;
}
</style>