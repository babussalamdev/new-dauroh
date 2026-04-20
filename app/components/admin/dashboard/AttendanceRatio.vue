<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mt-4">
    <div class="card-body p-0">
      
      <div class="p-3 px-4 d-flex align-items-center border-bottom bg-white">
        <div class="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style="width: 32px; height: 32px;">
          <i class="bi bi-pie-chart-fill"></i>
        </div>
        <div>
          <h6 class="txt-subtitle fw-bold m-0 text-dark">Rasio Kehadiran Peserta (Check-In)</h6>
          <p class="txt-caption text-muted mb-0">Persentase kedatangan berdasarkan tiket terjual</p>
        </div>
      </div>

      <div class="p-3">
        <div class="row g-2"> 
          
          <div :class="gridClass">
            <div class="card border-0 rounded-4 p-3 h-100 d-flex flex-row align-items-center inner-chart-card bg-light">
              <div class="circular-chart-container me-3 flex-shrink-0">
                <svg viewBox="0 0 36 36" class="circular-chart" style="--color: #0d6efd;">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle" :stroke-dasharray="`${calculatePercentage(stats.checkInTotal, stats.sold)}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="circular-chart-content">
                  <h6 class="txt-body fw-bold mb-0 text-primary">{{ calculatePercentage(stats.checkInTotal, stats.sold) }}%</h6>
                </div>
              </div>
              
              <div class="flex-grow-1">
                <p class="txt-label fw-bold text-dark mb-2">TOTAL KESELURUHAN</p>
                
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="txt-caption text-muted"><i class="bi bi-circle-fill text-primary me-2" style="font-size: 8px;"></i>Hadir</span>
                  <span class="txt-body fw-bold text-dark">{{ stats.checkInTotal }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="txt-caption text-muted"><i class="bi bi-circle-fill text-secondary me-2" style="font-size: 8px;"></i>Belum Hadir</span>
                  <span class="txt-body fw-bold text-dark">{{ stats.sold - stats.checkInTotal }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="genderType === 'umum' || genderType === 'ikhwan'" :class="gridClass">
            <div class="card border-0 rounded-4 p-3 h-100 d-flex flex-row align-items-center inner-chart-card bg-light">
              <div class="circular-chart-container me-3 flex-shrink-0">
                <svg viewBox="0 0 36 36" class="circular-chart" style="--color: #198754;">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle" :stroke-dasharray="`${calculatePercentage(stats.checkInIkhwan, stats.soldIkhwan)}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="circular-chart-content">
                  <h6 class="txt-body fw-bold mb-0 text-success">{{ calculatePercentage(stats.checkInIkhwan, stats.soldIkhwan) }}%</h6>
                </div>
              </div>
              <div class="flex-grow-1">
                <p class="txt-label fw-bold text-dark mb-2">IKHWAN</p>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="txt-caption text-muted"><i class="bi bi-circle-fill text-success me-2" style="font-size: 8px;"></i>Hadir</span>
                  <span class="txt-body fw-bold text-dark">{{ stats.checkInIkhwan }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="txt-caption text-muted"><i class="bi bi-circle-fill text-secondary me-2" style="font-size: 8px;"></i>Belum Hadir</span>
                  <span class="txt-body fw-bold text-dark">{{ stats.soldIkhwan - stats.checkInIkhwan }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="genderType === 'umum' || genderType === 'akhwat'" :class="gridClass">
            <div class="card border-0 rounded-4 p-3 h-100 d-flex flex-row align-items-center inner-chart-card bg-light">
              <div class="circular-chart-container me-3 flex-shrink-0">
                <svg viewBox="0 0 36 36" class="circular-chart" style="--color: #d63384;">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle" :stroke-dasharray="`${calculatePercentage(stats.checkInAkhwat, stats.soldAkhwat)}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="circular-chart-content">
                  <h6 class="txt-body fw-bold mb-0" style="color: #d63384;">{{ calculatePercentage(stats.checkInAkhwat, stats.soldAkhwat) }}%</h6>
                </div>
              </div>
              <div class="flex-grow-1">
                <p class="txt-label fw-bold text-dark mb-2">AKHWAT</p>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="txt-caption text-muted"><i class="bi bi-circle-fill me-2" style="font-size: 8px; color: #d63384;"></i>Hadir</span>
                  <span class="txt-body fw-bold text-dark">{{ stats.checkInAkhwat }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="txt-caption text-muted"><i class="bi bi-circle-fill text-secondary me-2" style="font-size: 8px;"></i>Belum Hadir</span>
                  <span class="txt-body fw-bold text-dark">{{ stats.soldAkhwat - stats.checkInAkhwat }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  genderType: string;
  stats: {
    sold: number;
    soldIkhwan: number;
    soldAkhwat: number;
    checkInTotal: number;
    checkInIkhwan: number;
    checkInAkhwat: number;
  }
}>();

const gridClass = computed(() => {
  return props.genderType === 'umum' ? 'col-12 col-md-4' : 'col-12 col-md-6';
});

const calculatePercentage = (part: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};
</script>

<style scoped>
.inner-chart-card {
  background-color: #f8f9fa !important; 
  border: 1px solid #f1f3f5 !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

.inner-chart-card:hover {
  background-color: #ffffff !important;
  border-color: #dee2e6 !important;
  transform: translateY(-2px);
  box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
}

/* 🟢 CSS UNTUK SVG PROGRESS RING 🟢 */
.circular-chart-container {
  position: relative;
  width: 75px; 
  height: 75px;
}

.circular-chart {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #e9ecef; /* Warna trek abu-abu */
  stroke-width: 3.5; /* Ketebalan garis background */
}

.circle {
  fill: none;
  stroke-width: 3.5; /* Ketebalan garis progress */
  stroke-linecap: round; /* Ini yang bikin ujung garisnya melengkung halus! */
  stroke: var(--color); /* Warnanya ngikutin in-line style vue */
  transition: stroke-dasharray 1s ease-out; /* Animasi berjalan pas load */
}

.circular-chart-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>