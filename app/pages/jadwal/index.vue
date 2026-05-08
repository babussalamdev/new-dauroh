<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h1 class="mb-0 text-center txt-title fw-bold">Jadwal Event</h1>
          </div>
          <div class="card-body p-4">
            <p class="text-muted text-center mb-4 txt-body">
              Berikut adalah jadwal lengkap untuk semua sesi event yang akan datang.
            </p>
            <CommonLoadingSpinner v-if="isLoadingJadwal" />
            
            <div v-else-if="listJadwal.length > 0" class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-light">
                  <tr>
                    <th scope="col" class="txt-label fw-bold">Tanggal</th>
                    <th scope="col" class="txt-label fw-bold">Nama Event</th>
                    <th scope="col" class="txt-label fw-bold">Kategori</th>
                    <th scope="col" class="txt-label fw-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in listJadwal" :key="event.SK">
                    <td class="txt-body">{{ formatSingleDate(event.Date) || 'Akan Diumumkan' }}</td>
                    <td class="txt-body">{{ event.Title }}</td>
                    <td class="txt-body">
                      <span v-if="event.Gender"
                        class="badge bg-primary-subtle text-primary-emphasis rounded-pill text-capitalize txt-caption fw-bold">
                        {{ event.Gender }}
                      </span>
                      <span v-else class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill txt-caption fw-bold">
                        Umum
                      </span>
                    </td>
                    <td class="txt-body">
                      <span v-if="isUpcoming(event.Date)"
                        class="badge bg-success-subtle text-success-emphasis rounded-pill txt-caption fw-bold">
                        Akan Datang
                      </span>
                      <span v-else class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill txt-caption fw-bold">
                        Selesai
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="text-center text-muted py-4">
              <p class="txt-body fw-bold">Tidak ada jadwal event yang tersedia saat ini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEventStore } from '~/stores/event';
import { onMounted } from 'vue'; // Import onMounted

const eventStore = useEventStore();

useHead({
  title: 'Jadwal Event'
});
const listJadwal = ref([]);
const isLoadingJadwal = ref(true);

onMounted(async () => {
  isLoadingJadwal.value = true;
  const rawData = await eventStore.fetchViewData('schedule');
  listJadwal.value = rawData || [];
  isLoadingJadwal.value = false;
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
  try {
  
    const eventDate = new Date(firstDateStr.split('/').reverse().join('-'));
    if (isNaN(eventDate.getTime())) {
      // Coba parse YYYY-MM-DD
      const eventDateAlt = new Date(firstDateStr);
      if (isNaN(eventDateAlt.getTime())) return true;
      return eventDateAlt >= new Date();
    }
    return eventDate >= new Date();
  } catch (e) {
    return true;
  }
};
</script>
<style scoped>
@import url("~/assets/css/admin/tables.css");
</style>