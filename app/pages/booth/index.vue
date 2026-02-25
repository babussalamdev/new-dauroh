<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h1 class="mb-0 text-center">Sewa Booth</h1>
          </div>
          <div class="card-body p-4">
            <p class="lead text-center mb-4">
              Tertarik untuk membuka booth di event? Silakan isi formulir di bawah ini.
            </p>

            <div v-if="submitted" class="alert alert-success mt-4">
              Terima kasih! Pengajuan Anda telah kami terima. Kami akan segera menghubungi Anda.
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="boothName" class="form-label">Nama Booth / Usaha *</label>
                <input type="text" class="form-control" id="boothName" v-model="form.boothName" required>
              </div>
              <div class="mb-3">
                <label for="contactName" class="form-label">Nama Kontak *</label>
                <input type="text" class="form-control" id="contactName" v-model="form.contactName" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email *</label>
                <input type="email" class="form-control" id="email" v-model="form.email" required>
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Nomor Telepon (WhatsApp) *</label>
                <input type="tel" class="form-control" id="phone" v-model="form.phone" required>
              </div>

              <div v-if="error" class="alert alert-danger small p-2 mt-3">
                {{ error }}
              </div>

              <div class="d-grid mt-4">
                <button type="submit" class="btn btn-primary" :disabled="loading">
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
    // console.log('API Response:', response.data);

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