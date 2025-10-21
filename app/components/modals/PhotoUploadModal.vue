<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Unggah Foto</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body text-center">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            style="display: none;"
            id="photoInputModal"
          />
          <label for="photoInputModal" class="photo-upload-area mb-3">
            <img v-if="previewUrl" :src="previewUrl" alt="Preview Foto" class="img-fluid rounded preview-image" />
            <div v-else class="placeholder-area d-flex flex-column justify-content-center align-items-center">
              <i class="bi bi-image fs-1 text-muted"></i>
              <p class="text-muted small mt-2 mb-0">Klik untuk memilih foto</p>
              <p class="text-muted small">(Format JPG, PNG, GIF, WebP)</p>
            </div>
          </label>
          <canvas ref="canvas" style="display: none;"></canvas>
          <div v-if="error" class="alert alert-danger mt-2 small p-2">
            {{ error }}
          </div>
          <small v-if="isConverting" class="text-muted d-block mt-2">
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Mengonversi ke WebP...
          </small>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Batal</button>
          <button
            type="button"
            class="btn btn-primary"
            @click="savePhoto"
            :disabled="!webPBase64 || isConverting"
          >
           {{ isConverting ? 'Memproses...' : 'Simpan Foto' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue'; // Pastikan PropType diimpor

// Props
const props = defineProps({
  show: { type: Boolean, required: true },
  // Pastikan definisi tipe ini benar: string | null
  initialPreviewUrl: {
    type: String as PropType<string | null>,
    default: null
  }
});

// Emits
const emit = defineEmits(['close', 'photo-uploaded']);

// Refs & State
const fileInput = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(props.initialPreviewUrl);
const webPBase64 = ref<string | null>(null);
const error = ref<string | null>(null);
const isConverting = ref(false);

// Watcher (tidak berubah)
watch(() => props.show, (newValue) => {
  if (newValue) {
    previewUrl.value = props.initialPreviewUrl;
    webPBase64.value = null;
    error.value = null;
    isConverting.value = false;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
});

// handleFileChange (tidak berubah)
const handleFileChange = (event: Event) => {
  error.value = null;
  webPBase64.value = null;
  isConverting.value = false;
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    previewUrl.value = props.initialPreviewUrl;
    return;
  }
  if (!file.type.startsWith('image/')) {
    error.value = 'File yang dipilih harus berupa gambar.';
    previewUrl.value = props.initialPreviewUrl;
    return;
  }
  const maxSizeInMB = 5;
  if (file.size > maxSizeInMB * 1024 * 1024) {
      error.value = `Ukuran file maksimal adalah ${maxSizeInMB}MB.`;
      previewUrl.value = props.initialPreviewUrl;
      return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const originalBase64 = e.target?.result as string;
    previewUrl.value = originalBase64;
    convertToWebP(originalBase64);
  };
  reader.onerror = () => {
    error.value = 'Gagal membaca file gambar.';
    previewUrl.value = props.initialPreviewUrl;
  }
  reader.readAsDataURL(file);
};

// convertToWebP (tidak berubah)
const convertToWebP = (imageBase64: string) => {
  isConverting.value = true;
  webPBase64.value = null;
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.value?.getContext('2d');
    if (ctx && canvas.value) {
      canvas.value.width = img.naturalWidth;
      canvas.value.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      try {
        const webPDataUrl = canvas.value.toDataURL('image/webp', 0.8);
        if (!webPDataUrl || webPDataUrl === 'data:,') {
             throw new Error('Canvas returned empty data URL for WebP.');
        }
        webPBase64.value = webPDataUrl;
      } catch (e) {
        console.error("Error converting to WebP:", e);
        error.value = 'Gagal mengonversi ke WebP. Format asli akan digunakan.';
        webPBase64.value = imageBase64.startsWith('data:image/') ? imageBase64 : null; // Fallback
      } finally {
        isConverting.value = false;
      }
    } else {
        error.value = 'Gagal menyiapkan kanvas.';
        isConverting.value = false;
    }
  };
  img.onerror = () => {
      error.value = 'Gagal memuat gambar untuk konversi.';
      previewUrl.value = props.initialPreviewUrl;
      isConverting.value = false;
  }
  img.src = imageBase64;
};

// close (tidak berubah)
const close = () => {
    if (props.show) {
        emit('close');
    }
};

// savePhoto (tidak berubah)
const savePhoto = () => {
  if (webPBase64.value && !isConverting.value) {
    emit('photo-uploaded', webPBase64.value);
  } else if (isConverting.value) {
      error.value = "Tunggu konversi selesai.";
  } else if (!error.value) {
      error.value = "Pilih gambar dahulu.";
  }
};
</script>

<style scoped>
/* Style tidak berubah */
.modal { background-color: rgba(0, 0, 0, 0.5); }
.photo-upload-area { display: block; border: 2px dashed var(--bs-border-color); border-radius: 0.5rem; padding: 1rem; cursor: pointer; min-height: 200px; background-color: var(--bs-tertiary-bg); transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out; display: flex; justify-content: center; align-items: center; overflow: hidden; }
.photo-upload-area:hover { border-color: var(--bs-primary); background-color: var(--bs-secondary-bg); }
.placeholder-area { text-align: center; color: var(--bs-secondary-color); }
.preview-image { max-width: 100%; max-height: 300px; object-fit: contain; }
.alert { font-size: 0.85rem; margin-top: 0.75rem; }
.spinner-border-sm { vertical-align: text-bottom; }
</style>