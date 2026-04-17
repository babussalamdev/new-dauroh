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
      <div class="card-body p-3">
        <div class="row g-2 align-items-end">
          
          <div class="col-12 col-md-4 col-lg-4">
            <label class="fw-bold text-muted mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">CARI TRANSAKSI</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control form-control-sm bg-light border-start-0 ps-0" placeholder="No. Invoice / Nama..." v-model="searchQuery">
            </div>
          </div>
          
          <div class="col-12 col-md-3 col-lg-3">
            <label class="fw-bold text-muted mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">PILIH EVENT</label>
            <select class="form-select form-select-sm bg-light" v-model="filterEvent">
              <option value="ALL">Semua Event</option>
              <option v-for="event in mockEvents" :key="event.SK" :value="event.SK">{{ event.Title }}</option>
            </select>
          </div>
          
          <div class="col-8 col-md-3 col-lg-3">
            <label class="fw-bold text-muted mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">STATUS</label>
            <select class="form-select form-select-sm bg-light" v-model="filterStatus">
              <option value="ALL">Semua</option>
              <option value="LUNAS">Lunas</option>
              <option value="PENDING">Pending</option>
              <option value="EXPIRED">Expired/Gagal</option>
            </select>
          </div>
          
          <div class="col-4 col-md-2 col-lg-2">
            <button class="btn btn-outline-secondary btn-sm w-100 fw-bold" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
          
        </div>
      </div>
    </div>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.95rem;"><i class="bi bi-receipt text-primary me-2"></i>Riwayat Transaksi</h6>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill shadow-sm" style="font-size: 0.75rem;">
          Menampilkan {{ filteredTransactions.length }} Data
        </span>
      </div>

      <div class="card-body p-0">
        <CommonLoadingSpinner v-if="isLoading" class="my-5" />

        <div class="table-responsive" v-else>
          <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem; min-width: 900px;">
            <thead class="table-light text-muted" style="font-size: 0.75rem;">
              <tr>
                <th class="py-3 ps-4 text-nowrap">INVOICE & TANGGAL</th>
                <th class="py-3 text-nowrap">INFORMASI PEMBELI</th>
                <th class="py-3 text-nowrap">NOMINAL TRANSAKSI</th>
                <th class="py-3 text-nowrap">METODE BAYAR</th>
                <th class="py-3 text-center text-nowrap">STATUS</th>
                <th class="py-3 text-center pe-4 text-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in filteredTransactions" :key="tx.invoice">
                <td class="ps-4">
                  <div class="fw-bold font-monospace text-dark">{{ tx.invoice }}</div>
                  <div class="text-muted mt-1" style="font-size: 0.75rem;"><i class="bi bi-calendar2-event me-1"></i>{{ dayjs(tx.date).format('DD MMM YYYY, HH:mm') }} WIB</div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ tx.buyerName }}</div>
                  <div class="text-muted text-truncate mt-1" style="max-width: 250px; font-size: 0.75rem;">{{ tx.eventName }}</div>
                </td>
                <td>
                  <div class="fw-bold text-success" style="font-size: 0.9rem;">{{ formatRupiah(tx.totalAmount) }}</div>
                  <div class="text-muted mt-1" style="font-size: 0.75rem;">{{ tx.qty }} Tiket Event</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border fw-medium px-2 py-1" style="font-size: 0.7rem;"><i class="bi bi-bank me-1 text-muted"></i>{{ tx.paymentMethod }}</span>
                </td>
                <td class="text-center">
                  <span v-if="tx.status === 'LUNAS'" class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill" style="font-size: 0.7rem;"><i class="bi bi-check-circle-fill me-1"></i> LUNAS</span>
                  <span v-else-if="tx.status === 'PENDING'" class="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2 py-1 rounded-pill" style="font-size: 0.7rem;"><i class="bi bi-clock-fill text-warning me-1"></i> PENDING</span>
                  <span v-else class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill" style="font-size: 0.7rem;"><i class="bi bi-x-circle-fill me-1"></i> EXPIRED</span>
                </td>
                <td class="text-center pe-4">
                  <button class="btn btn-outline-primary btn-sm rounded-pill fw-bold px-3 shadow-sm" style="font-size: 0.75rem;" @click="openDetail(tx)">
                     Detail
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

    <AdminFinanceTransactionDetailModal 
      v-if="selectedTx" 
      :transaction="selectedTx" 
      @close="closeDetail" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';

definePageMeta({ layout: 'admin' });

const isLoading = ref(false);

const searchQuery = ref('');
const filterEvent = ref('ALL');
const filterStatus = ref('ALL');

const selectedTx = ref<any>(null);

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

const openDetail = (tx: any) => {
  selectedTx.value = tx;
  document.body.style.overflow = 'hidden'; 
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

/* Header tabel biar teksnya ga patah */
.text-nowrap { white-space: nowrap; }

/* Modal transition pura-pura */
.modal.fade.show {
  transition: opacity 0.15s linear;
}
</style>