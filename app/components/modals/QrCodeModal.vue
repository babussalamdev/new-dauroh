<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ ticket?.dauroh?.Title || 'E-Tiket Anda' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body text-center">
          <p class="fw-bold fs-5 mb-1">
            {{ ticket?.participant?.name || 'Peserta' }}
          </p>
          <p>Tunjukkan kode ini ke panitia di pintu masuk.</p>
          <img src="/assets/img/dauroh1.jpg" alt="Sample QR Code" class="img-fluid rounded">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Tutup</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  ticket: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const close = () => emit('close');
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
img {
  max-width: 250px;
}
</style>