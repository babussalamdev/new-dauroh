<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detail Dauroh</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body p-0" v-if="dauroh">
          <div class="text-center" style="background-color: #f8f9fa;">
            <img 
              :src="dauroh.poster" 
              class="img-fluid" 
              alt="Poster Dauroh" 
              style="max-height: 250px; object-fit: contain;"
            >
          </div>
          <div class="p-4">
            <h3 class="card-title">{{ dauroh.title }}</h3>
            <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill mb-3">{{ dauroh.genre }}</span>
            
            <h6 class="mt-4 fw-bold">Deskripsi</h6>
            <p>
              Selamat datang di Dauroh "{{ dauroh.title }}". Dauroh ini akan membahas secara mendalam mengenai {{ dauroh.genre }}. Cocok untuk Anda yang ingin memperdalam ilmu dan pemahaman.  
            </p>

            <h6 class="mt-4 fw-bold">Detail Acara</h6>
            <ul class="list-group list-group-flush">
              <li class="list-group-item px-0"><strong>Tanggal:</strong> {{ dauroh.date || 'Akan diumumkan' }}</li>
              <li class="list-group-item px-0"><strong>Pemateri:</strong> Ustadz Fulan</li>
              <li class="list-group-item px-0"><strong>Lokasi:</strong> Masjid Babussalam</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Tutup</button>
          <button type="button" class="btn btn-primary" @click="register">Daftar Sekarang</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, required: true },
  dauroh: { type: Object, default: null },
});

const emit = defineEmits(['close', 'register']);

const close = () => emit('close');
const register = () => {
  emit('register', props.dauroh);
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>