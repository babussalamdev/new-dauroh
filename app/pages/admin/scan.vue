<template>
  <div class="scan-page container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        
        <div class="card shadow-sm mb-4">
          <div class="card-body text-center p-2">
            <h5 class="mb-3 fw-bold">Mode Presensi</h5>
            <div class="btn-group w-100" role="group">
              <button 
                type="button" 
                class="btn fw-bold"
                :class="mode === 'checkin' ? 'btn-success' : 'btn-outline-success'"
                @click="mode = 'checkin'"
              >
                <i class="bi bi-box-arrow-in-right me-2"></i> Check-IN
              </button>
              <button 
                type="button" 
                class="btn fw-bold"
                :class="mode === 'checkout' ? 'btn-warning' : 'btn-outline-warning'"
                @click="mode = 'checkout'"
              >
                <i class="bi bi-box-arrow-left me-2"></i> Check-OUT
              </button>
            </div>
            <div class="mt-2 small text-muted">
              Mode saat ini: <strong>{{ mode === 'checkin' ? 'Masuk (Datang)' : 'Keluar (Pulang)' }}</strong>
            </div>
          </div>
        </div>

        <div class="card shadow border-0">
          <div class="card-header bg-white border-bottom-0 pt-3">
            <ul class="nav nav-tabs nav-fill card-header-tabs">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: inputMethod === 'camera' }" href="#" @click.prevent="inputMethod = 'camera'">
                  <i class="bi bi-qr-code-scan"></i> Kamera
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: inputMethod === 'manual' }" href="#" @click.prevent="inputMethod = 'manual'">
                  <i class="bi bi-keyboard"></i> Manual
                </a>
              </li>
            </ul>
          </div>

          <div class="card-body p-0">
            
            <div v-show="inputMethod === 'camera'" class="p-3 bg-light text-center">
              <div id="reader" width="600px" class="rounded overflow-hidden border"></div>
              <p class="text-muted small mt-2 mb-0">Arahkan kamera ke QR Code Peserta</p>
            </div>

            <div v-show="inputMethod === 'manual'" class="p-4">
              <form @submit.prevent="handleManualSubmit">
                <label class="form-label">Masukkan Kode Tiket</label>
                <div class="input-group mb-3">
                  <input 
                    v-model="manualCode" 
                    type="text" 
                    class="form-control form-control-lg" 
                    placeholder="Contoh: TIKET-12345" 
                    autofocus
                  >
                  <button class="btn btn-primary" type="submit" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                    <span v-else>Proses</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

        <div v-if="scanResult" class="mt-4 card border-start border-5" :class="scanResult.success ? 'border-success' : 'border-danger'">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div class="flex-shrink-0">
                <i v-if="scanResult.success" class="bi bi-check-circle-fill text-success fs-1"></i>
                <i v-else class="bi bi-x-circle-fill text-danger fs-1"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <h5 class="mb-0">{{ scanResult.message }}</h5>
                <small class="text-muted">{{ dayjs().format('DD MMM YYYY, HH:mm') }}</small>
              </div>
            </div>
            
            <div v-if="scanResult.data" class="bg-light p-3 rounded">
              <p class="mb-1"><strong>Nama:</strong> {{ scanResult.data.participantName }}</p>
              <p class="mb-1"><strong>Tiket:</strong> {{ scanResult.data.ticketId }}</p>
              <p class="mb-0"><strong>Status:</strong> <span class="badge bg-primary">{{ scanResult.data.status }}</span></p>
            </div>
            
            <button class="btn btn-secondary w-100 mt-3" @click="resetScan">Scan Lagi</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Html5QrcodeScanner } from "html5-qrcode";
import dayjs from 'dayjs'; // Kamu sudah punya dayjs di package.json

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});

const { $apiBase } = useNuxtApp();
const toast = useToastStore(); // Asumsi kamu pakai store toast yang ada

// STATE
const mode = ref<'checkin' | 'checkout'>('checkin');
const inputMethod = ref<'camera' | 'manual'>('camera');
const manualCode = ref('');
const loading = ref(false);
const scanResult = ref<any>(null);
let scanner: any = null;

// INIT SCANNER
onMounted(() => {
  // Delay sedikit untuk memastikan DOM ready
  setTimeout(() => {
    initScanner();
  }, 500);
});

onBeforeUnmount(() => {
  if (scanner) {
    scanner.clear();
  }
});

const initScanner = () => {
  // Config scanner
  scanner = new Html5QrcodeScanner(
    "reader",
    { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    },
    /* verbose= */ false
  );
  
  scanner.render(onScanSuccess, onScanFailure);
};

const onScanSuccess = (decodedText: string, decodedResult: any) => {
  // Stop scanning sementara biar gak double hit
  if(loading.value) return;
  processTicket(decodedText);
};

const onScanFailure = (error: any) => {
  // Biasanya ignore aja error scanning frame-by-frame
  // console.warn(`Code scan error = ${error}`);
};

const handleManualSubmit = () => {
  if (!manualCode.value) return;
  processTicket(manualCode.value);
};

// CORE LOGIC: API CALL
const processTicket = async (code: string) => {
  loading.value = true;
  
  // Pause scanner visual (opsional)
  if(scanner) scanner.pause();

  try {
    // === TEMBAK API DISINI ===
    // Sesuaikan endpoint backend lu nanti
    const endpoint = mode.value === 'checkin' ? '/admin/attendance/checkin' : '/admin/attendance/checkout';
    
    // Simulasi Request (Ganti ini dengan $apiBase.post)
    // const res = await $apiBase.post(endpoint, { ticket_code: code });
    
    // MOCK RESPONSE (Contoh)
    await new Promise(r => setTimeout(r, 800)); // Hapus ini nanti
    const mockRes = {
      success: true,
      message: mode.value === 'checkin' ? 'Check-in Berhasil' : 'Check-out Berhasil',
      data: {
        participantName: 'Abdullah Bin Fulan',
        ticketId: code,
        status: 'LUNAS'
      }
    };

    scanResult.value = mockRes;
    manualCode.value = ''; // Reset input manual
    
    // Play Sound Effect (Opsional - Biar UX dapet)
    playSound(true);

  } catch (error: any) {
    scanResult.value = {
      success: false,
      message: error.response?.data?.message || 'Tiket tidak ditemukan / Invalid',
      data: null
    };
    playSound(false);
  } finally {
    loading.value = false;
  }
};

const resetScan = () => {
  scanResult.value = null;
  manualCode.value = '';
  if(scanner) scanner.resume(); // Lanjut scan
};

// Audio Feedback (Biar admin tau tanpa liat layar terus)
const playSound = (isSuccess: boolean) => {
  const audio = new Audio(isSuccess 
    ? '/sounds/success.mp3' // Sediain file ini di public/sounds/
    : '/sounds/error.mp3'
  );
  audio.play();};
</script>

<style scoped>
/* Custom Style untuk Scanner Box biar rapi */
#reader {
  width: 100%;
  border: none !important;
}
#reader__scan_region {
  background: white;
}
</style>