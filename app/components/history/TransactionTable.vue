<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="bg-light">
        <tr>
          <th scope="col" class="ps-4 py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Tanggal & ID</th>
          <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Event Info</th>
          <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Peserta</th>
          <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Status</th>
          <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Total</th>
          <th scope="col" class="pe-4 py-3 text-uppercase text-secondary fs-7 fw-semibold text-center" style="width: 150px;">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ticket, index) in tickets" :key="ticket.SK || index">
          <td class="ps-4 py-3">
            <div class="d-flex flex-column">
              <span class="fw-bold text-dark mb-1">{{ formatDate(ticket.CreatedAt || ticket.created_at || ticket.date) }}</span>
              <span class="badge bg-light text-secondary border rounded-1 fw-normal text-start" style="width: fit-content;">
                {{ ticket.SK }}
              </span>
            </div>
          </td>

          <td class="py-3" style="max-width: 200px;">
            <span class="d-block fw-bold text-primary text-truncate mb-1" :title="ticket.Title || ticket.title || ticket.event?.Title">
              {{ ticket.Title || ticket.title || ticket.event?.Title || 'Event Event' }}
            </span>
            <small class="text-muted d-flex align-items-center text-truncate">
              <i class="bi bi-geo-alt-fill me-1 text-secondary opacity-50"></i>
              {{ ticket.event?.Place || 'Lokasi Online' }}
            </small>
          </td>

          <td class="py-3 text-center">
            <span class="text-dark fs-10">{{ ticket.participants || 0 }} Orang</span>
          </td>

          <td class="py-3 text-center">
            <div class="d-flex flex-column align-items-center gap-1">
              <template v-if="getSmartStatus(ticket) === 'SUCCESSFUL'">
                <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1 small-7">
                  <i class="bi bi-check-circle-fill me-1"></i>Lunas
                </span>
              </template>

              <template v-else-if="['CANCELLED', 'EXPIRED', 'FAILED'].includes(getSmartStatus(ticket))">
                <span class="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 small-7">
                  <i class="bi bi-x-circle-fill me-1"></i>Kadaluarsa
                </span>
              </template>

              <template v-else-if="getSmartStatus(ticket) === 'PENDING'">
                <span class="badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 small-7 mb-1">
                  <i class="bi bi-hourglass-split me-1"></i>Menunggu
                </span>
                <span class="text-muted fw-light" style="font-size: 0.65rem;">
                  Hingga: {{ formatTime(ticket.Expired_Date || ticket.expired_date) }}
                </span>
              </template>
            </div>
          </td>

          <td class="py-3 text-center">
            <span class="fw-bold text-dark fs-6">{{ formatCurrency(ticket.amount) }}</span>
          </td>

          <td class="pe-4 py-3 text-center">
            <div class="d-flex flex-column gap-2 mx-auto" style="max-width: 120px;">
              <button @click="$emit('open-detail', ticket)" class="btn btn-xs btn-outline-secondary border shadow-sm py-1 px-2 d-flex align-items-center justify-content-center gap-1" style="font-size: 0.75rem;">
                <i class="bi bi-eye"></i> Detail
              </button>

              <button v-if="['EXPIRED', 'CANCELLED', 'FAILED'].includes(getSmartStatus(ticket))" class="btn btn-xs btn-danger text-white py-1 px-2 d-flex align-items-center justify-content-center gap-1 shadow-sm" style="font-size: 0.75rem;" @click="$emit('resume-payment', ticket)">
                <i class="bi bi-arrow-clockwise"></i> Re-Pay
              </button>

              <button v-else-if="getSmartStatus(ticket) === 'PENDING'" class="btn btn-xs btn-primary text-white py-1 px-2 d-flex align-items-center justify-content-center gap-1 shadow-sm" style="font-size: 0.75rem;" @click="$emit('resume-payment', ticket)">
                <i class="bi bi-credit-card"></i> Bayar
              </button>

              <span v-else-if="getSmartStatus(ticket) === 'SUCCESSFUL'" class="text-success fw-bold p-1" style="font-size: 0.7rem;">
                <i class="bi bi-patch-check"></i> SUCCESS
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import dayjs from 'dayjs';

// MENERIMA DATA DARI HALAMAN UTAMA
defineProps<{ tickets: any[] }>();

// MENGIRIM PERINTAH KE HALAMAN UTAMA
defineEmits(['open-detail', 'resume-payment']);

const { getSmartStatus } = useTransactionStatus();

const formatTime = (dateString: string) => {
  if (!dateString || dateString === '-') return '-';
  return dayjs(dateString.replace(' ', 'T')).format('DD MMM • HH:mm');
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return dayjs(dateString).format('D MMM YYYY');
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>

<style scoped>
.table thead th {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #eee;
}
.table tbody td {
  font-size: 0.9rem;
  border-bottom: 1px solid #f8f9fa;
}
.table-hover tbody tr:hover {
  background-color: #fcfcfc;
}
.fs-7 {
  font-size: 0.75rem !important;
}
.x-small {
  font-size: 0.75rem;
}
</style>