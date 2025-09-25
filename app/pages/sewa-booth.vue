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
              Tertarik untuk membuka booth di dauroh? Silakan isi formulir di bawah ini.
            </p>
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="boothName" class="form-label">Nama Booth / Usaha</label>
                <input type="text" class="form-control" id="boothName" required>
              </div>
              <div class="mb-3">
                <label for="contactName" class="form-label">Nama Kontak</label>
                <input type="text" class="form-control" id="contactName" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" required>
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Nomor Telepon</label>
                <input type="tel" class="form-control" id="phone" required>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary">Kirim Pengajuan</button>
              </div>
            </form>
            <div v-if="submitted" class="alert alert-success mt-4">
              Terima kasih! Pengajuan Anda telah kami terima.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const submitted = ref(false);

const handleSubmit = () => {
  // Logika frontend-only
  submitted.value = true;
  console.log();
};

useHead({
  title: 'Sewa Booth'
});
</script>