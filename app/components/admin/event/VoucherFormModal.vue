<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Tambah Vouchers</h5>
          <button type="button" class="btn-close" @click="close" :disabled="store.loading"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="save" id="voucherGenerateForm">
            <div class="row g-3">

              <div class="col-12">
                <label for="jumlah" class="form-label">Jumlah Vouchers</label>
                <input type="number" class="form-control" id="jumlah" v-model.number="store.form.jumlah" min="1"
                  max="100" placeholder="Contoh: 5" required>
              </div>

              <div class="col-12">
                <label for="nominal" class="form-label">Nominal Potongan</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input type="number" class="form-control" id="nominal" v-model.number="store.form.nominal" min="0"
                    placeholder="Contoh: 250000" required>
                </div>
                <div class="form-text text-muted small">
                  Diskon berupa potongan harga langsung (Fixed).
                </div>
              </div>

              <div class="col-12">
                <label for="hari" class="form-label">Masa Aktif</label>
                <div class="input-group">
                  <input type="number" class="form-control" id="hari" v-model.number="store.form.hari" min="1"
                    placeholder="Contoh: 14" required>
                  <span class="input-group-text">Hari</span>
                </div>
              </div>

            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="store.loading">Close</button>
          <button type="submit" form="voucherGenerateForm" class="btn btn-primary" :disabled="store.loading">
            <span v-if="store.loading" class="spinner-border spinner-border-sm me-1" role="status"
              aria-hidden="true"></span>
            {{ store.loading ? 'Memproses...' : 'Submit' }}
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
/* Menggunakan style asli */
@import url("~/assets/css/components/modals.css");

.modal {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1060 !important;
}

.modal-backdrop {
  z-index: 1055 !important;
}
</style>