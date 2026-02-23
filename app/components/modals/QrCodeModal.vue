<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4">
        <div class="modal-header bg-light border-0 py-3 px-4">
          <div>
            <h5 class="modal-title fw-bold text-dark mb-0">
              <i class="bi bi-qr-code-scan me-2 text-primary"></i>E-Ticket Peserta
            </h5>
            <small class="text-muted text-truncate d-block" style="max-width: 250px;">
              {{ ticket?.event?.Title || 'Detail Tiket' }}
            </small>
          </div>
          <button type="button" class="btn-close shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-0">
          <div class="p-3 bg-primary-subtle border-bottom border-primary-subtle text-center">
            <p class="mb-0 small text-primary-emphasis fw-medium">
              <i class="bi bi-info-circle-fill me-1"></i>
              Pilih ikon QR untuk memunculkan kode absen peserta.
            </p>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-4 py-3 border-0 small text-uppercase fw-bold text-muted">Nama Peserta</th>
                  <th class="border-0 small text-uppercase fw-bold text-muted text-center">QR Code</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(person, index) in participantList" :key="index">
                  <td class="ps-4">
                    <div class="fw-bold text-dark text-capitalize">{{ person.Name || person.name }}</div>
                    <div class="small text-muted font-monospace">
                      ID: {{ String(ticket?.SK || '').slice(-6).toUpperCase() || 'N/A' }}-{{ Number(index) + 1 }}
                    </div>
                  </td>
                  <td class="text-center">
                    <button @click="toggleQr(Number(index))">
                      <i class="bi bi-qr-code fs-5"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Transition name="slide-up">
            <div v-if="activeQrIndex !== null && participantList[activeQrIndex]"
              class="qr-display-section bg-light p-4 text-center border-top">
              <h6 class="fw-bold mb-3">Barcode Absen: {{ participantList[activeQrIndex].Name ||
                participantList[activeQrIndex].name }}</h6>

              <div class="qr-frame p-3 bg-white d-inline-block rounded-4 shadow-sm border mb-3">
                <img :src="getQrUrl(participantList[activeQrIndex], 400)" alt="QR Code" class="img-fluid"
                  style="width: 200px; height: 200px;">
              </div>

              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-primary btn-sm rounded-pill px-4 shadow-sm"
                  @click="downloadQr(participantList[activeQrIndex])" :disabled="isDownloading">
                  <span v-if="isDownloading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-download me-1"></i> Simpan QR
                </button>
                <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="activeQrIndex = null">
                  Tutup
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <div class="modal-footer border-0 p-3 bg-light">
          <button type="button" class="btn btn-secondary w-100 rounded-pill fw-bold" @click="close">Tutup
            E-Ticket</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  ticket: any;
}>();

const emit = defineEmits(['close']);
const isDownloading = ref(false);
const activeQrIndex = ref<number | null>(null);

watch(() => props.show, (newVal) => {
  if (!newVal) {
    activeQrIndex.value = null;
  } else {
    // Jika hanya ada 1 peserta, otomatis tampilkan QR-nya
    if (participantList.value && participantList.value.length === 1) {
      activeQrIndex.value = 0;
    }
  }
});

const participantList = computed((): any[] => {
  if (!props.ticket) return [];
  const list = props.ticket.participants || (props.ticket.participant ? [props.ticket.participant] : []);
  return Array.isArray(list) ? list : [];
});

const toggleQr = (index: number) => {
  activeQrIndex.value = activeQrIndex.value === index ? null : index;
};

const getQrUrl = (person: any, size: number = 300) => {
  const data = {
    trx: String(props.ticket?.SK || 'NEW'),
    name: person.Name || person.name,
    event: props.ticket?.event?.Title
  };
  const encodedData = encodeURIComponent(JSON.stringify(data));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
};

const downloadQr = async (person: any) => {
  isDownloading.value = true;
  try {
    const name = String(person.Name || person.name || 'Peserta').replace(/\s+/g, '-');
    const url = getQrUrl(person, 600);
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `Tiket-${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Download QR Gagal:', error);
  } finally {
    isDownloading.value = false;
  }
};

const close = () => {
  activeQrIndex.value = null;
  emit('close');
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1070;
}

.qr-frame {
  border: 2px solid #f8f9fa;
}

.rounded-4 {
  border-radius: 1.25rem !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.table> :not(caption)>*>* {
  padding: 1rem 0.5rem;
}
</style>