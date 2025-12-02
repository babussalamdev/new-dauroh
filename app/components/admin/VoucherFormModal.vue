<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Tambah Kupon</h5>
          <button type="button" class="btn-close" @click="close" :disabled="store.loadingGenerate"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="save" id="voucherGenerateForm">
            <div class="row g-3">
              
              <div class="col-12">
                <label for="jumlah" class="form-label">Jumlah Kupon</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="jumlah" 
                  v-model.number="formState.jumlah" 
                  min="1" 
                  max="100" 
                  placeholder="Contoh: 5"
                  required
                >
              </div>

              <div class="col-12">
                <label for="nominal" class="form-label">Nominal Potongan</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="nominal" 
                  v-model.number="formState.nominal" 
                  min="0" 
                  placeholder="Contoh: 250000"
                  required
                >
              </div>

              <div class="col-12">
                <label for="hari" class="form-label">Masa Aktif</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    class="form-control" 
                    id="hari" 
                    v-model.number="formState.hari" 
                    min="1" 
                    placeholder="Contoh: 14" 
                    required
                  >
                  <span class="input-group-text">Hari</span>
                </div>
              </div>

            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="store.loadingGenerate">Close</button>
          <button
            type="submit"
            form="voucherGenerateForm"
            class="btn btn-primary"
            :disabled="store.loadingGenerate"
          >
            <span
              v-if="store.loadingGenerate"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            {{ store.loadingGenerate ? 'Memproses...' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useVoucherStore } from '@/stores/voucher';
import type { GenerateVoucherPayload } from '@/stores/voucher';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);
const store = useVoucherStore();

// State awal form sesuai requirement
const getInitialFormState = (): GenerateVoucherPayload => ({
  jumlah: 1,
  nominal: 0,
  hari: 14, // Default 14 hari
});

const formState = reactive(getInitialFormState());

// Reset form tiap kali modal dibuka
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    Object.assign(formState, getInitialFormState());
  }
});

const close = () => {
  if (!store.loadingGenerate) emit('close');
};

const save = async () => {
   const formElement = document.getElementById('voucherGenerateForm') as HTMLFormElement;
   if (formElement && !formElement.checkValidity()) {
       formElement.reportValidity();
       return;
   }

  const success = await store.generateVouchers(formState);
  if (success) {
    close();
  }
};
</script>

<style scoped>
.modal { background-color: rgba(0, 0, 0, 0.5); }
</style>