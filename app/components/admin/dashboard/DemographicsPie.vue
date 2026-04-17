<template>
  <div class="card border-0 shadow-sm rounded-4 h-100 bg-white demographic-card">
    <div class="card-body p-3 px-4 d-flex flex-column">
      
      <div class="mb-3">
        <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.95rem;">Demografi Pengguna</h6>
        <p class="text-muted mb-0" style="font-size: 0.8rem;">Total Keseluruhan Akun</p>
      </div>

      <div class="d-flex justify-content-center align-items-center flex-grow-1">
        <ClientOnly>
          <apexchart 
            type="pie" 
            width="100%" 
            height="240" 
            :options="chartOptions" 
            :series="series"
          ></apexchart>
          <template #fallback>
            <div class="spinner-border text-primary opacity-50" role="status"></div>
          </template>
        </ClientOnly>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';
const apexchart = VueApexCharts;

const props = defineProps<{
  ikhwan: number;
  akhwat: number;
}>();

const series = computed(() => [props.ikhwan, props.akhwat]);

const chartOptions: ApexOptions = {
  chart: {
    type: 'pie',
    fontFamily: 'inherit',
  },
  labels: ['Ikhwan', 'Akhwat'],
  colors: ['#0d6efd', '#ffc107'], // Biru (Ikhwan) & Kuning (Akhwat)
  stroke: {
    show: true,
    width: 2, 
    colors: ['#ffffff']
  },
  dataLabels: {
    enabled: true, 
    style: {
      fontSize: '11px',
      fontWeight: 'bold',
      colors: ['#ffffff']
    },
    dropShadow: {
      enabled: false 
    }
  },
  legend: {
    show: true, 
    position: 'bottom', 
    horizontalAlign: 'center', 
    markers: {
      size: 5, // Dikecilin dikit biar makin rapi
      shape: 'square', // Dibikin kotak tegass
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5
    }
  },
  tooltip: {
    enabled: true,
    theme: 'light',
    y: {
      formatter: function(val) {
        return val + " Akun" 
      }
    }
  }
};
</script>

<style scoped>
.demographic-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.demographic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .25rem .75rem rgba(0,0,0,.08)!important;
}
</style>