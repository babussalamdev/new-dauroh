<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Konfirmasi Hapus</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <p>Apakah Anda yakin ingin menghapus <strong>{{ itemName }}</strong>?</p>
          <p class="text-danger small">Tindakan ini tidak dapat diurungkan.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Batal</button>
          <button type="button" class="btn btn-danger" @click="confirm">Hapus</button>
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