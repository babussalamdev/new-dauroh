<template>
  <div v-if="show" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" tabindex="-1" role="dialog" aria-modal="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title txt-subtitle fw-bold text-dark">Detail Peserta</h5>
          <button type="button" class="btn-close shadow-none" @click="$emit('close')" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <div v-if="ticket" class="mb-3">
            <h6 class="text-primary txt-body fw-bold mb-1">{{ ticket.Title || ticket.title || ticket.event?.Title }}</h6>
            <span class="text-muted txt-caption">ID: {{ ticket.SK }}</span>
          </div>

          <div class="card bg-light border-0 rounded-3 overflow-hidden" v-if="ticket">
            <table class="table table-sm table-borderless align-middle mb-0">
              <thead class="border-bottom">
                <tr class="text-secondary txt-label fw-bold">
                  <th class="ps-3 py-2">NAMA PESERTA</th>
                  <th class="text-end pe-3">TIKET</th>
                </tr>
              </thead>
              <tbody v-if="Array.isArray(ticket?.participants)">
                <tr v-for="(p, idx) in ticket.participants" :key="idx">
                  <td class="ps-3 py-2">
                    <div class="fw-bold text-dark txt-body">{{ p.Name }}</div>
                    <span class="text-muted txt-caption">{{ p.Gender || 'Umum' }}</span>
                  </td>
                  <td class="text-end pe-3">
                    <button v-if="getSmartStatus(ticket) === 'SUCCESSFUL'" @click="$emit('show-qr', ticket, p)" class="btn btn-sm btn-primary py-1 px-3 rounded-pill txt-caption fw-bold">
                      <i class="bi bi-qr-code me-1"></i> QR
                    </button>
                    <span v-else class="badge bg-secondary opacity-50 txt-caption">Belum Lunas</span>
                  </td>
                </tr>
              </tbody>

              <tbody v-else>
                <tr>
                  <td colspan="2" class="text-center py-4 text-muted txt-caption">
                    <div class="spinner-border spinner-border-sm me-2 text-primary"></div>
                    Memuat detail nama peserta...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="ticket && getSmartStatus(ticket) !== 'SUCCESSFUL'" class="alert alert-warning d-flex align-items-center mt-3 mb-0 p-2 txt-caption fw-bold border-0 rounded-3">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>Selesaikan pembayaran untuk melihat QR Tiket.</div>
          </div>
        </div>

        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-light border w-100 rounded-pill txt-body fw-bold text-muted" @click="$emit('close')">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStatus } from '~/composables/useTransactionStatus';

// MENERIMA DATA DARI HALAMAN UTAMA
defineProps<{ 
  show: boolean, 
  ticket: any 
}>();

// MENGIRIM PERINTAH KE HALAMAN UTAMA
defineEmits(['close', 'show-qr']);

const { getSmartStatus } = useTransactionStatus();
</script>