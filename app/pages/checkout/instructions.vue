<template>
  <div>
    <div class="card shadow-sm">
      <div class="card-body p-4 text-center">

        <img 
          v-if="paymentLogoUrl" 
          :src="paymentLogoUrl || ''" 
          :alt="store.paymentMethod || 'Logo Pembayaran'" 
          class="payment-logo-summary mb-3"
        >
        
        <p class="text-muted">Jumlah yang harus dibayar</p>
        <h2 class="fw-bold mb-3">{{ formatCurrency(store.transactionDetails?.amount || 0) }}</h2>

        <div class="countdown-timer mb-4">
          <i class="bi bi-clock"></i>
          Selesaikan pembayaran dalam: <strong>{{ countdown }}</strong>
        </div>

        <ul class="nav nav-tabs justify-content-center mb-3" id="paymentTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="mobile-tab" data-bs-toggle="tab" data-bs-target="#mobile-pane" type="button" role="tab" aria-controls="mobile-pane" aria-selected="true">Mobile</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="atm-tab" data-bs-toggle="tab" data-bs-target="#atm-pane" type="button" role="tab" aria-controls="atm-pane" aria-selected="false">ATM</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="net-tab" data-bs-toggle="tab" data-bs-target="#net-pane" type="button" role="tab" aria-controls="net-pane" aria-selected="false">BSI Net</button>
          </li>
        </ul>

        <div class="tab-content text-start p-3 border rounded" id="paymentTabContent">
          <div class="tab-pane fade show active" id="mobile-pane" role="tabpanel" aria-labelledby="mobile-tab" tabindex="0">
            <h6>Nomor Virtual Account (No Bayar):</h6>
            <div class="alert alert-light fw-bold fs-5 text-center">
              {{ store.transactionDetails?.vaNumber || 'XXXX-XXXX-XXXX' }}
            </div>
            
            <ol class="list-group list-group-numbered list-group-flush fs-sm">
              <li class="list-group-item">Buka Aplikasi BSI Mobile.</li>
              <li class="list-group-item">Pilih Menu <strong>Pembayaran</strong>.</li>
              <li class="list-group-item">Pilih menu <strong>E-commerce</strong>.</li>
              <li class="list-group-item">Pilih merchant <strong>"DOKU"</strong> (atau nama merchant Anda).</li>
              <li class="list-group-item">Pilih Nomor Rekening.</li>
              <li class="list-group-item">Masukkan No Bayar: <strong>{{ store.transactionDetails?.vaNumber }}</strong> (No Bayar adalah Nomor VA TANPA 4 digit pertama).</li>
              <li class="list-group-item">Masukkan PIN BSI Mobile.</li>
              <li class="list-group-item">Transaksi selesai.</li>
            </ol>
          </div>
          <div class="tab-pane fade" id="atm-pane" role="tabpanel" aria-labelledby="atm-tab" tabindex="0">
            <p class="text-muted p-3 text-center">Instruksi pembayaran via ATM akan muncul di sini.</p>
          </div>
          <div class="tab-pane fade" id="net-pane" role="tabpanel" aria-labelledby="net-tab" tabindex="0">
            <p class="text-muted p-3 text-center">Instruksi pembayaran via BSI Net akan muncul di sini.</p>
          </div>
        </div>

        <div class="d-grid mt-4">
          <button class="btn btn-primary" @click="handleDone">
            Saya Sudah Bayar
          </button>
        </div>
      </div>
    </div>

    <a href="httpsa://wa.me/628123456789" target="_blank" class="btn whatsapp-fab">
      <i class="bi bi-whatsapp me-1"></i> Whatsapp
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'checkout',
});
useHead({ title: 'Instruksi Pembayaran' });

const store = useCheckoutStore();
const router = useRouter(); // <-- 3. Pastikan useRouter di-instance
const countdown = ref('23:59:59');
let timerInterval: NodeJS.Timeout | null = null;

// Guard: Pastikan user datang dari halaman summary
onMounted(() => {
  if (!store.transactionDetails) {
    router.replace('/checkout/summary');
    return;
  }
  startTimer(store.transactionDetails.expiryTime);
});

// Hentikan timer saat komponen dihancurkan
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

// Helper untuk menampilkan logo bank
const paymentLogoUrl = computed(() => {
  const logos: { [key: string]: string } = {
    'BSI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bank_Syariah_Indonesia.svg/1280px-Bank_Syariah_Indonesia.svg.png',
    'QRIS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png',
  };
  return store.paymentMethod ? logos[store.paymentMethod] : null;
});

// Format mata uang
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

// Fungsi Countdown Timer
const startTimer = (expiryTime: number) => {
  timerInterval = setInterval(() => {
    const now = Date.now();
    const distance = expiryTime - now;

    if (distance < 0) {
      clearInterval(timerInterval!);
      countdown.value = "Waktu Habis";
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.value = 
      String(hours).padStart(2, '0') + ":" + 
      String(minutes).padStart(2, '0') + ":" + 
      String(seconds).padStart(2, '0');
  }, 1000);
};

// Fungsi klik "Saya Sudah Bayar"
const handleDone = () => {
  store.clearCheckout();
  router.push('/dashboard');
};

// --- 4. TAMBAHKAN LOGIC BARU INI ---
onBeforeRouteLeave((to, from, next) => {
  // Jika user mengklik "Saya Sudah Bayar" (tujuannya ke '/dashboard')
  // biarkan dia pergi.
  if (to.path === '/dashboard') {
    next(); // Lanjutkan navigasi
    return;
  }

  // Jika user mencoba pergi ke tempat LAIN (misal klik "Back" di browser)
  // Tampilkan modal kustom
  Swal.fire({
    title: 'Anda yakin ingin membatalkan pembayaran?',
    text: "Instruksi pembayaran ini akan hangus jika Anda keluar.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Tetap di Sini' // Ganti jadi "Tetap di Sini"
  }).then((result) => {
    if (result.isConfirmed) {
      // Jika user klik "Ya, Batalkan"
      store.clearCheckout(); // Bersihkan data checkout
      next(); // Izinkan user pergi
    } else {
      // Jika user klik "Tetap di Sini" (atau menutup modal)
      next(false); // Batalkan navigasi, user tetap di halaman ini
    }
  });
});

</script>

<style scoped>
.payment-logo-summary {
  max-height: 50px;
  max-width: 150px;
  object-fit: contain;
}
.countdown-timer {
  font-size: 1.1rem;
  color: var(--bs-danger);
}
.fs-sm {
  font-size: 0.9rem;
}
.nav-tabs .nav-link {
  color: var(--color-primary);
}
.nav-tabs .nav-link.active {
  color: var(--bs-body-color);
  font-weight: bold;
}
</style>