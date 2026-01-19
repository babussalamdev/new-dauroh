<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Lupa Password</h5>
          <button type="button" class="btn-close" @click="closeModal" :disabled="loading"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted small mb-3">Masukkan email Anda yang terdaftar untuk menerima instruksi reset password.</p>
          <form @submit.prevent="handleForgotPassword">
            <div class="mb-3">
              <label for="forgotEmail" class="form-label">Email</label>
              <input
                type="email"
                id="forgotEmail"
                v-model="form.email"
                placeholder="contoh@email.com"
                class="form-control"
                required
              />
            </div>

            <div v-if="error" class="alert alert-danger mt-3 small p-2">
              {{ error }}
            </div>
             <div v-if="successMessage" class="alert alert-success mt-3 small p-2">
              {{ successMessage }}
            </div>

            <div class="d-grid gap-2 mt-4">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ loading ? 'Mengirim...' : 'Kirim Instruksi' }}
              </button>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="loading">Tutup</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

// Props & Emits
const props = defineProps<{
  show: boolean;
}>();
const emit = defineEmits(['close']);

// State
const { $apiBase } = useNuxtApp();
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const form = reactive({
  email: ''
});

// Watcher to reset state when modal opens
watch(() => props.show, (newValue) => {
  if (newValue) {
    form.email = '';
    error.value = null;
    successMessage.value = null;
    loading.value = false;
  }
});

// Close Modal Function
const closeModal = () => {
  if (!loading.value) { // Prevent closing while loading
    emit('close');
  }
};

// Forgot Password Handler
const handleForgotPassword = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    // const response = await $apiBase.post('/forgot-password', { // Ganti dengan endpoint yang benar
    //   email: form.email
    // });
    // successMessage.value = response.data.message || 'Instruksi reset password telah dikirim.';

    // --- Simulasi Sukses ---
    console.log('Mengirim permintaan reset password untuk:', form.email);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay API
    successMessage.value = 'Instruksi reset password telah dikirim ke email Anda. Silakan cek inbox/spam.';
    form.email = ''; // Clear form on success
    // --- Akhir Simulasi ---

  } catch (err: any) {
    error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal mengirim instruksi.';
    console.error('Forgot password error:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal {
  z-index: 1055;
}
.modal-backdrop {
    z-index: 1050;
}
</style>