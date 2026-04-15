<template>
  <div class="mt-4">
    <div class="bg-white rounded-4 shadow-sm p-3 mb-3 d-flex align-items-center border">
      <div class="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
        <i class="bi bi-pie-chart-fill fs-5"></i>
      </div>
      <div>
        <h6 class="fw-bold m-0 text-dark">Rasio Kehadiran Peserta (Check-In)</h6>
        <small class="text-muted">Persentase kedatangan berdasarkan tiket terjual</small>
      </div>
    </div>

    <div class="row g-3">
      <div :class="gridClass">
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center bg-white border">
          <h6 class="text-muted small fw-bold text-uppercase mb-3">Total Hadir Keseluruhan</h6>
          <div class="donut-chart" :style="`--percentage: ${calculatePercentage(stats.checkInTotal, stats.sold)}%; --color: #0d6efd;`">
            <div class="donut-inner">
              <h4 class="fw-bold mb-0 text-primary">{{ calculatePercentage(stats.checkInTotal, stats.sold) }}%</h4>
            </div>
          </div>
          <p class="small mt-3 mb-0 text-muted"><strong>{{ stats.checkInTotal }}</strong> Hadir dari <strong>{{ stats.sold }}</strong> Terjual</p>
        </div>
      </div>

      <div v-if="genderType === 'umum' || genderType === 'ikhwan'" :class="gridClass">
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center bg-white border">
          <h6 class="text-muted small fw-bold text-uppercase mb-3">Kehadiran Ikhwan</h6>
          <div class="donut-chart" :style="`--percentage: ${calculatePercentage(stats.checkInIkhwan, stats.soldIkhwan)}%; --color: #198754;`">
            <div class="donut-inner">
              <h4 class="fw-bold mb-0 text-success">{{ calculatePercentage(stats.checkInIkhwan, stats.soldIkhwan) }}%</h4>
            </div>
          </div>
          <p class="small mt-3 mb-0 text-muted"><strong>{{ stats.checkInIkhwan }}</strong> Hadir dari <strong>{{ stats.soldIkhwan }}</strong> Terjual</p>
        </div>
      </div>

      <div v-if="genderType === 'umum' || genderType === 'akhwat'" :class="gridClass">
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center bg-white border">
          <h6 class="text-muted small fw-bold text-uppercase mb-3">Kehadiran Akhwat</h6>
          <div class="donut-chart" :style="`--percentage: ${calculatePercentage(stats.checkInAkhwat, stats.soldAkhwat)}%; --color: #d63384;`">
            <div class="donut-inner">
              <h4 class="fw-bold mb-0" style="color: #d63384;">{{ calculatePercentage(stats.checkInAkhwat, stats.soldAkhwat) }}%</h4>
            </div>
          </div>
          <p class="small mt-3 mb-0 text-muted"><strong>{{ stats.checkInAkhwat }}</strong> Hadir dari <strong>{{ stats.soldAkhwat }}</strong> Terjual</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  genderType: string; // 'umum', 'ikhwan', atau 'akhwat'
  stats: {
    sold: number;
    soldIkhwan: number;
    soldAkhwat: number;
    checkInTotal: number;
    checkInIkhwan: number;
    checkInAkhwat: number;
  }
}>();

// Logic buat nyesuain lebar kolom: 
// Kalau Umum (3 chart) pake col-md-4. Kalau Khusus (2 chart) pake col-md-6 biar lega.
const gridClass = computed(() => {
  return props.genderType === 'umum' ? 'col-12 col-md-4' : 'col-12 col-md-6';
});

const calculatePercentage = (part: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};
</script>

<style scoped>
.donut-chart {
  position: relative;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: conic-gradient(var(--color) calc(var(--percentage) * 1%), #e9ecef 0);
  display: flex;
  align-items: center;
  justify-content: center;
}
.donut-inner {
  width: 100px;
  height: 100px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0px 0px 5px rgba(0,0,0,0.05);
}
</style>