<template>
  <div>
    <h6 class="fw-bold txt-subtitle mb-2 border-bottom pb-2 text-dark">Pengaturan Sertifikat</h6>
    
    <div class="d-flex flex-column gap-2"> 
      
      <div>
        <label class="fw-bold text-muted txt-caption mb-1">Orientasi Gambar</label>
        <div class="p-1 bg-light border rounded-pill d-flex shadow-sm">
          <div class="flex-fill">
            <input type="radio" class="btn-check" name="layout" id="landscape" value="landscape" v-model="certStore.config.layout">
            <label class="btn btn-sm w-100 rounded-pill mb-0 d-flex align-items-center justify-content-center gap-1 segmented-btn transition-hover" for="landscape" style="padding-top: 2px; padding-bottom: 2px;">
              <i class="bi bi-layout-sidebar-reverse" style="transform: rotate(90deg); font-size: 12px;"></i>
              <span class="txt-caption fw-bold" style="font-size: 11px;">Landscape</span>
            </label>
          </div>
          <div class="flex-fill">
            <input type="radio" class="btn-check" name="layout" id="portrait" value="portrait" v-model="certStore.config.layout">
            <label class="btn btn-sm w-100 rounded-pill mb-0 d-flex align-items-center justify-content-center gap-1 segmented-btn transition-hover" for="portrait" style="padding-top: 2px; padding-bottom: 2px;">
              <i class="bi bi-layout-sidebar-reverse" style="font-size: 12px;"></i>
              <span class="txt-caption fw-bold" style="font-size: 11px;">Portrait</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label class="fw-bold text-muted txt-caption mb-1">Data yang Ditampilkan</label>
        <div class="bg-white border rounded-3 shadow-sm overflow-hidden">
          <div class="form-check form-switch d-flex align-items-center justify-content-between px-2 py-1 m-0 border-bottom bg-light bg-opacity-50 hover-bg">
            <label class="form-check-label txt-caption fw-medium text-dark m-0" for="showEvent" style="font-size: 11px;">Judul Event</label>
            <input class="form-check-input m-0 cursor-pointer form-check-input-sm" type="checkbox" id="showEvent" v-model="certStore.config.fields.eventTitle">
          </div>
          <div class="form-check form-switch d-flex align-items-center justify-content-between px-2 py-1 m-0 border-bottom bg-light bg-opacity-50 hover-bg">
            <label class="form-check-label txt-caption fw-medium text-dark m-0" for="showName" style="font-size: 11px;">Nama Peserta</label>
            <input class="form-check-input m-0 cursor-pointer form-check-input-sm" type="checkbox" id="showName" v-model="certStore.config.fields.name">
          </div>
          <div class="form-check form-switch d-flex align-items-center justify-content-between px-2 py-1 m-0 bg-light bg-opacity-50 hover-bg">
            <label class="form-check-label txt-caption fw-medium text-dark m-0" for="showDomicile" style="font-size: 11px;">Asal / Domisili</label>
            <input class="form-check-input m-0 cursor-pointer form-check-input-sm" type="checkbox" id="showDomicile" v-model="certStore.config.fields.domicile">
          </div>
        </div>
      </div>

      <div v-if="certStore.base64Image" class="d-flex flex-column gap-1 mt-1">
        <label class="fw-bold text-muted txt-caption mb-0">Pengaturan Gaya Teks</label>

        <div v-if="certStore.config.fields.eventTitle" class="d-flex align-items-center justify-content-between p-1 px-2 border rounded-3 bg-white shadow-sm hover-bg">
          <div class="d-flex align-items-center gap-1">
            <div class="icon-box bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 22px; height: 22px;">
              <i class="bi bi-type-h1" style="font-size: 10px;"></i>
            </div>
            <span class="txt-caption fw-medium text-dark m-0" style="font-size: 11px;">Judul Event</span>
          </div>
          <div class="d-flex align-items-center gap-1">
            <input type="number" class="form-control form-control-sm text-center border-secondary-subtle px-1" style="width: 45px; font-size: 11px; height: 24px;" v-model="certStore.config.styles.eventTitle.fontSize" min="10" max="100" title="Ukuran Font (px)">
            <input type="color" class="form-control form-control-color color-picker-sm p-0 border-0 shadow-sm" v-model="certStore.config.styles.eventTitle.color" title="Warna Teks">
          </div>
        </div>

        <div v-if="certStore.config.fields.name" class="d-flex align-items-center justify-content-between p-1 px-2 border rounded-3 bg-white shadow-sm hover-bg">
          <div class="d-flex align-items-center gap-1">
            <div class="icon-box bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style="width: 22px; height: 22px;">
              <i class="bi bi-person-badge" style="font-size: 10px;"></i>
            </div>
            <span class="txt-caption fw-medium text-dark m-0" style="font-size: 11px;">Nama Peserta</span>
          </div>
          <div class="d-flex align-items-center gap-1">
            <input type="number" class="form-control form-control-sm text-center border-secondary-subtle px-1" style="width: 45px; font-size: 11px; height: 24px;" v-model="certStore.config.styles.name.fontSize" min="10" max="100">
            <input type="color" class="form-control form-control-color color-picker-sm p-0 border-0 shadow-sm" v-model="certStore.config.styles.name.color">
          </div>
        </div>

        <div v-if="certStore.config.fields.domicile" class="d-flex align-items-center justify-content-between p-1 px-2 border rounded-3 bg-white shadow-sm hover-bg">
          <div class="d-flex align-items-center gap-1">
            <div class="icon-box bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 22px; height: 22px;">
              <i class="bi bi-geo-alt" style="font-size: 10px;"></i>
            </div>
            <span class="txt-caption fw-medium text-dark m-0" style="font-size: 11px;">Domisili</span>
          </div>
          <div class="d-flex align-items-center gap-1">
            <input type="number" class="form-control form-control-sm text-center border-secondary-subtle px-1" style="width: 45px; font-size: 11px; height: 24px;" v-model="certStore.config.styles.domicile.fontSize" min="10" max="100">
            <input type="color" class="form-control form-control-color color-picker-sm p-0 border-0 shadow-sm" v-model="certStore.config.styles.domicile.color">
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 🟢 Panggil Store di sini, HAPUS defineModel dan defineProps
import { useCertificateStore } from '~/stores/certificate'; 

const certStore = useCertificateStore();
</script>

<style scoped>
/* --- CUSTOM MINIMALIST CSS --- */
.transition-hover { transition: all 0.2s ease-in-out; }
.transition-hover:hover { transform: translateY(-1px); }
.cursor-pointer { cursor: pointer; }

/* Segmented Control untuk Orientasi */
.segmented-btn {
  color: #6c757d; 
  background-color: transparent;
  border: none;
}
.btn-check:checked + .segmented-btn {
  background-color: #ffffff;
  color: #004754 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

/* Hover effect list menu */
.hover-bg { transition: background-color 0.2s; }
.hover-bg:hover { background-color: #f8f9fa !important; }

/* Custom Switch Warna Hijau/Tema */
.form-check-input:checked {
  background-color: #004754;
  border-color: #004754;
}

/* Memperkecil ukuran switch */
.form-check-input-sm {
    width: 2.2em !important;
    height: 1.2em !important;
    margin-top: 0.1em;
}

/* Input Color dibikin Bulat Elegan */
.color-picker-sm {
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  cursor: pointer;
  background-color: transparent;
}
.color-picker-sm::-webkit-color-swatch {
  border-radius: 50% !important;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #dee2e6;
}
.color-picker-sm::-moz-color-swatch {
  border-radius: 50% !important;
  border: 2px solid #fff;
}
</style>