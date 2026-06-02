<template>
  <div>
    <div class="card content-card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3 px-md-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        
        <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
          <h5 class="mb-0 txt-title fw-bold text-dark text-truncate w-100">Log Kehadiran</h5>
          
          <div v-if="globalStore.activeEventSK" class="text-primary fw-medium txt-caption text-truncate w-100">
            {{ globalStore.activeEvent?.Title }}
          </div>
          <div v-else class="text-muted txt-caption text-truncate w-100">
            Belum Ada Event Terpilih
          </div>
        </div>

        <div class="flex-shrink-0 text-start text-md-end" v-if="globalStore.activeEventSK">
          <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill shadow-sm txt-caption fw-medium">
            Total Hadir: {{ totalItems }} Peserta
          </span>
        </div>

      </div>
    </div>
    
    <div class="card content-card border-0 shadow-sm rounded-4 mb-4"> 
      
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom" v-if="globalStore.activeEventSK">
        <div class="d-flex flex-column gap-3">
          
          <div class="d-flex flex-wrap gap-2 justify-content-start">
            <NuxtLink to="/admin/scan" class="btn btn-outline-success rounded-pill px-3 py-1 shadow-sm flex-grow-1 flex-sm-grow-0 text-center txt-caption fw-medium">
              Scan QR
            </NuxtLink>
            
            <NuxtLink to="/admin/kehadiran/manual" class="btn btn-outline-success rounded-pill px-3 py-1 shadow-sm flex-grow-1 flex-sm-grow-0 text-center txt-caption fw-medium">
              Absen Manual
            </NuxtLink>

            <button class="btn btn-success rounded-pill px-3 py-1 shadow-sm flex-grow-1 flex-sm-grow-0 txt-caption fw-medium" @click="handleExport" :disabled="isExporting">
              <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
              Export
            </button>

            <transition name="fade">
              <button 
                v-if="selectedParticipants.length > 0"
                class="btn btn-warning rounded-pill px-3 py-1 shadow-sm flex-grow-1 flex-sm-grow-0 txt-caption fw-bold text-dark" 
                @click="handleBagikanSertifikat" 
                :disabled="isDistributing"
              >
                <span v-if="isDistributing" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-award-fill me-1"></i>
                Bagikan Sertifikat ({{ selectedParticipants.length }})
              </button>
            </transition>
          </div>

          <div class="w-100" style="max-width: 400px;">
            <div class="input-group input-group-sm shadow-sm">
              <span class="input-group-text bg-light border-0 text-muted"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control form-control-sm bg-light border-0 ps-0 txt-body" 
                placeholder="Cari nama atau kode tiket..." 
                v-model="searchQuery"
              >
            </div>
          </div>

        </div>
      </div>

      <div class="card-body p-0">
        
        <div v-if="!globalStore.activeEventSK" class="text-center py-5 text-muted bg-light px-3 rounded-bottom-4">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
          <p class="mb-0 fw-medium txt-body">Silakan pilih <strong>Event</strong> terlebih dahulu di halaman Dashboard.</p>
          <NuxtLink to="/admin" class="btn btn-sm btn-primary mt-3 rounded-pill px-4 shadow-sm txt-caption">Ke Dashboard</NuxtLink>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="store.loading" class="my-5" />

          <div v-else-if="filteredAttendees.length > 0">
            <div class="table-responsive">
              <table class="table table-hover mb-0" style="min-width: 700px;">
                <thead>
                  <tr>
                    <th class="text-center ps-4" style="width: 4%;">
                      <input 
                        class="form-check-input shadow-none cursor-pointer border-secondary" 
                        type="checkbox" 
                        :checked="isAllSelected" 
                        @change="toggleSelectAll"
                      >
                    </th>
                    <th class="text-center txt-label" style="width: 4%;">NO</th>
                    <th class="txt-label" style="width: 32%;">INFORMASI PESERTA</th>
                    <th class="txt-label" style="width: 25%;">KODE TIKET</th>
                    <th class="txt-label" style="width: 20%;">WAKTU MASUK</th>
                    <th class="text-center txt-label" style="width: 12%;">STATUS</th>
                    <th class="text-center pe-4 txt-label" style="width: 10%;">SERTIFIKAT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedData" :key="item.ticketId">
                    <td class="text-center ps-4 align-middle">
                      <input 
                      class="form-check-input shadow-none border-secondary" 
                      type="checkbox" 
                      :value="item.ticketId" 
                      :checked="item.isCertificateSent || selectedParticipants.includes(item.ticketId)"
                      :disabled="item.isCertificateSent"
                      @change="toggleParticipant(item)"
                      >
                    </td>
                    <td class="text-center fw-medium text-muted txt-body align-middle">
                      {{ (currentPage - 1) * perPage + index + 1 }}
                    </td>
                    <td class="align-middle">
                      <div class="fw-bold text-dark text-capitalize txt-body">{{ item.name }}</div>
                      <div class="text-muted txt-caption">{{ item.gender === 'l' ? 'Ikhwan' : 'Akhwat' }} - {{ item.age }} thn</div>
                    </td>
                    <td class="align-middle">
                      <span class="badge bg-light text-dark border font-monospace px-2 py-1 txt-body">{{ item.ticketId }}</span>
                    </td>
                    <td class="align-middle">
                      <div v-if="item.scanTime" class="text-dark fw-medium txt-body">
                        <i class="bi bi-clock me-1 text-success"></i> {{ dayjs(item.scanTime).format('HH:mm:ss') }} WIB
                      </div>
                    </td>
                    <td class="text-center align-middle">
                      <span class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 shadow-sm txt-label">
                        Hadir
                      </span>
                    </td>
                    <td class="text-center pe-4 align-middle">
                      <button class="btn btn-link text-secondary" @click="openPreviewModal(item)" title="Preview Sertifikat">
                        <i class="bi bi-eye-fill fs-5"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light rounded-bottom-4" v-if="totalPages > 1">
              <span class="text-muted txt-body">
                Halaman {{ currentPage }} dari {{ totalPages }} 
              </span>
              
              <div class="btn-group shadow-sm">
                <button 
                  class="btn btn-outline-secondary btn-sm txt-body" 
                  :disabled="currentPage === 1"
                  @click="changePage(currentPage - 1)"
                >
                  <i class="bi bi-chevron-left"></i> Prev
                </button>
                <button 
                  class="btn btn-outline-secondary btn-sm txt-body" 
                  :disabled="currentPage === totalPages"
                  @click="changePage(currentPage + 1)"
                >
                  <i class="bi bi-chevron-right"></i> Next
                </button>
              </div>
            </div>

          </div>

          <div v-else class="text-center py-5 px-3">
            <i v-if="searchQuery" class="bi bi-search fs-1 text-muted opacity-50 d-block mb-3"></i>
            <i v-else class="bi bi-inbox fs-1 text-muted opacity-50 d-block mb-3"></i>
            
            <h6 class="mb-1 txt-subtitle">{{ searchQuery ? 'Data Tidak Ditemukan' : 'Belum Ada Peserta Masuk' }}</h6>
            <p class="text-muted txt-body">
              {{ searchQuery ? `Tidak ada peserta hadir yang cocok dengan "${searchQuery}"` : 'Belum ada data peserta yang melakukan Check-in pada event ini.' }}
            </p>
          </div>

        </div>
      </div>
    </div>

    <div v-if="showPreview" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8);" @click.self="showPreview = false">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-header border-0 d-flex justify-content-end p-2">
             <button type="button" class="btn-close btn-close-white" @click="showPreview = false"></button>
          </div>
          
          <div class="modal-body d-flex justify-content-center p-0 align-items-center" style="min-height: 50vh;">
             <CommonLoadingSpinner v-if="isPreviewLoading" class="text-white" />
             
             <div v-else-if="participantCertData" class="certificate-container shadow-lg w-100" style="max-width: 1123px;" :class="participantCertData.Certificate_Configuration.design.layout">
                <img :src="displayPreviewImage" class="template-img" @error="($event.target as HTMLImageElement).style.display = 'none'">
                
                <div v-if="participantCertData.Certificate_Configuration.design.fields.eventTitle" class="preview-text" :style="createPreviewStyleObj(participantCertData.Certificate_Configuration.design.styles.eventTitle)">
                  {{ participantCertData.Certificate_Configuration.design.fields.eventTitle }}
                </div>
                
                <div v-if="participantCertData.Certificate_Configuration.design.fields.name" class="preview-text" :style="createPreviewStyleObj(participantCertData.Certificate_Configuration.design.styles.name)">
                  {{ participantCertData.Certificate_Configuration.design.fields.name }}
                </div>
                
                <div v-if="participantCertData.Certificate_Configuration.design.fields.domicile" class="preview-text" :style="createPreviewStyleObj(participantCertData.Certificate_Configuration.design.styles.domicile)">
                  {{ participantCertData.Certificate_Configuration.design.fields.domicile }}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import { useAttendanceStore } from '~/stores/attendance';
import { useGlobalEventStore } from '~/stores/globalEvent'; 
import { usePagination } from '~/composables/usePagination';
import { useAlert } from '~/utils/swal';
import { useRuntimeConfig } from '#app';

const store = useAttendanceStore();
const globalStore = useGlobalEventStore();
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

const { alert: swalAlert, confirm: swalConfirm } = useAlert();

const isExporting = ref(false);
const searchQuery = ref('');

const selectedParticipants = ref<string[]>([]);
const isDistributing = ref(false);

const showPreview = ref(false);
const isPreviewLoading = ref(false);
const participantCertData = ref<any | null>(null); // Pakai any dlu biar jalan, atau ganti CertificatePreviewData

const openPreviewModal = async (item: any) => {
  if (!globalStore.activeEventSK) return;
  
  showPreview.value = true;
  isPreviewLoading.value = true;
  participantCertData.value = null; 

  try {
    const res = await store.fetchCertificatePreview(item.pk, item.ticketId, globalStore.activeEventSK);
    
    if (res && res.Certificate_Configuration) {
      participantCertData.value = res;
    } else {
      swalAlert('Gagal', 'Sertifikat belum tersedia untuk peserta ini.', 'warning');
      showPreview.value = false;
    }
  } catch (error) {
    swalAlert('Gagal', 'Terjadi kesalahan saat memuat sertifikat.', 'error');
    showPreview.value = false;
  } finally {
    isPreviewLoading.value = false;
  }
};

const displayPreviewImage = computed(() => {
  const imgData = participantCertData.value?.Certificate_Picture;
  if (!imgData) return '';
  if (imgData.startsWith('http')) return imgData;
  return `${imgBaseUrl.value}/${globalStore.activeEventSK}/${imgData}.webp`;
});

const createPreviewStyleObj = (fieldStyle: any) => {
  if (!fieldStyle) return {};
  const baseWidth = participantCertData.value?.Certificate_Configuration?.design?.layout === 'landscape' ? 1123 : 794;
  const responsiveFontSize = (fieldStyle.fontSize / baseWidth) * 100;

  return {
    top: `${fieldStyle.top}%`,
    left: `${fieldStyle.left}%`,
    fontSize: `${responsiveFontSize}cqi`,
    color: fieldStyle.color,
    transform: 'translate(-50%, -50%)',
    border: 'none',
    backgroundColor: 'transparent'
  };
};

const loadAttendanceList = async () => {
  if (globalStore.activeEventSK) {
    await store.fetchAttendanceData('present'); 
  }
};

// Panggil API-nya pas halaman pertama kali dibuka
onMounted(() => {
  loadAttendanceList();
});

// Panggil API-nya lagi kalau admin ganti pilihan Event di atas
watch(() => globalStore.activeEventSK, () => {
  loadAttendanceList();
});

const filteredAttendees = computed(() => {
  if (!store.participants) return [];
  
  return store.participants.filter((item) => {
    if (item.status !== 'hadir') return false;

    const matchSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        item.ticketId.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    return matchSearch;
  });
});

const { perPage, currentPage, totalPages, totalItems, paginatedData, changePage } = usePagination(filteredAttendees, 20);

const isAllSelected = computed(() => {
  return filteredAttendees.value.length > 0 && selectedParticipants.value.length === filteredAttendees.value.length;
});

const toggleSelectAll = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  
  if (isChecked) {
    // 🟢 Cuma pilih peserta yang BELUM dikirim sertifikatnya
    selectedParticipants.value = filteredAttendees.value
      .filter(item => !item.isCertificateSent) 
      .map(item => item.ticketId);
  } else {
    selectedParticipants.value = [];
  }
};

const handleBagikanSertifikat = () => {
  swalConfirm(
    'Bagikan Sertifikat?',
    `Anda akan memberikan akses sertifikat kepada ${selectedParticipants.value.length} peserta yang dipilih.`,
    'Ya, Bagikan!'
  ).then(async (result) => {
    if (result.isConfirmed) {
      isDistributing.value = true;
      try {
        const updatesPayload = selectedParticipants.value.map(ticketId => {
          const participant = store.participants.find(p => p.ticketId === ticketId);
          return { PK: participant?.pk, SK: ticketId, Eligible: "true" };
        });

        const success = await store.distributeCertificatesBulk(updatesPayload);
        
        if (success) {
          swalAlert('Berhasil!', `Sertifikat berhasil dibagikan ke ${selectedParticipants.value.length} peserta.`, 'success');
          selectedParticipants.value = []; 
        } else {
          throw new Error("Gagal dari server");
        }
      } catch (error) {
        swalAlert('Gagal', 'Terjadi kesalahan saat membagikan sertifikat.', 'error');
      } finally {
        isDistributing.value = false;
      }
    }
  });
};

const toggleParticipant = (item: any) => {
  // Kalau udah sent, jangan diapa-apain (ngunci interaksi)
  if (item.isCertificateSent) return;

  const index = selectedParticipants.value.indexOf(item.ticketId);
  if (index > -1) {
    selectedParticipants.value.splice(index, 1); // Hapus kalau udah ada
  } else {
    selectedParticipants.value.push(item.ticketId); // Tambahin kalau belum ada
  }
};

const handleExport = () => {
  if (!store.participants || store.participants.length === 0) {
    swalAlert('Data Kosong', 'Tidak ada data kehadiran untuk di-export.', 'warning');
    return;
  }
  isExporting.value = true;
  try {
    const headers = ['No', 'Nama Peserta', 'Kode Tiket', 'Gender', 'Umur', 'Waktu Masuk', 'Status'];
    const rows = store.participants.map((p, index) => {
      return [
        index + 1, `"${p.name}"`, p.ticketId, p.gender === 'l' ? 'Ikhwan' : 'Akhwat',
        p.age, p.scanTime || 'Belum Absen', p.status.toUpperCase()
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');                         
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a'); 
    const fileName = `Log_Kehadiran_${globalStore.activeEventSK}_${dayjs().format('YYYYMMDD_HHmm')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link); 
    swalAlert('Berhasil', 'File CSV berhasil didownload!', 'success');
  } catch (error) {
    console.error("Export Error:", error);
    swalAlert('Gagal Export', 'Terjadi kesalahan saat memproses data.', 'error');
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

.form-check-input:disabled {
  opacity: 1; /* Biar gak transparan */
  background-color: #198754; /* Warna hijau success bootstrap */
  border-color: #198754;
}

.cursor-pointer { cursor: pointer; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.input-group-text, .form-control { padding: 0.5rem 1rem; }
.form-control:focus { border-color: #198754; box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25); }

.certificate-container { overflow: hidden; position: relative; background-color: white; width: 100% !important; max-width: 1123px; container-type: inline-size; }
.certificate-container.landscape { aspect-ratio: 297 / 210; height: auto !important; }
.certificate-container.portrait { aspect-ratio: 210 / 297; height: auto !important; }
.template-img { width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; }
.preview-text { position: absolute; user-select: none; font-weight: bold; white-space: nowrap; font-family: 'Arial', sans-serif; line-height: 1; padding: 0; z-index: 20; }
</style>