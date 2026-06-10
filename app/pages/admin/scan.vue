<template>
  <div class="container-fluid px-4 py-4 d-flex flex-column align-items-center">
    <CommonBreadcrumb :items="[{ text: 'Dashboard', to: '/admin', icon: 'bi bi-house' }, { text: 'Scan Presensi' }]"
      class="w-100 mb-3" />

    <div class="card shadow-sm border-0 rounded-4 w-100 mb-3" style="max-width: 450px;">
      <div class="card-body p-4 text-center">

        <h6 class="txt-subtitle text-dark mb-3">Arahkan ke QR-Code Peserta</h6>

        <div class="mx-auto rounded-4 overflow-hidden border bg-light mb-4 position-relative"
          style="max-width: 250px; min-height: 250px;">
          <div id="reader" class="w-100 h-100"></div>

          <div v-if="loading"
            class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex flex-column justify-content-center align-items-center"
            style="z-index: 10;">
            <div class="spinner-border text-success mb-2" role="status"></div>
            <span class="txt-caption fw-bold text-success">Memverifikasi...</span>
          </div>
        </div>

        <NuxtLink to="/admin/kehadiran" class="btn btn-outline-success w-100 rounded-pill fw-bold txt-body">
          <i class="bi bi-card-list me-2"></i>Lihat Daftar Hadir
        </NuxtLink>

      </div>
    </div>

    <div v-if="scanResult" class="card shadow-sm border-0 rounded-4 w-100 border-start border-5"
      :class="scanResult.success ? 'border-success' : 'border-danger'" style="max-width: 450px;">
      <div class="card-body p-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <i v-if="scanResult.success" class="bi bi-check-circle-fill text-success fs-1 me-3"></i>
          <i v-else class="bi bi-x-circle-fill text-danger fs-1 me-3"></i>
          <div>
            <h6 class="mb-0 txt-subtitle text-dark">{{ scanResult.message }}</h6>
            <div class="txt-body text-muted text-capitalize">{{ scanResult.data?.participantName }}</div>

            <div v-if="scanResult.data?.time" class="txt-caption fw-bold mt-1"
              :class="scanResult.success ? 'text-success' : 'text-danger'">
              <i class="bi bi-clock me-1"></i> {{ scanResult.data.time }}
            </div>
          </div>
        </div>

        <button class="btn btn-light btn-sm rounded-circle" @click="resetScan" title="Tutup"
          style="width: 35px; height: 35px;">
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
let scannerStarted = false;

onMounted(async () => {
  if (!import.meta.client) return;

  try {
    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost'
    ) {
      alert('QR Scanner membutuhkan HTTPS.');
      return;
    }

    const { Html5Qrcode } = await import('html5-qrcode');

    scanner = new Html5Qrcode('reader');

    try {
      // Prioritas kamera belakang
      await scanner.start(
        {
          facingMode: 'environment'
        },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1
        },
        onScanSuccess,
        () => { }
      );

      scannerStarted = true;
    } catch (err) {
      console.warn(
        'Gagal menggunakan facingMode, mencoba kamera tersedia...',
        err
      );

      const cameras = await Html5Qrcode.getCameras();

      console.log('Available Cameras:', cameras);

      if (!cameras || cameras.length === 0) {
        throw new Error('Tidak ditemukan kamera pada perangkat.');
      }

      // Cari kamera belakang jika ada
      const backCamera =
        cameras.find((c: any) =>
          c.label?.toLowerCase().includes('back')
        ) ||
        cameras.find((c: any) =>
          c.label?.toLowerCase().includes('rear')
        ) ||
        cameras[0];

      await scanner.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1
        },
        onScanSuccess,
        () => { }
      );

      scannerStarted = true;
    }

    // Safari / iPhone fix
    setTimeout(() => {
      const video = document.querySelector(
        '#reader video'
      ) as HTMLVideoElement;

      if (video) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
      }
    }, 1000);

  } catch (error) {
    console.error('Gagal memulai QR Scanner:', error);

    scanResult.value = {
      success: false,
      message: 'Gagal Mengakses Kamera',
      data: {
        participantName:
          error instanceof Error
            ? error.message
            : 'Periksa izin kamera browser'
      }
    };
  }
});

onBeforeUnmount(async () => {
  try {
    if (scanner && scannerStarted) {
      await scanner.stop();
      await scanner.clear();
    }
  } catch (e) {
    console.error('Cleanup Scanner Error:', e);
  }
});

const onScanSuccess = async (decodedText: string) => {
  if (loading.value) return;

  await processTicket(decodedText);
};

const processTicket = async (code: string) => {
  loading.value = true;

  try {
    if (scanner && scannerStarted) {
      await scanner.pause();
    }

    let qrData;

    try {
      qrData = JSON.parse(code);
    } catch {
      throw new Error(
        'QR Code tidak valid / bukan dari sistem kami.'
      );
    }

    if (!qrData.pk || !qrData.sk) {
      throw new Error('Data QR Code tidak lengkap.');
    }

    const token = useCookie('AccessToken').value;

    if (!token) {
      throw new Error(
        'Sesi login tidak valid. Silakan login ulang.'
      );
    }

    const response = await $apiBase.put(
      '/update-attendance?type=scan',
      {
        AccessToken: token,
        PK: qrData.pk,
        SK: qrData.sk
      }
    );

    const beData = response.data;

    scanResult.value = {
      success: true,
      message: 'Check-in Berhasil',
      data: {
        participantName: beData.Name || 'Peserta',
        time: beData.CheckIn
          ? dayjs(beData.CheckIn).format('HH:mm:ss')
          : dayjs().format('HH:mm:ss')
      }
    };

    playSound(true);

  } catch (error: any) {
    console.error('Scan Error:', error);

    let errorMsg = 'Tiket Tidak Dikenali';

    if (error?.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMsg = error.response.data;
      } else if (error.response.data.message) {
        errorMsg = error.response.data.message;
      }
    } else if (error?.message) {
      errorMsg = error.message;
    }

    scanResult.value = {
      success: false,
      message: 'Sudah Check-in',
      data: {
        participantName: errorMsg
      }
    };

    playSound(false);

  } finally {
    loading.value = false;

    setTimeout(() => {
      resetScan();
    }, 2500);
  }
};

const resetScan = async () => {
  scanResult.value = null;

  try {
    if (scanner && scannerStarted) {
      await scanner.resume();
    }
  } catch (e) {
    console.error(e);
  }
};

const playSound = (isSuccess: boolean) => {
  const audio = new Audio(
    isSuccess
      ? '/sounds/success.mp3'
      : '/sounds/error.mp3'
  );

  audio.play().catch(() => { });
};
</script>

<style scoped>
#reader {
  border: none !important;
  width: 100%;
  min-height: 250px;
}

:deep(#reader video) {
  width: 100% !important;
  height: 250px !important;
  object-fit: cover;
  border-radius: 12px;
}

:deep(#reader__dashboard) {
  display: none !important;
}

:deep(#reader__status_span) {
  display: none !important;
}

:deep(#reader__scan_region) {
  border: none !important;
  background: #fff;
}
</style>