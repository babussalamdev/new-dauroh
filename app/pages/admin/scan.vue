<template>
  <div class="container-fluid px-4 py-4 d-flex flex-column align-items-center">
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Scan Presensi'}]" class="w-100 mb-3" />

    <div class="card shadow-sm border-0 rounded-4 w-100 mb-3" style="max-width: 450px;">
      <div class="card-body p-4 text-center">
        
        <h6 class="txt-subtitle text-dark mb-3">Arahkan ke QR-Code Peserta</h6>

        <div class="mx-auto rounded-4 overflow-hidden border bg-light mb-4 position-relative" style="max-width: 250px; min-height: 250px;">
          <div id="reader" class="w-100 h-100"></div>
          
          <div v-if="loading" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex flex-column justify-content-center align-items-center" style="z-index: 10;">
            <div class="spinner-border text-success mb-2" role="status"></div>
            <span class="txt-caption fw-bold text-success">Memverifikasi...</span>
          </div>
        </div>

        <NuxtLink to="/admin/kehadiran" class="btn btn-outline-success w-100 rounded-pill fw-bold txt-body">
          <i class="bi bi-card-list me-2"></i>Lihat Daftar Hadir
        </NuxtLink>

      </div>
    </div>

    <div v-if="scanResult" class="card shadow-sm border-0 rounded-4 w-100 border-start border-5" :class="scanResult.success ? 'border-success' : 'border-danger'" style="max-width: 450px;">
      <div class="card-body p-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <i v-if="scanResult.success" class="bi bi-check-circle-fill text-success fs-1 me-3"></i>
          <i v-else class="bi bi-x-circle-fill text-danger fs-1 me-3"></i>
          <div>
            <h6 class="mb-0 txt-subtitle text-dark">{{ scanResult.message }}</h6>
            <div class="txt-body text-muted text-capitalize">{{ scanResult.data?.participantName }}</div>
            
            <div v-if="scanResult.data?.time" class="txt-caption fw-bold mt-1" :class="scanResult.success ? 'text-success' : 'text-danger'">
              <i class="bi bi-clock me-1"></i> {{ scanResult.data.time }}
            </div>
          </div>
        </div>
        
        <button class="btn btn-light btn-sm rounded-circle" @click="resetScan" title="Tutup" style="width: 35px; height: 35px;">
          <i class="bi bi-x fs-5"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';
import dayjs from 'dayjs';

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/');
  }
});

const { $apiBase } = useNuxtApp() as any;

const loading = ref(false);
const scanResult = ref<any>(null);
let scanner: any = null;

onMounted(async () => {
  if (import.meta.client) {
    try {
      const module = await import('html5-qrcode');
      const Html5QrcodeScanner = module.Html5QrcodeScanner;

      setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
          false
        );
        scanner.render(onScanSuccess, () => {});
      }, 500);
    } catch (error) {
      console.error("Gagal load modul QR Scanner:", error);
    }
  }
});

onBeforeUnmount(() => {
  if (scanner) scanner.clear();
});

const onScanSuccess = (decodedText: string) => {
  if(loading.value) return;
  processTicket(decodedText);
};

// API CALL KE BACKEND
const processTicket = async (code: string) => {
  loading.value = true;
  if(scanner) scanner.pause();

  try {
    // Ekstrak JSON dari QR Code
    let qrData;
    try {
      qrData = JSON.parse(code);
    } catch (e) {
      throw new Error("QR Code tidak valid / Bukan dari sistem kami.");
    }

    if (!qrData.pk || !qrData.sk) {
      throw new Error("Data QR Code tidak lengkap.");
    }

    // Tarik Token dari Cookie
    const token = useCookie("AccessToken").value;
    if (!token) {
      throw new Error("Sesi login tidak valid. Silakan login ulang.");
    }

    // payload
    const response = await $apiBase.put('/update-attendance?type=scan', {
      AccessToken: token, 
      PK: qrData.pk,
      SK: qrData.sk
    });

    const beData = response.data;

    // Tampilkan Hasil Sukses
    scanResult.value = { 
      success: true, 
      message: 'Check-in Berhasil', 
      data: { 
        participantName: beData.Name || 'Peserta',
        time: beData.CheckIn ? dayjs(beData.CheckIn).format('HH:mm:ss WIB') : dayjs().format('HH:mm:ss WIB')
      } 
    };
    playSound(true);

  } catch (error: any) {
    console.error("Scan Error:", error);
    let errorMsg = 'Tiket Tidak Dikenali atau Gagal Update';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMsg = error.response.data;
      } 
      else if (error.response.data.message) {
        errorMsg = error.response.data.message;
      }
    } else if (error.message) {
       errorMsg = error.message;
    }
    
    scanResult.value = { 
      success: false, 
      message: 'Sudah Check-in',
      data: { 
        participantName: errorMsg,
      } 
    };
    playSound(false);
  } finally {
    loading.value = false;
    setTimeout(() => {
      if (scanResult.value) {
        resetScan();
      }
    }, 2500);
  }
};

const resetScan = () => {
  scanResult.value = null;
  if(scanner) scanner.resume();
};

const playSound = (isSuccess: boolean) => {
  const audio = new Audio(isSuccess ? '/sounds/success.mp3' : '/sounds/error.mp3');
  audio.play().catch(e => {}); 
};
</script>

<style scoped>
#reader { border: none !important; }
:deep(#reader__scan_region) { background: white; }
:deep(#reader__dashboard_section_csr span) { display: none !important; }
:deep(#reader video) { border-radius: 12px !important; object-fit: cover; }
</style>