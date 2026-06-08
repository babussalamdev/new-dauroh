<template>
  <div class="container py-5">
    <CommonBreadcrumb :items="[{text: 'Beranda', to: '/', icon: 'bi bi-house'}, {text: 'Sewa Booth'}]" />
    <div class="row justify-content-center">
      <div class="col-lg-8">
        
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header bg-white py-3 border-bottom-0 pt-4 px-4">
            <h1 class="mb-0 text-center txt-title fw-bold text-dark">Sewa Booth</h1>
          </div>
          
          <div class="card-body p-4 pt-2">
            <p class="text-center mb-4 txt-body text-muted">
              Tertarik untuk membuka booth di event? Silakan isi formulir di bawah ini.
            </p>

            <div v-if="submitted" class="alert alert-success mt-4 txt-body fw-bold rounded-3 border-0 text-center">
              <i class="bi bi-check-circle-fill me-2 fs-5"></i>
              <div>Terima kasih! Pengajuan Anda telah kami terima. Kami akan segera menghubungi Anda.</div>
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="boothName" class="form-label txt-label fw-bold text-secondary">Nama Booth / Usaha *</label>
                <input type="text" class="form-control txt-body" id="boothName" v-model="form.boothName" required>
              </div>
              <div class="mb-3">
                <label for="contactName" class="form-label txt-label fw-bold text-secondary">Nama Kontak *</label>
                <input type="text" class="form-control txt-body" id="contactName" v-model="form.contactName" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label txt-label fw-bold text-secondary">Email *</label>
                <input type="email" class="form-control txt-body" id="email" v-model="form.email" required>
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label txt-label fw-bold text-secondary">Nomor Telepon (WhatsApp) *</label>
                <input type="tel" class="form-control txt-body" id="phone" v-model="form.phone" required>
              </div>

              <div v-if="error" class="alert alert-danger txt-caption fw-bold p-2 mt-3 rounded-3 border-0">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ error }}
              </div>

              <div class="d-grid mt-4 pt-3 border-top">
                <button type="submit" class="btn btn-primary rounded-pill txt-body fw-bold py-2 shadow-sm" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>
                  {{ loading ? 'Mengirim...' : 'Kirim Pengajuan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToastStore } from '~/stores/toast';

useHead({
  title: 'Sewa Booth'
});

const { $apiBase } = useNuxtApp();
const toastStore = useToastStore();

const submitted = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  boothName: '',
  contactName: '',
  email: '',
  phone: ''
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    // const response = await $apiBase.post('/api/booth-requests', form);


    // Simulasi penundaan API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Jika berhasil:
    submitted.value = true; // Tampilkan pesan sukses
    toastStore.showToast({ message: 'Pengajuan berhasil terkirim!', type: 'success' });
    // Reset form
    form.boothName = '';
    form.contactName = '';
    form.email = '';
    form.phone = '';

  } catch (err: any) {
    console.error('Gagal mengirim pengajuan booth:', err);
    error.value = err.response?.data?.message || 'Gagal mengirim pengajuan. Coba lagi nanti.';
    toastStore.showToast({ message: error.value || 'Terjadi kesalahan', type: 'danger' });
  } finally {
    loading.value = false;
  }
};
</script>