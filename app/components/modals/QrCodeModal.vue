<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">{{ ticket?.dauroh?.Title || 'E-Tiket' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        
        <div class="modal-body text-center pt-2">
          <p class="text-muted small mb-4">Tunjukkan QR Code ini kepada panitia saat registrasi ulang.</p>

          <div v-for="(person, index) in participantList" :key="index" class="mb-4 pb-3 border-bottom last:border-0">
            
            <div class="qr-container bg-light p-3 d-inline-block rounded mb-3">
              <img 
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeData(person)}`" 
                alt="QR Code" 
                class="img-fluid"
                style="width: 180px; height: 180px;"
              >
            </div>

            <h5 class="fw-bold mb-1">{{ person.name }}</h5>
            <span class="badge bg-primary-subtle text-primary rounded-pill text-capitalize">
              {{ person.gender || 'Peserta' }}
            </span>
            <div class="mt-2 text-muted small font-monospace">
              {{ ticket?.id || 'TRX-NEW' }}-{{ index + 1 }}
            </div>

          </div>
        </div>

        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary w-100" @click="close">Tutup</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  show: boolean;
  ticket: any; // Bisa dari store checkout atau dashboard
}>();

const emit = defineEmits(['close']);

// Helper untuk menormalisasi data peserta (karena struktur dari Dashboard & Checkout beda)
const participantList = computed(() => {
  if (!props.ticket) return [];
  
  // Kasus 1: Dari Dashboard (Ada array 'participants')
  if (props.ticket.participants && Array.isArray(props.ticket.participants)) {
    return props.ticket.participants;
  }
  
  // Kasus 2: Dari Checkout (Ada object 'participant' tunggal)
  if (props.ticket.participant) {
    return [props.ticket.participant];
  }

  return [];
});

// Helper encode data untuk QR
const encodeData = (person: any) => {
  const data = {
    id: props.ticket?.id || 'NEW',
    event: props.ticket?.dauroh?.Title,
    name: person.name,
    email: person.email
  };
  return encodeURIComponent(JSON.stringify(data));
};

const close = () => emit('close');
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
}
.qr-container {
  border: 1px dashed #ccc;
}
/* Helper utility untuk border terakhir */
.last\:border-0:last-child {
  border-bottom: none !important;
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}
</style>