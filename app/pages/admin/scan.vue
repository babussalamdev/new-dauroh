<template>
  <div class="container-fluid px-4 py-4 d-flex flex-column align-items-center">
    <div class="card shadow-sm border-0 rounded-4 w-100 mb-3" style="max-width: 450px;">
      <div class="card-body p-4 text-center">
        
        <h6 class="fw-bold text-dark mb-3">Arahkan ke QR-Code Peserta</h6>

        <div class="mx-auto rounded-4 overflow-hidden border bg-light mb-4" style="max-width: 250px;">
          <div id="reader" class="w-100"></div>
        </div>

        <NuxtLink to="/admin/kehadiran" class="btn btn-outline-success w-100 rounded-pill fw-bold">
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
            <h6 class="mb-0 fw-bold text-dark">{{ scanResult.message }}</h6>
            <div class="small text-muted">{{ scanResult.data?.participantName || 'Kode Tidak Valid' }}</div>
          </div>
        </div>
        <button class="btn btn-light btn-sm rounded-circle" @click="resetScan" title="Tutup">
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

// CORE LOGIC: API CALL
const processTicket = async (code: string) => {
  loading.value = true;
  if(scanner) scanner.pause();

  try {
    // Simulasi Nembak API
    await new Promise(r => setTimeout(r, 600)); 
    const mockRes = {
      success: true,
      message: 'Check-in Berhasil',
      data: { participantName: code === '123' ? 'Budi Santoso' : 'Abdullah Bin Fulan' }
    };
    scanResult.value = mockRes;
    playSound(true);
  } catch (error: any) {
    scanResult.value = { success: false, message: 'Tiket Tidak Dikenali', data: null };
    playSound(false);
  } finally {
    loading.value = false;
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
/* Paksa styling html5-qrcode biar ga jelek */
#reader { border: none !important; }
:deep(#reader__scan_region) { background: white; }
:deep(#reader__dashboard_section_csr span) { display: none !important; }
:deep(#reader video) { border-radius: 12px !important; object-fit: cover; }
</style>