<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow rounded-4">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title txt-subtitle fw-bold text-dark">Konfirmasi Hapus</h5>
          <button type="button" class="btn-close shadow-none" @click="close"></button>
        </div>
        
        <div class="modal-body py-4">
          <p class="mb-2 txt-body">Apakah Anda yakin ingin menghapus <span class="fw-bold text-dark">{{ itemName }}</span>?</p>
          <p class="text-danger mb-0 txt-caption fw-bold">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>Tindakan ini tidak dapat diurungkan.
          </p>
        </div>
        
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-light border px-4 rounded-pill txt-body fw-bold" @click="close">Batal</button>
          <button type="button" class="btn btn-danger px-4 rounded-pill txt-body fw-bold shadow-sm" @click="confirm">
            <i class="bi bi-trash-fill me-1"></i> Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup>
defineProps({
  show: Boolean,
  itemName: String,
});

const emit = defineEmits(['close', 'confirm']);

const close = () => emit('close');
const confirm = () => {
  emit('confirm');
  close();
};
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>