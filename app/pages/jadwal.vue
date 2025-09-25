<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h1 class="mb-0 text-center">Jadwal Dauroh</h1>
          </div>
          <div class="card-body p-4">
            <p class="text-muted text-center mb-4">
              Berikut adalah jadwal lengkap untuk semua sesi dauroh yang akan datang.
            </p>
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-light">
                  <tr>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Nama Dauroh</th>
                    <th scope="col">Kategori</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dauroh in daurohStore.tiketDauroh" :key="dauroh.id">
                    <td>{{ dauroh.date || 'Akan Diumumkan' }}</td>
                    <td>{{ dauroh.title }}</td>
                    <td><span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">{{ dauroh.genre }}</span></td>
                    <td><span class="badge bg-success-subtle text-success-emphasis rounded-pill">{{ dauroh.topOverlay }}</span></td>
                  </tr>
                  </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDaurohStore } from '~/stores/dauroh';
const daurohStore = useDaurohStore();

useHead({
  title: 'Jadwal Dauroh'
});
</script>