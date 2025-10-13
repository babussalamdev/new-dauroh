<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">{{ dauroh?.title || 'Detail Dauroh' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4 mb-3 mb-md-0">
              <img :src="dauroh?.poster" alt="Poster Dauroh" class="img-fluid rounded shadow-sm" />
            </div>
            <div class="col-md-8">
              
              <div v-if="dauroh?.pemateri" class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-person-fill me-2 text-primary"></i>Pemateri & Tema</h6>
                <ul class="list-unstyled ps-4">
                  <li v-for="(p, index) in dauroh.pemateri.split(',')" :key="index" class="mb-1">
                    <small>{{ p.trim() }}</small>
                  </li>
                </ul>
              </div>

              <div class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-calendar-event me-2 text-primary"></i>Waktu & Tempat</h6>
                <ul class="list-unstyled ps-4">
                  <li v-if="dauroh?.waktu"><small><strong>Waktu:</strong> {{ dauroh.waktu }}</small></li>
                  <li v-if="dauroh?.tempat"><small><strong>Tempat:</strong> {{ dauroh.tempat }}</small></li>
                </ul>
              </div>

              <div v-if="dauroh?.kuota" class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-people-fill me-2 text-primary"></i>Kuota Peserta</h6>
                 <p class="ps-4 mb-0"><small>{{ dauroh.kuota }} Peserta</small></p>
              </div>

              <div v-if="dauroh?.fasilitas" class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-gift-fill me-2 text-primary"></i>Fasilitas</h6>
                <ul class="list-unstyled ps-4">
                   <li v-for="(f, index) in dauroh.fasilitas.split(',')" :key="index" class="mb-1">
                    <small>{{ f.trim() }}</small>
                  </li>
                </ul>
              </div>

              <div v-if="dauroh?.syarat" class="detail-section">
                <h6 class="fw-bold"><i class="bi bi-card-checklist me-2 text-primary"></i>Syarat & Ketentuan</h6>
                <p class="ps-4 mb-0"><small>{{ dauroh.syarat }}</small></p>
              </div>

            </div>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-between border-0">
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
.modal-body {
  font-size: 0.9rem;
}
.detail-section h6 {
  font-size: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}
</style>