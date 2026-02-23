<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">{{ event?.Title || 'Gambar Event' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body text-center">
          <img v-if="event?.Picture" :src="`${imgBaseUrl}/${event.SK}/${event.Picture}.webp`" :alt="event.Title"
            class="img-fluid rounded" @error="($event.target as HTMLImageElement).style.display = 'none'" />
          <div v-else
            class="Picture-preview-placeholder d-flex flex-column justify-content-center align-items-center text-muted mx-auto">
            <i class="bi bi-image fs-1"></i>
            <span>Picture Event</span>
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
import type { Event } from '~/types/event'

// Ambil config runtime
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

const props = defineProps<{
  show: boolean
  event?: Event
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const close = () => emit('close')
</script>

<style scoped>
@import url("~/assets/css/components/modals.css");

.img-fluid {
  max-height: 50vh;
  /* Batasi tinggi gambar agar pas di layar */
}
</style>