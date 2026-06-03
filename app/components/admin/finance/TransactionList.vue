<template>
  <div>
    <div class="card content-card border-0 shadow-sm rounded-4 mb-4 bg-white" v-if="globalStore.activeEventSK">
      <div class="card-body p-3 px-md-4">
        <div class="row g-3 align-items-end">
          
          <div class="col-12 col-md-5 col-lg-5">
            <label class="fw-bold text-muted mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">CARI TRANSAKSI</label>
            <div class="input-group input-group-sm shadow-sm">
              <span class="input-group-text bg-light border-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control form-control-sm bg-light border-0 ps-0 txt-body" placeholder="No. Invoice / Email Pembeli..." v-model="searchQuery">
            </div>
          </div>
          
          <div class="col-8 col-md-4 col-lg-4">
            <label class="fw-bold text-muted mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">STATUS</label>
            <select class="form-select form-select-sm bg-light border-0 shadow-sm txt-body" v-model="filterStatus">
              <option value="ALL">Semua Status</option>
              <option value="SUCCESSFUL">Sukses (Lunas)</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Batal / Expired</option>
            </select>
          </div>
          
          <div class="col-4 col-md-3 col-lg-3">
            <button class="btn btn-light border btn-sm w-100 shadow-sm txt-body fw-medium" @click="resetFilters">
              Reset
            </button>
          </div>
          
        </div>
      </div>
    </div>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div class="d-flex align-items-center flex-grow-1" style="min-width: 0;">
          <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
            <h6 class="mb-0 fw-bold txt-subtitle text-dark text-truncate w-100">Riwayat Transaksi</h6>
            
            <div v-if="globalStore.activeEventSK" class="text-primary fw-medium txt-caption text-truncate w-100">
              {{ globalStore.activeEvent?.Title }}
            </div>
            <div v-else class="text-muted txt-caption text-truncate w-100">
              Belum Ada Event Terpilih
            </div>
          </div>
        </div>

        <div class="d-flex flex-shrink-0" v-if="globalStore.activeEventSK">
          <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill shadow-sm txt-caption fw-medium">
            Total: {{ filteredTransactions.length }} Data
          </span>
        </div>
      </div>

      <div class="card-body p-0">
        
        <div v-if="!globalStore.activeEventSK" class="text-center py-5 text-muted bg-light px-3 rounded-bottom-4">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
          <p class="mb-0 fw-medium txt-body">Silakan pilih <strong>Event</strong> terlebih dahulu di halaman Dashboard.</p>
          <NuxtLink to="/admin" class="btn btn-sm btn-primary mt-3 rounded-pill px-4 shadow-sm txt-caption">Ke Dashboard</NuxtLink>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="isLoading" class="my-5" />

          <div class="table-responsive" v-else>
            <table class="table table-hover mb-0" style="min-width: 1000px;">
              <thead>
                <tr>
                  <th class="ps-4 text-nowrap txt-label">INVOICE & TANGGAL</th>
                  <th class="text-nowrap txt-label">INFORMASI PEMBELI</th>
                  <th class="text-nowrap txt-label">TOTAL TIKET</th>
                  <th class="text-nowrap txt-label">INFAQ</th>
                  <th class="text-nowrap txt-label">METODE BAYAR</th>
                  <th class="text-center pe-4 text-nowrap txt-label">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in filteredTransactions" :key="tx.PK">
                  <td class="ps-4">
                    <div class="fw-bold font-monospace text-dark txt-body">{{ tx.invoice || tx.PK }}</div>
                    <div class="text-muted mt-1 txt-caption">{{ dayjs(tx.date || new Date()).format('DD MMM YYYY, HH:mm') }} WIB</div>
                  </td>
                  <td>
                    <div class="fw-bold text-dark txt-body">{{ tx.buyerName || tx.SK }}</div>
                    <div class="text-muted text-truncate mt-1 txt-caption text-capitalize" style="max-width: 250px;">{{ tx.eventName || tx.Title }}</div>
                  </td>
                  <td>
                   <div class="fw-bold text-success txt-body">{{ formatRupiah(tx.ticketPrice || 0) }}</div>
                    <div class="text-muted mt-1 txt-caption">{{ tx.totalTicketsBought || tx.qty || 0 }} Tiket Event</div>
                  </td>
                  <td>
                    <div class="fw-bold text-info txt-body">{{ formatRupiah(tx.infaq || 0) }}</div>
                  </td>
                  <td>
                    <div class="badge bg-light text-dark border fw-medium px-2 py-1 txt-caption text-uppercase">
                      {{ tx.paymentMethod || tx.Sender_Bank }} {{ tx.Sender_Bank_Type ? tx.Sender_Bank_Type.replace('_', ' ') : '' }}
                    </div>
                  </td>
                  <td class="text-center pe-4">
                    <span v-if="tx.Status === 'SUCCESSFUL'" class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill shadow-sm txt-caption">SUCCESSFUL</span>
                    <span v-else-if="tx.Status === 'PENDING'" class="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-1 rounded-pill shadow-sm txt-caption">PENDING</span>
                    <span v-else-if="tx.Status === 'CANCELLED'" class="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-1 rounded-pill shadow-sm txt-caption">CANCELLED</span>
                    <span v-else class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-3 py-1 rounded-pill shadow-sm txt-caption">{{ tx.Status || 'UNKNOWN' }}</span>
                  </td>
                </tr>
                
                <tr v-if="filteredTransactions.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted txt-body fst-italic">
                    <i class="bi bi-receipt fs-3 opacity-50 mb-2 d-block"></i>
                    Tidak ada transaksi yang sesuai dengan pencarian.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { useGlobalEventStore } from '~/stores/globalEvent';

useHead({
  title: 'Riwayat Transaksi'
});

const globalStore = useGlobalEventStore();

const props = defineProps<{
  isLoading: boolean;
  transactions: any[];
}>();

const searchQuery = ref('');
const filterStatus = ref('ALL');

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
};

const filteredTransactions = computed(() => {
  if (!props.transactions) return [];
  
  return props.transactions.filter(tx => {
    const invoice = tx.invoice || tx.PK || '';
    const name = tx.buyerName || tx.SK || '';
    const status = tx.Status || tx.status || ''; 

    const matchSearch = invoice.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        name.toLowerCase().includes(searchQuery.value.toLowerCase());
                        
    const matchStatus = filterStatus.value === 'ALL' || status === filterStatus.value;
    
    return matchSearch && matchStatus;
  });
});

const resetFilters = () => {
  searchQuery.value = '';
  filterStatus.value = 'ALL';
};

</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

.text-nowrap { white-space: nowrap; }
</style>