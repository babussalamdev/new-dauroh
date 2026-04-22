<template>
  <div>
    <div class="modal-backdrop fade show" style="background-color: rgba(0,0,0,0.5);"></div>
    
    <div class="modal fade show d-block" tabindex="-1" @click.self="$emit('close')">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div class="modal-header bg-light border-bottom-0 p-3 px-4">
            <div>
              <h6 class="modal-title txt-subtitle fw-bold text-dark mb-0">Detail Transaksi</h6>
              <span class="font-monospace text-muted txt-caption text-truncate d-inline-block" style="max-width: 250px;">
                {{ transaction.PK || 'Tidak Ada Invoice' }}
              </span>
            </div>
            <button type="button" class="btn-close shadow-none" @click="$emit('close')"></button>
          </div>

          <div class="modal-body p-4">
            
            <div class="text-center mb-4">
              <span v-if="(transaction.status || 'LUNAS') === 'LUNAS'" class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill txt-caption fw-bold"><i class="bi bi-check-circle-fill me-2"></i>PEMBAYARAN BERHASIL</span>
              <span v-else-if="transaction.status === 'PENDING'" class="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-2 rounded-pill txt-caption fw-bold"><i class="bi bi-clock-fill text-warning me-2"></i>MENUNGGU PEMBAYARAN</span>
              <span v-else class="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2 rounded-pill txt-caption fw-bold"><i class="bi bi-x-circle-fill me-2"></i>TRANSAKSI EXPIRED</span>
            </div>

            <div class="bg-light p-3 rounded-3 mb-4 border">
              <div class="row g-2">
                <div class="col-4 text-muted txt-caption">Informasi Pembeli</div>
                <div class="col-8 fw-bold text-end text-dark txt-body text-truncate">{{ transaction.SK || '-' }}</div>
                
                <div class="col-4 text-muted txt-caption">Event</div>
                <div class="col-8 fw-bold text-end text-dark txt-body text-capitalize">{{ transaction.Title || '-' }}</div>
              </div>
            </div>

            <h6 class="fw-bold mb-3 txt-label text-dark">RINCIAN PEMBAYARAN</h6>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted txt-caption">Tiket Event ({{ transaction.totalTicketsBought || 0 }}x @{{ formatRupiah(transaction.ticketPrice || 0) }})</span>
              <span class="fw-bold text-dark txt-body">{{ formatRupiah((transaction.totalTicketsBought || 0) * (transaction.ticketPrice || 0)) }}</span>
            </div>
            
            <div class="d-flex justify-content-between mb-3" v-if="transaction.infaq > 0">
              <span class="text-muted txt-caption">Infaq / Donasi</span>
              <span class="fw-bold text-info txt-body">+ {{ formatRupiah(transaction.infaq) }}</span>
            </div>
            
            <hr class="border-secondary border-opacity-10 my-3">
            
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fw-bold text-dark txt-body">Total Bayar</span>
              <span class="fw-bold text-success txt-title">
                {{ formatRupiah(((transaction.totalTicketsBought || 0) * (transaction.ticketPrice || 0)) + (transaction.infaq || 0)) }}
              </span>
            </div>

            <div class="bg-light px-3 py-2 rounded-3 border text-center text-muted txt-caption">
              Dibayar menggunakan <strong class="text-dark fw-bold text-uppercase">{{ transaction.Sender_Bank || '-' }} {{ transaction.Sender_Bank_Type ? transaction.Sender_Bank_Type.replace('_', ' ') : '' }}</strong>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  transaction: any;
}>();

defineEmits(['close']);

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
};
</script>

<style scoped>
.modal.fade.show {
  transition: opacity 0.15s linear;
}
</style>