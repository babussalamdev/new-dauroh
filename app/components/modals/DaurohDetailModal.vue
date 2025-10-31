<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">{{ dauroh?.Title || 'Detail Dauroh' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-4 mb-3 mb-md-0">
              <img :src="dauroh?.poster" alt="Poster Dauroh" class="img-fluid rounded shadow-sm" />
            </div>
            <div class="col-md-8">

              <div v-if="dauroh?.Gender" class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-person-hearts me-2 text-primary"></i>Target Peserta</h6>
                <p class="ps-4 mb-0 text-capitalize">
                  <small>{{ dauroh.Gender }}</small>
                </p>
              </div>
              <div class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-calendar-event me-2 text-primary"></i>Jadwal & Tempat</h6>
                <ul class="list-unstyled ps-4">
                  <li v-for="(day, key, index) in dauroh?.Date" :key="key" class="mb-2">
                    <strong>Hari ke-{{ index + 1 }}</strong>
                    <ul class="list-unstyled ps-3">
                      <li><small><strong>Tanggal:</strong> {{ day.date }}</small></li>
                      <li><small><strong>Waktu:</strong> {{ day.start_time }} - {{ day.end_time }}</small></li>
                    </ul>
                  </li>
                  <li v-if="dauroh?.Place" class="mt-2">
                    <small><strong>Tempat:</strong> {{ dauroh.Place }}</small>
                  </li>
                </ul>
              </div>

              <div class="detail-section mb-3">
                <h6 class="fw-bold"><i class="bi bi-ticket-detailed me-2 text-primary"></i>Harga</h6>
                <p class="ps-4 mb-0">
                  <small>Rp{{ dauroh?.Price?.toLocaleString('id-ID') || 'Gratis' }}</small>
                </p>
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
.text-capitalize {
  text-transform: capitalize;
}
</style>