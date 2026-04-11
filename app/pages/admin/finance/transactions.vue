<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item text-muted">Keuangan</li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Data Transaksi</li>
      </ol>
    </nav>

    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3">
          <div class="col-12 col-md-4 col-lg-3">
            <label class="small fw-bold text-muted mb-1">Cari Transaksi</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control bg-light border-start-0 ps-0" placeholder="No. Invoice / Nama..." v-model="searchQuery">
            </div>
          </div>
          <div class="col-12 col-md-4 col-lg-3">
            <label class="small fw-bold text-muted mb-1">Pilih Event</label>
            <select class="form-select form-select-sm bg-light" v-model="filterEvent">
              <option value="ALL">Semua Event</option>
              <option v-for="event in mockEvents" :key="event.SK" :value="event.SK">{{ event.Title }}</option>
            </select>
          </div>
          <div class="col-6 col-md-2 col-lg-3">
            <label class="small fw-bold text-muted mb-1">Status</label>
            <select class="form-select form-select-sm bg-light" v-model="filterStatus">
              <option value="ALL">Semua</option>
              <option value="LUNAS">Lunas</option>
              <option value="PENDING">Pending</option>
              <option value="EXPIRED">Expired/Gagal</option>
            </select>
          </div>
          <div class="col-6 col-md-2 col-lg-3 d-flex align-items-end">
             <button class="btn btn-outline-secondary btn-sm w-100 fw-bold" @click="resetFilters">
               <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
             </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold"><i class="bi bi-receipt text-primary me-2"></i>Riwayat Transaksi</h6>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill shadow-sm">
          Menampilkan {{ filteredTransactions.length }} Data
        </span>
      </div>

      <div class="card-body p-0">
        
        <CommonLoadingSpinner v-if="isLoading" class="my-5" />

        <div class="table-responsive" v-else>
          <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem; min-width: 900px;">
            <thead class="table-light text-muted">
              <tr>
                <th class="py-3 ps-4">INVOICE & TANGGAL</th>
                <th class="py-3">INFORMASI PEMBELI</th>
                <th class="py-3">NOMINAL TRANSAKSI</th>
                <th class="py-3">METODE BAYAR</th>
                <th class="py-3 text-center">STATUS</th>
                <th class="py-3 text-center pe-4">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in filteredTransactions" :key="tx.invoice">
                <td class="ps-4">
                  <div class="fw-bold font-monospace text-dark">{{ tx.invoice }}</div>
                  <div class="small text-muted"><i class="bi bi-calendar2-event me-1"></i>{{ dayjs(tx.date).format('DD MMM YYYY, HH:mm') }} WIB</div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ tx.buyerName }}</div>
                  <div class="small text-muted text-truncate" style="max-width: 200px;">{{ tx.eventName }}</div>
                </td>
                <td>
                  <div class="fw-bold text-success">{{ formatRupiah(tx.totalAmount) }}</div>
                  <div class="small text-muted">{{ tx.qty }} Tiket</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border"><i class="bi bi-bank me-1 text-muted"></i>{{ tx.paymentMethod }}</span>
                </td>
                <td class="text-center">
                  <span v-if="tx.status === 'LUNAS'" class="badge bg-success px-3 py-1 rounded-pill"><i class="bi bi-check-circle me-1"></i> LUNAS</span>
                  <span v-else-if="tx.status === 'PENDING'" class="badge bg-warning text-dark px-3 py-1 rounded-pill"><i class="bi bi-clock-history me-1"></i> PENDING</span>
                  <span v-else class="badge bg-danger px-3 py-1 rounded-pill"><i class="bi bi-x-circle me-1"></i> EXPIRED</span>
                </td>
                <td class="text-center pe-4">
                  <button class="btn btn-outline-primary btn-sm rounded-pill fw-bold px-3" @click="openDetail(tx)">
                    <i></i> Detail
                  </button>
                </td>
              </tr>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-2 opacity-50 mb-2 d-block"></i>
                  Data transaksi tidak ditemukan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="selectedTx" class="modal-backdrop fade show" style="background-color: rgba(0,0,0,0.5);"></div>
    <div v-if="selectedTx" class="modal fade show d-block" tabindex="-1" @click.self="closeDetail">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div class="modal-header bg-light border-bottom-0 p-4">
            <div>
              <h5 class="modal-title fw-bold text-dark mb-1">Detail Transaksi</h5>
              <span class="font-monospace text-muted small">{{ selectedTx.invoice }}</span>
            </div>
            <button type="button" class="btn-close shadow-none" @click="closeDetail"></button>
          </div>

          <div class="modal-body p-4">
            <div class="text-center mb-4">
              <span v-if="selectedTx.status === 'LUNAS'" class="badge bg-success px-4 py-2 rounded-pill fs-6"><i class="bi bi-check-circle me-2"></i>PEMBAYARAN BERHASIL</span>
              <span v-else-if="selectedTx.status === 'PENDING'" class="badge bg-warning text-dark px-4 py-2 rounded-pill fs-6"><i class="bi bi-clock-history me-2"></i>MENUNGGU PEMBAYARAN</span>
              <span v-else class="badge bg-danger px-4 py-2 rounded-pill fs-6"><i class="bi bi-x-circle me-2"></i>TRANSAKSI EXPIRED</span>
            </div>

            <div class="bg-light p-3 rounded-3 mb-3 border">
              <div class="row">
                <div class="col-5 text-muted small">Nama Pembeli</div>
                <div class="col-7 fw-bold text-end">{{ selectedTx.buyerName }}</div>
                <div class="col-5 text-muted small mt-2">No. WhatsApp</div>
                <div class="col-7 fw-bold text-end mt-2">{{ selectedTx.contactWa || '-' }}</div>
                <div class="col-5 text-muted small mt-2">Event</div>
                <div class="col-7 fw-bold text-end mt-2">{{ selectedTx.eventName }}</div>
              </div>
            </div>

            <h6 class="fw-bold mb-3 mt-4">Rincian Pembayaran</h6>
            <div class="d-flex justify-content-between mb-2 small">
              <span class="text-muted">Tiket Event ({{ selectedTx.qty }}x @{{ formatRupiah(selectedTx.ticketPrice) }})</span>
              <span class="fw-medium">{{ formatRupiah(selectedTx.qty * selectedTx.ticketPrice) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 small" v-if="selectedTx.infaq > 0">
              <span class="text-muted">Infaq / Donasi</span>
              <span class="fw-medium text-info">+ {{ formatRupiah(selectedTx.infaq) }}</span>
            </div>
            
            <hr class="border-secondary border-opacity-25">
            
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fw-bold">Total Bayar</span>
              <span class="fw-bold text-success fs-5">{{ formatRupiah(selectedTx.totalAmount) }}</span>
            </div>

            <div class="bg-light px-3 py-2 rounded border text-center small text-muted">
              Dibayar menggunakan <strong>{{ selectedTx.paymentMethod }}</strong>
            </div>
          </div>
          
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';

definePageMeta({ layout: 'admin' });

const isLoading = ref(false);

// FILTER STATE
const searchQuery = ref('');
const filterEvent = ref('ALL');
const filterStatus = ref('ALL');

// MODAL STATE
const selectedTx = ref<any>(null);

// MOCK DATA EVENT & TRANSACTIONS
const mockEvents = ref([
  { SK: 'EVT#001', Title: 'Dauroh: Menggapai Kebahagiaan' },
  { SK: 'EVT#002', Title: 'Kajian Rutin Pemuda Hijrah' },
]);

const transactions = ref<any[]>([]);

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const fetchTransactions = () => {
  isLoading.value = true;
  setTimeout(() => {
    // 🟢 Kasus Si Budi: Beli 4 tiket + infaq
    transactions.value = [
      { 
        invoice: 'INV-260411-001', date: '2026-04-11T08:15:00', 
        buyerName: 'Budi Santoso', contactWa: '081234567890', 
        eventSK: 'EVT#001', eventName: 'Dauroh: Menggapai Kebahagiaan', 
        qty: 4, ticketPrice: 50000, infaq: 20000, totalAmount: 220000, 
        paymentMethod: 'BSI Virtual Account', status: 'LUNAS' 
      },
      { 
        invoice: 'INV-260411-002', date: '2026-04-10T14:30:00', 
        buyerName: 'Abdullah Bin Fulan', contactWa: '085712345678', 
        eventSK: 'EVT#001', eventName: 'Dauroh: Menggapai Kebahagiaan', 
        qty: 1, ticketPrice: 50000, infaq: 0, totalAmount: 50000, 
        paymentMethod: 'QRIS', status: 'LUNAS' 
      },
      { 
        invoice: 'INV-260411-003', date: '2026-04-11T09:00:00', 
        buyerName: 'Ahmad Wijaya', contactWa: '089611223344', 
        eventSK: 'EVT#002', eventName: 'Kajian Rutin Pemuda Hijrah', 
        qty: 2, ticketPrice: 50000, infaq: 50000, totalAmount: 150000, 
        paymentMethod: 'Mandiri VA', status: 'PENDING' 
      },
    ];
    isLoading.value = false;
  }, 600);
};

// LOGIKA FILTER
const filteredTransactions = computed(() => {
  return transactions.value.filter(tx => {
    const matchSearch = tx.invoice.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        tx.buyerName.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchEvent = filterEvent.value === 'ALL' || tx.eventSK === filterEvent.value;
    const matchStatus = filterStatus.value === 'ALL' || tx.status === filterStatus.value;
    return matchSearch && matchEvent && matchStatus;
  });
});

const resetFilters = () => {
  searchQuery.value = '';
  filterEvent.value = 'ALL';
  filterStatus.value = 'ALL';
};

// MODAL LOGIC
const openDetail = (tx: any) => {
  selectedTx.value = tx;
  document.body.style.overflow = 'hidden'; // Biar background ga bisa di-scroll
};

const closeDetail = () => {
  selectedTx.value = null;
  document.body.style.overflow = 'auto';
};

onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
.table> :not(caption)>*>* { border-bottom-width: 1px; }

/* Modal transition pura-pura */
.modal.fade.show {
  transition: opacity 0.15s linear;
}
</style>