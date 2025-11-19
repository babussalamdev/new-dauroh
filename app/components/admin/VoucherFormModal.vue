<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Generate Voucher Baru</h5>
          <button type="button" class="btn-close" @click="close" :disabled="store.loadingGenerate"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="save" id="voucherGenerateForm">
            <div class="row g-3">
              <div class="col-12">
                <label for="quantity" class="form-label">Jumlah Voucher *</label>
                <input type="number" class="form-control" id="quantity" v-model.number="formState.quantity" min="1" max="100" required>
                <small class="text-muted">Berapa banyak kode unik yang ingin dibuat (Maks 100).</small>
              </div>

              <div class="col-12">
                <label for="discountType" class="form-label">Tipe Di skon *</label>
                <select class="form-select" id="discountType" v-model="formState.discountType" required>
                  <option value="PERCENT">Persentase (%)</option>
                  <option value="FIXED">Potongan Tetap (Rp)</option>
                </select>
              </div>
              
              <div class="col-12">
                <label for="discountValue" class="form-label">Nilai Di skon *</label>
                <input type="number" class="form-control" id="discountValue" v-model.number="formState.discountValue" min="1" required>
                <small v-if="formState.discountType === 'PERCENT'" class="text-muted">Masukkan angka saja. Cth: 20 (untuk 20%)</small>
                <small v-else class="text-muted">Masukkan nominal potongan. Cth: 50000 (untuk Rp 50.000)</small>
              </div>

               <div class="col-12">
                <label for="expiresAt" class="form-label">Tanggal Kadaluwarsa *</label>
                <input type="date" class="form-control" id="expiresAt" v-model="formState.expiresAt" :min="todayDate" required>
              </div>

            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="store.loadingGenerate">Batal</button>
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
            {{ store.loadingGenerate ? 'Membuat...' : 'Generate Voucher' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useVoucherStore } from '@/stores/voucher';
import type { GenerateVoucherPayload } from '@/stores/voucher';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);
const store = useVoucherStore();

// State awal form
const getInitialFormState = (): GenerateVoucherPayload => ({
  quantity: 1,
  discountType: 'PERCENT',
  discountValue: 10,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!, // Default 30 hari
});

const formState = reactive(getInitialFormState());

// Untuk setting 'min' di input tanggal
const todayDate = computed(() => new Date().toISOString().split('T')[0]);

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
    Object.assign(formState, getInitialFormState()); // Reset form
    close();
  }
};
</script>

<style scoped>
.modal { background-color: rgba(0, 0, 0, 0.5); }
</style>