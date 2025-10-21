// app/pages/jadwal.vue
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
             <CommonLoadingSpinner v-if="daurohStore.loading.tiketDauroh" />
            <div v-else-if="daurohStore.tiketDauroh.length > 0" class="table-responsive">
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
                    <td>{{ formatSingleDate(dauroh.Date) || 'Akan Diumumkan' }}</td>
                    <td>{{ dauroh.Title }}</td>
                    <td>
                        <span v-if="dauroh.Gender" class="badge bg-primary-subtle text-primary-emphasis rounded-pill text-capitalize">
                            {{ dauroh.Gender }}
                        </span>
                         <span v-else class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                            Umum
                        </span>
                    </td>
                     <td>
                        <span v-if="isUpcoming(dauroh.Date)" class="badge bg-success-subtle text-success-emphasis rounded-pill">
                          Akan Datang
                        </span>
                         <span v-else class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                          Selesai
                        </span>
                    </td>
                  </tr>
                  </tbody>
              </table>
            </div>
             <div v-else class="text-center text-muted py-4">
               <p>Tidak ada jadwal dauroh yang tersedia saat ini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDaurohStore } from '~/stores/dauroh';
import { onMounted } from 'vue'; // Import onMounted

const daurohStore = useDaurohStore();

useHead({
  title: 'Jadwal Dauroh'
});

// Panggil fetchPublicTiketDauroh saat komponen dimuat
// Store akan handle agar tidak fetch ulang jika data sudah ada
onMounted(() => {
  daurohStore.fetchPublicTiketDauroh();
});

 // Helper function to format the first date found in the Date object
const formatSingleDate = (dateObj) => {
    if (!dateObj) return null;
    const firstKey = Object.keys(dateObj)[0];
    return firstKey ? dateObj[firstKey]?.date : null;
};

// Helper function to check if the event is upcoming (basic example)
const isUpcoming = (dateObj) => {
    const firstDateStr = formatSingleDate(dateObj);
    if (!firstDateStr) return true; // Anggap upcoming jika tanggal belum ada

    // Ini contoh sederhana, perlu parsing tanggal yang lebih robust
    try {
        // Asumsi format 'YYYY-MM-DD' atau format lain yang bisa diparse
        const eventDate = new Date(firstDateStr.split('/').reverse().join('-')); // Coba parse DD/MM/YYYY
         if (isNaN(eventDate.getTime())) {
            // Coba parse YYYY-MM-DD
             const eventDateAlt = new Date(firstDateStr);
             if (isNaN(eventDateAlt.getTime())) return true; // Gagal parse, anggap upcoming
             return eventDateAlt >= new Date();
        }
        return eventDate >= new Date();
    } catch (e) {
        return true; // Anggap upcoming jika ada error parsing
    }
};
</script>