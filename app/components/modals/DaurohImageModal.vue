<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">{{ dauroh?.Title || 'Gambar Event' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body text-center">
          <img 
            v-if="dauroh?.Picture"
            :src="`${imgBaseUrl}/${dauroh.sk}/${dauroh.Picture}.webp`" 
            :alt="dauroh.Title" 
            class="img-fluid rounded"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <div v-else class="Picture-preview-placeholder d-flex flex-column justify-content-center align-items-center text-muted mx-auto">
            <i class="bi bi-image fs-1"></i>
            <span>Picture Dauroh</span>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-secondary" @click="close">Tutup</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Dauroh } from '~/stores/dauroh'

// Ambil config runtime
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

const props = defineProps<{
  show: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const close = () => emit('close')
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.6);
}
.img-fluid {
  max-height: 80vh; /* Batasi tinggi gambar agar pas di layar */
}
.Picture-preview-placeholder {
  width: 100%;
  min-height: 300px;
  aspect-ratio: 2 / 3;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.5rem;
}
</style>