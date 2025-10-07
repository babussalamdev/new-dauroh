<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ dauroh?.title || 'Detail Dauroh' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4 mb-3 mb-md-0">
              <img :src="dauroh?.poster" alt="Poster Dauroh" class="img-fluid rounded shadow-sm" />
            </div>
            <div class="col-md-8">
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><strong>Judul:</strong> {{ dauroh?.title }}</li>
                <li v-if="dauroh?.pemateri" class="list-group-item"><strong>Pemateri:</strong> {{ dauroh?.pemateri }}</li>
                <li v-if="dauroh?.waktu" class="list-group-item"><strong>Waktu:</strong> {{ dauroh?.waktu }}</li>
                <li v-if="dauroh?.tempat" class="list-group-item"><strong>Tempat:</strong> {{ dauroh?.tempat }}</li>
                <li v-if="dauroh?.kuota" class="list-group-item"><strong>Kuota:</strong> {{ dauroh?.kuota }} peserta</li>
                <li v-if="dauroh?.fasilitas" class="list-group-item"><strong>Fasilitas:</strong> {{ dauroh?.fasilitas }}</li>
                <li v-if="dauroh?.syarat" class="list-group-item"><strong>Syarat & Ketentuan:</strong> {{ dauroh?.syarat }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-between">
          <button type="button" class="btn btn-secondary" @click="close">Tutup</button>
          <button type="button" class="btn btn-primary" @click="register">Daftar Sekarang</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import type { Dauroh } from '~/stores/dauroh'

const props = defineProps<{
  show: boolean
  dauroh?: Dauroh
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'register', val: Dauroh | undefined): void
}>()

const close = () => emit('close')
const register = () => emit('register', props.dauroh)
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.list-group-item {
  font-size: 0.9rem;
}
</style>
