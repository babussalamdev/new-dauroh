<template>
  <div v-if="show" class="modal fade show d-block backdrop-blur" tabindex="-1" @click.self="triggerShake">
    <div class="modal-dialog modal-dialog-centered" :class="{ 'modal-shake': isShaking }">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        
        <div class="modal-header border-bottom-0 px-4 pt-4 pb-2">
          <h5 class="modal-title txt-subtitle fw-bold text-dark">Tambah Vouchers</h5>
          <button type="button" class="btn-close shadow-none bg-light p-2 rounded-circle" @click="close" :disabled="store.loading"></button>
        </div>

        <div class="modal-body px-4 py-3">
          <form @submit.prevent="save" id="voucherGenerateForm">
            <div class="row g-3">

              <div class="col-12">
                <label for="jumlah" class="form-label txt-label fw-bold text-secondary">Jumlah Vouchers <span class="text-danger">*</span></label>
                <input type="number" class="form-control txt-body fw-bold" id="jumlah" v-model.number="store.form.jumlah" min="1" max="100" placeholder="Contoh: 5" required>
              </div>

              <div class="col-12">
                <label for="nominal" class="form-label txt-label fw-bold text-secondary">Nominal Potongan <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text txt-body fw-bold">Rp</span>
                  <input type="number" class="form-control txt-body fw-bold" id="nominal" v-model.number="store.form.nominal" min="0" placeholder="Contoh: 250000" required>
                </div>
                <div class="form-text text-muted txt-caption">
                  <i class="bi bi-info-circle me-1"></i> Diskon berupa potongan harga langsung (Fixed).
                </div>
              </div>

              <div class="col-12">
                <label for="hari" class="form-label txt-label fw-bold text-secondary">Masa Aktif <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input type="number" class="form-control txt-body fw-bold" id="hari" v-model.number="store.form.hari" min="1" placeholder="Contoh: 14" required>
                  <span class="input-group-text txt-body fw-bold">Hari</span>
                </div>
              </div>

            </div>
          </form>
        </div>

        <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
          <button type="button" class="btn btn-light border px-4 rounded-pill txt-body fw-bold" @click="close" :disabled="store.loading">Batal</button>
          <button type="submit" form="voucherGenerateForm" class="btn btn-primary px-4 rounded-pill txt-body fw-bold shadow-sm" :disabled="store.loading">
            <span v-if="store.loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-magic me-1"></i>
            {{ store.loading ? 'Memproses...' : 'Generate' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useVoucherStore } from '@/stores/voucher';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);
const store = useVoucherStore();
const { isShaking, triggerShake } = useModalShake();

// Reset form di Store saat modal dibuka
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    store.resetForm();
  }
});

const close = () => {
  if (!store.loading) emit('close');
};

const save = async () => {
  const formElement = document.getElementById('voucherGenerateForm') as HTMLFormElement;
  if (formElement && !formElement.checkValidity()) {
    formElement.reportValidity();
    return;
  }

  // Panggil action store (tanpa parameter, karena data ambil dari state store.form)
  const success = await store.inputVoucher();

  if (success) {
    close();
  }
};
</script>

<style scoped>
@import url("~/assets/css/components/modals.css");

.modal {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1060 !important;
}

.modal-backdrop {
  z-index: 1055 !important;
}
</style>