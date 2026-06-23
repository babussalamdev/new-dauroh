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
            <h6 class="text-primary txt-body fw-bold mb-1 text-capitalize">{{ ticket.Title }}</h6>
            <div v-if="ticket.GroupLink && getSmartStatus(ticket) === 'SUCCESSFUL'" class="mt-2 d-flex align-items-center justify-content-between bg-success bg-opacity-10 rounded-3 p-2 border border-success border-opacity-25">
              <span class="txt-caption text-success-emphasis fw-medium mb-0 me-2" style="font-size: 0.75rem; line-height: 1.2;">
                Silakan gabung grup untuk info lebih lanjut.
              </span>
              <a :href="ticket.GroupLink" target="_blank" class="btn btn-sm btn-success rounded-pill px-3 py-1 txt-caption fw-bold shadow-sm flex-shrink-0">
                <i class="bi bi-whatsapp"></i> Join
              </a>
            </div>
          </div>

          <div class="card bg-light border-0 rounded-3 overflow-hidden" v-if="ticket">
            <table class="table table-sm table-borderless align-middle mb-0">
              <thead class="border-bottom">
                <tr class="text-secondary txt-label fw-bold">
                  <th class="ps-3 py-2">NAMA PESERTA</th>
                  <th class="text-center py-2">SERTIFIKAT</th>
                  <th class="text-center pe-3">TIKET</th>
                </tr>
              </thead>
              <tbody v-if="Array.isArray(ticket?.participants) ? true : Array.isArray(ticket?.Participant) ? true : false">
                <tr v-for="(p, idx) in (Array.isArray(ticket?.participants) ? ticket?.participants : ticket?.Participant)" :key="idx">
                  <td class="ps-3 py-2 align-middle">
                    <div class="fw-bold text-dark txt-body text-capitalize">{{ p.Name }}</div>
                    <span class="text-muted txt-caption text-capitalize">{{ p.Gender || 'Umum' }} - {{ p.Age }} Tahun </span>
                  </td>

                  <td class="text-center py-2 align-middle">
                    <ButtonCertificateButton 
                    v-if="canDownloadCert(p, ticket)"
                    :pk="ticket.SK" 
                    :sk="p.SK"
                    :esk="ticket.SK ? ticket.SK.split('#')[0] : ''"
                    />
                    <span v-else class="text-muted txt-caption">-</span>
                  </td>
                
                <td class="text-center pe-3 align-middle">
                  <button 
                  v-if="getSmartStatus(ticket) === 'SUCCESSFUL'" 
                  @click="$emit('show-qr', ticket, p)" 
                  class="btn btn-sm btn-primary py-1 px-3 rounded-pill txt-caption fw-bold"
                  >
                  <i class="bi bi-qr-code me-1"></i> QR
                </button>
                <span v-else class="badge bg-secondary opacity-50 txt-caption">Belum Lunas</span>
              </td>

            </tr>
              </tbody>

              <tbody v-else>
                <tr>
                  <td colspan="3" class="text-center py-4 text-muted txt-caption">
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

const canDownloadCert = (participant: any, ticket: any) => {
  const isPaid = getSmartStatus(ticket) === 'SUCCESSFUL';
  const isPresent = !!participant.CheckIn; // Memastikan CheckIn tidak kosong
  const isEligible = participant.Certificate_Eligible === 'true';
  
  return isPaid && isPresent && isEligible;
};

// MENGIRIM PERINTAH KE HALAMAN UTAMA
defineEmits(['close', 'show-qr', 'download-cert']);

const { getSmartStatus } = useTransactionStatus();
</script>