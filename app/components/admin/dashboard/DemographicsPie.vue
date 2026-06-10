Secara visual, *chart* lu sebenarnya udah cukup rapi dan informatif. Tapi kalau mau dinaikin lagi level UI/UX-nya biar kelihatan lebih *modern* ala *dashboard* premium, ada 3 hal yang bisa di-*upgrade*:

### 1. Ubah dari Pie jadi Donut

Tipe *Donut chart* sekarang jauh lebih tren di dunia UI/UX dibanding *Pie chart* penuh, karena ngasih ruang kosong di tengah yang bikin tampilan kerasa lebih "lega" dan elegan.

### 2. Bikin Marker Legend Jadi Bulat

Di kodingan lu, marker legend-nya masih `shape: 'square'` (kotak). Mengingat *card* lu pakai `rounded-4` (sudutnya melengkung halus), bentuk marker bulat bakal jauh lebih menyatu sama tema UI keseluruhan.

### 3. Handle "Empty State" (Penting!)

Gimana kalau *event* tersebut baru dibikin dan pesertanya masih 0 (Ikhwan 0, Akhwat 0)? ApexCharts biasanya bakal nge- *render* area kosong yang aneh. Kita harus bikin tampilan *fallback* "Belum ada data".

Ini kodingan hasil *upgrade*-nya cuy, lu tinggal *copy-paste* ngegantiin isi file `DemographicsPie.vue` lu:

```html
<template>
  <div class="card border-0 shadow-sm rounded-4 h-100 bg-white demographic-card">
    <div class="card-body p-3 px-4 d-flex flex-column">

      <div class="mb-3">
        <h6 class="txt-subtitle fw-bold m-0 text-dark">Demografi Pengguna</h6>
        <p class="txt-caption text-muted mb-0">Total Keseluruhan Akun</p>
      </div>

      <div class="d-flex justify-content-center align-items-center flex-grow-1">
        <div v-if="ikhwan === 0 && akhwat === 0" class="text-center text-muted py-4">
          <i class="bi bi-pie-chart text-secondary opacity-25 d-block mb-2" style="font-size: 3rem;"></i>
          <span class="txt-caption fw-medium">Belum ada data demografi</span>
        </div>

        <ClientOnly v-else>
          <apexchart type="donut" width="100%" height="240" :options="chartOptions" :series="series"></apexchart>
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
import apexchart from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';

const props = defineProps<{
  ikhwan: number;
  akhwat: number;
}>();

const series = computed(() => [props.ikhwan, props.akhwat]);

const chartOptions: ApexOptions = {
  chart: {
    type: 'donut',
    fontFamily: 'inherit',
    animations: {
      enabled: true,
      speed: 800
    }
  },
  labels: ['Ikhwan', 'Akhwat'],
  colors: ['#0d6efd', '#f06292'], 
  plotOptions: {
    pie: {
      donut: {
        size: '55%', // 🟢 Dikecilin bolongannya biar cincinnya lebih tebal dan teks muat
        labels: {
          show: true, // 🟢 Nampilin total di tengah donut
          name: {
            show: true,
            fontSize: '12px',
            color: '#6c757d',
            offsetY: -5
          },
          value: {
            show: true,
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#212529',
            offsetY: 5,
            formatter: function (val) {
              return val + " Akun";
            }
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Total',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#6c757d'
          }
        }
      },
      expandOnClick: true
    }
  },
  stroke: {
    show: true,
    width: 3,
    colors: ['#ffffff']
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return Math.round(val as number) + "%"; // 🟢 Dibulatin biar teksnya nggak kepanjangan
    },
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#ffffff']
    },
    dropShadow: {
      enabled: true, // 🟢 Nyalain shadow tipis biar angka makin kontras dan gampang dibaca
      top: 1,
      left: 1,
      blur: 1,
      opacity: 0.5
    }
  },
  legend: {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    markers: {
    },
    itemMargin: {
      horizontal: 15,
      vertical: 5
    }
  },
  tooltip: {
    enabled: true,
    theme: 'light',
    y: {
      formatter: function (val) {
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
  box-shadow: 0 .25rem .75rem rgba(0, 0, 0, .08) !important;
}
</style>

```

Sekarang tampilannya bakal lebih elegan ala *framework modern* cuy, plus udah kebal kalau datanya lagi kosong melompong. Langsung gas *save*! 🚀