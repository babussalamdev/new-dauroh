<template>
  <div class="container mt-0">
    <div v-if="!eventStore.loading.tiketEvent && eventStore.tiketEventChunks.length > 0" id="tiketEvent"
      class="carousel slide carousel-dark" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <div class="carousel-inner">
        <div v-for="(chunk, chunkIndex) in eventStore.tiketEventChunks" :key="chunkIndex"
          :class="['carousel-item', { active: chunkIndex === 0 }]">
          <div class="d-flex card-container-flex">
            <div v-for="event in chunk" :key="event.SK" class="event-card-wrapper">

              <div class="text-decoration-none d-block h-100 position-relative"
                :class="{ 'card-disabled': getCardStatus(event).isDisabled }" style="cursor: pointer;"
                @click="handleCardClick(event)">
                <div class="card event-card rounded-lg overflow-hidden h-100">
                  <div class="position-relative">
                    <NuxtImg :src="`${imgUrl}/${event.SK}/${event.Picture}.webp`" class="card-img-top"
                      :alt="event.Title" loading="lazy" format="webp" />
                    <span v-if="event.topOverlay" class="overlay-top">{{ event.topOverlay }}</span>

                    <div v-if="getCardStatus(event).overlayText" class="status-overlay">
                      {{ getCardStatus(event).overlayText }}
                    </div>

                  </div>
                  <div class="card-body d-flex flex-column p-3">
                    <h6 class="card-title fw-bold text-dark">{{ event.Title }}</h6>
                    <small class="text-muted mb-1">{{ event.date || event.genre }}</small>

                    <div class="mt-auto d-flex flex-column flex-sm-row gap-2">
                      <button class="btn btn-sm btn-outline-primary rounded-pill w-100"
                        @click.stop="openDetailModal(event)">
                        Detail
                      </button>

                      <button class="btn btn-sm rounded-pill w-100" :class="getButtonState(event).cssClass"
                        :disabled="getButtonState(event).disabled || loadingEventId === event.SK"
                        @click.stop="handleRegisterClick(event)">
                        <span v-if="loadingEventId === event.SK" class="spinner-border spinner-border-sm" role="status"
                          aria-hidden="true"></span>
                        <span v-else>{{ getButtonState(event).label }}</span>
                      </button>

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <button class="carousel-control-prev" type="button" data-bs-target="#tiketEvent" data-bs-slide="prev"
        v-show="eventStore.tiketEventChunks.length > 1">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#tiketEvent" data-bs-slide="next"
        v-show="eventStore.tiketEventChunks.length > 1">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>

    </div>

    <ModalsEventDetailModal :show="showDetailModal" :event="selectedEvent" @close="closeDetailModal"
      @register="handleRegisterFromDetail" />

    <ModalsEventImageModal :show="showImageModal" :event="selectedEvent" @close="closeImageModal" />

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useEventStore } from "~/stores/event";
import { useToastStore } from '~/stores/toast';
import { useCheckoutStore } from '~/stores/checkout';
import { useAuth } from "~/composables/useAuth";
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const isHovered = ref(false);
const eventStore = useEventStore();
const toastStore = useToastStore();
const checkoutStore = useCheckoutStore();
const { isLoggedIn } = useAuth();
const { getSmartStatus } = useTransactionStatus();
const router = useRouter();

const imgUrl = ref("");
const config = useRuntimeConfig();
const loadingEventId = ref(null);

onMounted(() => {
  imgUrl.value = config.public.img;

  // Pilih endpoint berdasarkan status login
  if (isLoggedIn.value) {
    eventStore.fetchAuthTiketEvent();
  } else {
    eventStore.fetchPublicTiketEvent();
  }
});

const selectedEvent = ref(null);
const showDetailModal = ref(false);
const showImageModal = ref(false);

// --- Modal Handlers ---
const openImageModal = (event) => {
  selectedEvent.value = event;
  showImageModal.value = true;
};
const closeImageModal = () => {
  showImageModal.value = false;
};

const openDetailModal = async (eventItem) => {
  await eventStore.fetchPublicEventDetail(eventItem.SK);
  selectedEvent.value = eventStore.currentPublicEventDetail;
  showDetailModal.value = true;
};
const closeDetailModal = () => {
  showDetailModal.value = false;
};

const handleRegisterFromDetail = (event) => {
  closeDetailModal();
  setTimeout(() => {
    handleRegisterClick(event);
  }, 200);
};

const handleCardClick = (event) => {
  router.push(`/event/${event.SK}`);
};

// --- Status Tombol Terpusat ---
const getButtonState = (eventItem) => {
  if (!eventItem) return { label: 'Loading...', disabled: true, cssClass: 'btn-secondary' };

  if (eventItem.Status === 'inactive') {
    return { label: 'Non-Aktif', disabled: true, cssClass: 'btn-secondary' };
  }

  const now = dayjs();

  if (eventItem.Date) {
    const dates = Object.values(eventItem.Date);
    if (dates.length > 0) {
      const lastEventDateStr = dates.reduce((max, current) => (current.date > max ? current.date : max), dates[0].date);
      const eventEndTime = dayjs(`${lastEventDateStr}T23:59:59`);

      if (eventEndTime.isValid() && now.isAfter(eventEndTime)) {
        return { label: 'Selesai', disabled: true, cssClass: 'btn-secondary' };
      }
    }
  }

  const startStr = eventItem.Registration?.start_registration?.replace(' ', 'T');
  const endStr = eventItem.Registration?.end_registration?.replace(' ', 'T');

  if (startStr) {
    const startRegis = dayjs(startStr);
    if (startRegis.isValid() && now.isBefore(startRegis)) {
      return { label: 'Belum Buka', disabled: true, cssClass: 'btn-secondary' };
    }
  }
  if (endStr) {
    const endRegis = dayjs(endStr);
    if (endRegis.isValid() && now.isAfter(endRegis)) {
      return { label: 'Ditutup', disabled: true, cssClass: 'btn-secondary' };
    }
  }

  let relevantQuota = 'non-quota';
  const gender = (eventItem.Gender || '').toLowerCase().trim();

  if (gender.includes('ikhwan') && gender.includes('akhwat')) {
    relevantQuota = eventItem.Quota_Total;
  } else if (gender.includes('akhwat') || gender.includes('perempuan') || gender.includes('wanita')) {
    relevantQuota = eventItem.Quota_Akhwat;
  } else if (gender.includes('ikhwan') || gender.includes('laki') || gender.includes('pria')) {
    relevantQuota = eventItem.Quota_Ikhwan;
  } else {
    relevantQuota = eventItem.Quota_Total;
  }

  if (relevantQuota !== 'non-quota' && Number(relevantQuota) <= 0) {
    return { label: 'Habis', disabled: true, cssClass: 'btn-secondary' };
  }

  return { label: 'Daftar', disabled: false, cssClass: 'btn-primary' };
};

const getCardStatus = (eventItem) => {
  const buttonState = getButtonState(eventItem);
  const label = buttonState.label;

  if (['Habis', 'Selesai', 'Ditutup', 'Non-Aktif'].includes(label)) {
    let overlayText = '';
    if (label === 'Habis') overlayText = 'SOLD OUT';
    else if (label === 'Selesai') overlayText = 'SELESAI';
    else if (label === 'Ditutup') overlayText = 'DITUTUP';
    else if (label === 'Non-Aktif') overlayText = 'NON AKTIF';

    return { isDisabled: true, overlayText: overlayText };
  }

  return { isDisabled: false, overlayText: null };
};

const handleRegisterClick = async (eventItem) => {
  const state = getButtonState(eventItem);

  if (state.disabled) {
    toastStore.showToast({ message: `Gagal: Status ${state.label}`, type: 'warning' });
    return;
  }

  if (!isLoggedIn.value) {
    Swal.fire({
      icon: 'info',
      title: 'Login Diperlukan',
      text: 'Mohon login terlebih dahulu untuk mendaftar.',
      showCancelButton: true,
      confirmButtonText: 'Login Sekarang',
      cancelButtonText: 'Nanti',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-4 border-0 shadow-lg p-4',
        title: 'fs-5 fw-bold text-dark mb-2',
        htmlContainer: 'text-muted small mb-4',
        confirmButton: 'btn btn-primary rounded-pill px-4 ms-2 shadow-sm fw-medium',
        cancelButton: 'btn btn-light rounded-pill px-4 text-muted fw-medium'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/auth/login');
      }
    });
    return;
  }

  if (eventItem && eventItem.SK) {
    // Logic Satpam menggunakan logs dari store (tanpa hit API tambahan)
    const pendingLog = eventStore.userLogs.find(log => {
      const isSameEvent = String(log.Subject) === String(eventItem.SK);
      const status = getSmartStatus(log);
      return isSameEvent && status === 'PENDING';
    });

    if (pendingLog) {
      Swal.fire({
        icon: 'warning',
        title: 'Transaksi Belum Selesai',
        text: 'Anda memiliki pendaftaran yang belum dibayar untuk event ini. Silakan selesaikan pembayaran.',
        confirmButtonText: 'Bayar Sekarang',
        showCancelButton: true,
        cancelButtonText: 'Nanti',
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-4 border-0 shadow-lg p-4',
          title: 'fs-5 fw-bold text-dark mb-2',
          htmlContainer: 'text-muted small mb-4',
          confirmButton: 'btn btn-primary rounded-pill px-4 ms-2 shadow-sm fw-medium',
          cancelButton: 'btn btn-light rounded-pill px-4 text-muted fw-medium'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/checkout');
        }
      });
    } else {
      router.push(`/event/register/${eventItem.SK}`);
    }
  } else {
    toastStore.showToast({ message: 'Data Event tidak valid', type: 'danger' });
  }
};
</script>

<style scoped>
.card-disabled {
  filter: grayscale(100%);
  pointer-events: none;
  cursor: default;
}

.status-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 1px;
  z-index: 5;
  white-space: nowrap;
  border: 2px solid white;
}

.carousel {
  position: relative;
  padding-left: 50px;
  padding-right: 50px;
}

.carousel-inner {
  padding: 1rem 0;
}

.card-container-flex {
  display: flex;
  gap: 1rem;
  padding: 0;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 10px;
}

.card-container-flex::-webkit-scrollbar {
  display: none;
}

.event-card-wrapper {
  flex: 0 0 auto;
  width: 80%;
  margin-bottom: 1rem;
  padding-right: 0;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 576px) {
  .event-card-wrapper {
    width: calc(50% - 0.75rem);
  }
}

@media (min-width: 768px) {
  .event-card-wrapper {
    width: calc(33.333% - (1rem * 2 / 3) - 4px);
  }
}

@media (min-width: 992px) {
  .event-card-wrapper {
    width: calc(25% - (1rem * 3 / 4) - 4px);
  }

  .card-container-flex {
    justify-content: center;
  }
}

.carousel-control-prev,
.carousel-control-next {
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  z-index: 10;
  left: 0px;
}

.carousel-control-next {
  left: auto;
  right: 5px;
}

@media (max-width: 991.98px) {
  .carousel {
    padding-left: 35px;
    padding-right: 35px;
  }

  .carousel-control-prev {
    left: 0;
  }

  .carousel-control-next {
    right: 0;
  }

  .card-container-flex {
    padding: 0;
    padding-bottom: 10px;
  }
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  background-size: 60%;
}

.card.event-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border: none;
  cursor: pointer;
  height: 100%;
}

.card.event-card:hover {
  transform: translateY(-5px);
}

.card.event-card img {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.overlay-top {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #0d6efd;
  color: white;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: bold;
}

.card-body {
  flex-grow: 1;
}

.card-body .btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
}
</style>