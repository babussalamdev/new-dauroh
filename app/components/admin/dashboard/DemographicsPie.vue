<template>
  <div class="card border-0 shadow-sm rounded-4 h-100 bg-white demographic-card">
    <div class="card-body p-4 d-flex flex-column justify-content-between">
      
      <div class="text-center mb-3">
        <h6 class="fw-bold mb-1 text-dark">Demografi Pengguna</h6>
        <p class="text-muted small mb-0">Total Keseluruhan Akun</p>
      </div>

      <div class="d-flex justify-content-center align-items-center flex-grow-1">
        <ClientOnly>
          <apexchart 
            type="pie" 
            width="100%" 
            height="280" 
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
    type: 'pie', // 🟢 Ubah ke Pie Chart klasik
    fontFamily: 'inherit',
  },
  labels: ['Ikhwan', 'Akhwat'],
  colors: ['#0d6efd', '#ffc107'], // Biru (Ikhwan) & Kuning (Akhwat)
  stroke: {
    show: true,
    width: 1, // Garis putih tipis antar potongan biar rapi
    colors: ['#ffffff']
  },
  dataLabels: {
    enabled: true, // 🟢 Nyalain persentase di dalem pie
    style: {
      fontSize: '11px', // Dibikin kecil sesuai request
      fontWeight: 'bold',
      colors: ['#ffffff'] // Teks warna putih biar kontras sama background chart
    },
    dropShadow: {
      enabled: false // Matiin shadow teks biar clean
    }
  },
  legend: {
    show: true, // 🟢 Nyalain legenda bawaan
    position: 'bottom', // Posisinya di bawah chart
    horizontalAlign: 'center', // Di tengah
    markers: {
      size: 6, // Kotak legendanya dibikin agak ngotak (kayak di gambar lu)
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
        return val + " Akun" // Pas di hover muncul angka aslinya
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
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important;
}
</style>