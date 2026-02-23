<template>
  <div class="container py-5">
    <div v-if="eventStore.loading.detailPublic || (event && String(event.SK) !== String(eventSK))"
      class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted small letter-spacing-1">MEMUAT DATA EVENT...</p>
    </div>

    <div v-else-if="event" class="row justify-content-center">
      <div class="col-lg-7 col-xl-6">

        <div class="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden position-relative">
          <div class="card-body p-0">
            <div class="d-flex bg-white p-4 align-items-center gap-4">
              <div class="flex-shrink-0 position-relative">
                <img :src="event.Picture ? `${imgBaseUrl}/${event.SK}/${event.Picture}.webp` : '/img/placeholder.jpg'"
                  class="rounded-3 shadow-sm" style="width: 90px; height: 90px; object-fit: cover;"
                  @error="($event.target as HTMLImageElement).style.display = 'none'">
              </div>
              <div class="flex-grow-1">
                <h5 class="fw-bold mb-1 text-dark">{{ event.Title }}</h5>
                <div class="d-flex flex-wrap gap-3 text-muted x-small mt-2">
                  <span class="d-flex align-items-center gap-1"><i class="bi bi-geo-alt-fill text-danger"></i> {{
                    event.Place }}</span>
                  <span class="d-flex align-items-center gap-1"><i class="bi bi-tag-fill text-primary"></i> {{
                    formatCurrency(event.Price) }}</span>
                </div>
              </div>
            </div>

            <div v-if="isSoldOut" class="bg-danger-subtle text-danger px-4 py-2 text-center small fw-bold">
              <i class="bi bi-exclamation-circle me-1"></i> {{ soldOutMessage }}
            </div>
          </div>
        </div>

        <div v-if="!isSoldOut" class="card shadow-sm border-0 mb-4 rounded-4">
          <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
            <h6 class="fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-ticket-perforated-fill text-primary"></i> Pilih Tiket
            </h6>
          </div>
          <div class="card-body p-4">
            <div class="d-flex flex-column gap-3">

              <div v-if="canShowIkhwan"
                class="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center transition-hover">
                <div>
                  <span class="fw-bold text-dark d-block">Tiket Ikhwan</span>
                  <small class="x-small" :class="getDynamicQuotaColor(quotaInfo.ikhwan, formState.qtyIkhwan)">
                    {{ getDynamicQuotaText(quotaInfo.ikhwan, formState.qtyIkhwan) }}
                  </small>
                </div>
                <div class="counter-input d-flex align-items-center bg-white rounded-pill shadow-sm border p-1">
                  <button class="btn btn-icon rounded-circle btn-sm" @click="updateTicket('ikhwan', -1)"
                    :disabled="formState.qtyIkhwan <= 0">
                    <i class="bi bi-dash"></i>
                  </button>
                  <input type="text" class="form-control border-0 text-center fw-bold p-0 mx-1"
                    style="width: 40px; background: transparent;" :value="formState.qtyIkhwan" readonly>
                  <button class="btn btn-icon rounded-circle btn-sm btn-primary text-white"
                    @click="updateTicket('ikhwan', 1)"
                    :disabled="isMaxReached || isQuotaReached(quotaInfo.ikhwan, formState.qtyIkhwan)">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              <div v-if="canShowAkhwat"
                class="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center transition-hover">
                <div>
                  <span class="fw-bold text-dark d-block">Tiket Akhwat</span>
                  <small class="x-small" :class="getDynamicQuotaColor(quotaInfo.akhwat, formState.qtyAkhwat)">
                    {{ getDynamicQuotaText(quotaInfo.akhwat, formState.qtyAkhwat) }}
                  </small>
                </div>
                <div class="counter-input d-flex align-items-center bg-white rounded-pill shadow-sm border p-1">
                  <button class="btn btn-icon rounded-circle btn-sm" @click="updateTicket('akhwat', -1)"
                    :disabled="formState.qtyAkhwat <= 0">
                    <i class="bi bi-dash"></i>
                  </button>
                  <input type="text" class="form-control border-0 text-center fw-bold p-0 mx-1"
                    style="width: 40px; background: transparent;" :value="formState.qtyAkhwat" readonly>
                  <button class="btn btn-icon rounded-circle btn-sm btn-primary text-white"
                    @click="updateTicket('akhwat', 1)"
                    :disabled="isMaxReached || isQuotaReached(quotaInfo.akhwat, formState.qtyAkhwat)">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

            </div>

            <div v-if="isMaxReached" class="mt-3 text-center">
              <span class="badge bg-warning-subtle text-warning border border-warning-subtle x-small">
                <i class="bi bi-info-circle me-1"></i> Maksimal 4 tiket per akun
              </span>
            </div>
          </div>
        </div>

        <div v-if="totalTickets > 0" class="animate-slide-up">
          <form @submit.prevent="handleSubmit">
            <div v-for="(participant, index) in formState.participants" :key="index"
              class="card shadow-sm border-0 mb-3 rounded-4 overflow-hidden">
              <div v-if="index === 0" class="mb-4 p-3 bg-primary-subtle rounded-3 d-flex align-items-start gap-3">
                <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style="width: 32px; height: 32px;">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div>
                  <h5 class="text-primary fw-bold d-block">Data Peserta</h5>
                  <div class="small text-muted mb-1">{{ userStore.user?.fullname }}</div>
                  <div class="x-small text-muted opacity-75">{{ userStore.user?.email }}</div>
                  <input type="hidden" v-model="participant.Email">
                </div>
              </div>
              <div
                class="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <span class="fw-bold text-primary small text-uppercase ls-1">Peserta {{ index + 1 }}</span>
                <span class="badge rounded-pill"
                  :class="participant.Gender === 'Ikhwan' ? 'bg-info-subtle text-info-emphasis' : 'bg-danger-subtle text-danger-emphasis'">
                  {{ participant.Gender }}
                </span>
              </div>

              <div class="card-body p-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Nama Lengkap</label>
                    <input type="text" class="form-control modern-input" v-model="participant.Name" required>
                  </div>

                  <div class="col-6">
                    <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Usia</label>
                    <div class="input-group">
                      <input type="number" class="form-control modern-input" v-model="participant.Age" required min="5"
                        placeholder="0">
                      <span class="input-group-text bg-light border-start-0 text-muted x-small"
                        style="border-color: #e9ecef;">Thn</span>
                    </div>
                  </div>

                  <div class="col-6">
                    <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Domisili</label>
                    <input type="text" class="form-control modern-input" v-model="participant.Domicile" required
                      placeholder="Kota">
                  </div>
                </div>
              </div>
            </div>

            <div class="fixed-bottom-bar bg-white border-top shadow-lg p-3 rounded-top-4 mt-4">
              <div class="container d-flex justify-content-between align-items-center px-0 px-lg-3"
                style="max-width: 600px;">
                <div>
                  <small class="text-muted d-block x-small">Total Pembayaran</small>
                  <span class="fs-4 fw-bold text-primary lh-1">{{ formatCurrency(totalPrice) }}</span>
                </div>
                <button type="submit" class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
                  :disabled="totalTickets === 0">
                  Bayar Sekarang <i class="bi bi-arrow-right-short fs-5 align-middle"></i>
                </button>
              </div>
            </div>
            <div style="height: 100px;"></div>

          </form>
        </div>

      </div>
    </div>

    <div v-else class="text-center py-5">
      <div class="mb-3 text-muted opacity-50"><i class="bi bi-calendar-x display-1"></i></div>
      <h5 class="fw-bold">Event Tidak Ditemukan</h5>
      <p class="text-muted small">Silakan periksa kembali link atau kembali ke beranda.</p>
      <button @click="router.push('/')" class="btn btn-outline-primary rounded-pill px-4 mt-2">Ke Beranda</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '~/stores/event';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

definePageMeta({
  middleware: (to, from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/auth/login');
  }
});

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const checkoutStore = useCheckoutStore();
const userStore = useUserStore();
const config = useRuntimeConfig();
const { getSmartStatus } = useTransactionStatus();

const eventSK = computed(() => String(route.params.id));
const imgBaseUrl = ref(config.public.img || '');
const event = computed(() => eventStore.currentPublicEventDetail);

const formState = reactive({
  qtyIkhwan: 0,
  qtyAkhwat: 0,
  participants: [] as any[]
});

const STORAGE_KEY = computed(() => `event_reg_draft_${eventSK.value}`);

onMounted(async () => {
  if (!eventStore.tiketEvent || eventStore.tiketEvent.length === 0) {
    await eventStore.fetchPublicTiketEvent();
  }
  if (checkoutStore.transactionDetails) {
    const zombieStatus = getSmartStatus(checkoutStore.transactionDetails);
    // Kalau statusnya EXPIRED/CANCELLED, bersihkan store biar bisa buat baru
    if (['EXPIRED', 'CANCELLED'].includes(zombieStatus)) {
      if (checkoutStore.clearCheckout) {
        checkoutStore.clearCheckout();
      } else {
        checkoutStore.$reset();
        checkoutStore.currentStep = 'select';
      }
    }
  }

  // 4. Load Draft
  if (process.client) {
    const saved = localStorage.getItem(STORAGE_KEY.value);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.qtyIkhwan) formState.qtyIkhwan = parsed.qtyIkhwan;
        if (parsed.qtyAkhwat) formState.qtyAkhwat = parsed.qtyAkhwat;
        if (parsed.participants) formState.participants = parsed.participants;
      } catch (e) {
        console.error("Failed load draft", e);
      }
    }
  }
});

watch(formState, (newVal) => {
  if (process.client) {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(newVal));
  }
}, { deep: true });

watch(eventSK, async (newSk) => {
  if (newSk) {
    if (!process.client || !localStorage.getItem(`event_reg_draft_${newSk}`)) {
      formState.qtyIkhwan = 0;
      formState.qtyAkhwat = 0;
      formState.participants = [];
    }
    await eventStore.fetchPublicEventDetail(newSk);
  }
}, { immediate: true });

// --- HELPERS ---
const canShowIkhwan = computed(() => {
  if (!event.value) return false;
  const g = event.value.Gender?.toLowerCase() || '';
  return g.includes('ikhwan') || g.includes('ikhwan, akhwat');
});

const canShowAkhwat = computed(() => {
  if (!event.value) return false;
  const g = event.value.Gender?.toLowerCase() || '';
  return g.includes('akhwat') || g.includes('ikhwan, akhwat');
});

const quotaInfo = computed(() => {
  if (!event.value) return { ikhwan: 0, akhwat: 0, total: 0 };
  return {
    ikhwan: event.value.Quota_Ikhwan,
    akhwat: event.value.Quota_Akhwat,
    total: event.value.Quota_Total
  };
});

const getDynamicQuotaText = (quotaTotal: any, selectedQty: number) => {
  if (quotaTotal === 'non-quota') return 'Tanpa Batas Kuota';
  if (typeof quotaTotal === 'number') {
    const remaining = quotaTotal - selectedQty;
    return remaining <= 0 ? 'Habis' : `Sisa: ${remaining} Tiket`;
  }
  return 'Habis';
};

const getDynamicQuotaColor = (quotaTotal: any, selectedQty: number) => {
  if (quotaTotal === 'non-quota') return 'text-success';
  if (typeof quotaTotal === 'number') {
    const remaining = quotaTotal - selectedQty;
    if (remaining <= 0) return 'text-danger fw-bold';
    if (remaining < 5) return 'text-warning fw-bold';
    return 'text-muted';
  }
  return 'text-danger';
};

const isQuotaReached = (quotaTotal: any, selectedQty: number) => {
  if (quotaTotal === 'non-quota') return false;
  return selectedQty >= quotaTotal;
}

const soldOutMessage = ref("Mohon maaf, kuota tiket sudah habis.");

const isSoldOut = computed(() => {
  if (!event.value) return false;

  if (event.value.Status === 'inactive') {
    soldOutMessage.value = "Pendaftaran ditutup (Non-Aktif).";
    return true;
  }

  if (event.value.Date) {
    const dates = Object.values(event.value.Date);
    if (dates.length > 0) {
      const lastDate = dates.reduce((max, cur) => cur.date > max ? cur.date : max, dates[0]!.date);
      if (dayjs().isAfter(dayjs(`${lastDate}T23:59:59`))) {
        soldOutMessage.value = "Pendaftaran ditutup (Event Selesai).";
        return true;
      }
    }
  }

  let ikhwanAvailable = false;
  if (canShowIkhwan.value) {
    const q = event.value.Quota_Ikhwan;
    if (q === 'non-quota' || (typeof q === 'number' && q > 0)) {
      ikhwanAvailable = true;
    }
  }

  let akhwatAvailable = false;
  if (canShowAkhwat.value) {
    const q = event.value.Quota_Akhwat;
    if (q === 'non-quota' || (typeof q === 'number' && q > 0)) {
      akhwatAvailable = true;
    }
  }

  if (ikhwanAvailable || akhwatAvailable) return false;

  soldOutMessage.value = "Mohon maaf, kuota tiket sudah habis.";
  return true;
});

const totalTickets = computed(() => formState.qtyIkhwan + formState.qtyAkhwat);
const totalPrice = computed(() => (event.value?.Price || 0) * totalTickets.value);
const isMaxReached = computed(() => totalTickets.value >= 4);

// --- METHODS ---
const updateTicket = (type: 'ikhwan' | 'akhwat', change: number) => {
  if (change > 0 && isMaxReached.value) return;

  if (type === 'ikhwan') {
    const newVal = formState.qtyIkhwan + change;
    if (typeof quotaInfo.value.ikhwan === 'number' && quotaInfo.value.ikhwan > 0 && newVal > quotaInfo.value.ikhwan) return;
    if (newVal >= 0) formState.qtyIkhwan = newVal;
  } else {
    const newVal = formState.qtyAkhwat + change;
    if (typeof quotaInfo.value.akhwat === 'number' && quotaInfo.value.akhwat > 0 && newVal > quotaInfo.value.akhwat) return;
    if (newVal >= 0) formState.qtyAkhwat = newVal;
  }
  generateForms();
};

const generateForms = () => {
  const newParticipants: any[] = [];
  const oldParticipants = [...formState.participants];
  const popExisting = (gender: string) => {
    const idx = oldParticipants.findIndex(p => p.Gender === gender);
    if (idx !== -1) return oldParticipants.splice(idx, 1)[0];
    return null;
  };

  let hasFilledUser = false;

  const createParticipant = (gender: string) => {
    if (!hasFilledUser && userStore.user) {
      hasFilledUser = true;
      return {
        Name: userStore.user.fullname || '',
        Email: userStore.user.email || '',
        Gender: gender,
        Age: '',
        Domicile: ''
      }
    }
    return { Name: '', Email: '', Gender: gender, Age: '', Domicile: '' };
  }

  for (let i = 0; i < formState.qtyIkhwan; i++) {
    const existing = popExisting('Ikhwan');
    if (existing) {
      newParticipants.push(existing);
      if (existing.Email === userStore.user?.email) hasFilledUser = true;
    } else {
      newParticipants.push(createParticipant('Ikhwan'));
    }
  }

  for (let i = 0; i < formState.qtyAkhwat; i++) {
    const existing = popExisting('Akhwat');
    if (existing) {
      newParticipants.push(existing);
      if (existing.Email === userStore.user?.email) hasFilledUser = true;
    } else {
      newParticipants.push(createParticipant('Akhwat'));
    }
  }
  formState.participants = newParticipants;
};

const formatCurrency = (val: number) => {
  if (!val) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

const handleSubmit = async () => {
  checkoutStore.noRepay()
  if (!event.value || !event.value.SK) return;

  const conflictingTransaction = userStore.transactions.find(t => {
    const tEventSK = (t.SK || '').split('#')[0];

    if (tEventSK !== event.value!.SK) return false;

    const status = getSmartStatus(t);
    return status === 'PENDING';
  });

  if (conflictingTransaction) {
    Swal.fire({
      icon: 'info',
      title: 'Sudah Terdaftar',
      text: 'Anda memiliki tagihan aktif untuk event ini. Lanjutkan pembayaran?',
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan Pembayaran',
      cancelButtonText: 'Tutup',
    }).then((result) => {
      if (result.isConfirmed) {
        checkoutStore.event = {
          ...event.value!,
          SK: (event.value?.SK || '') as string,
          Title: event.value?.Title || '',
          Price: event.value?.Price || 0
        } as any;

        const rawParticipants = conflictingTransaction.participants || formState.participants;

        checkoutStore.participants = rawParticipants.map((p: any) => ({
          Name: p.Name || '',
          Gender: p.Gender || 'Ikhwan',
          Email: p.Email || userStore.user?.email || '',
          Age: p.Age || 0,
          Domicile: p.Domicile || ''
        }));

        checkoutStore.transactionDetails = {
          ...conflictingTransaction,
          status: 'PENDING',
          amount: conflictingTransaction.amount,
          vaNumber: conflictingTransaction.va_number || conflictingTransaction.receiver_bank_account?.account_number,
          expiryTime: conflictingTransaction.expired_date || conflictingTransaction.expiryTime,
          paymentMethod: conflictingTransaction.sender_bank || conflictingTransaction.paymentMethod || 'Bank',
        };

        if (checkoutStore.setStep) {
          checkoutStore.setStep('instructions');
        } else {
          checkoutStore.currentStep = 'instructions';
        }
        router.push('/checkout');
      }
    });
    return; // Stop flow registrasi baru
  }

  // 4. Flow Normal (Daftar Baru)
  if (process.client) {
    localStorage.removeItem(STORAGE_KEY.value);
  }

  const mainEmail = userStore.user?.email || formState.participants[0]?.Email || '';

  const finalParticipants = formState.participants.map((p) => ({
    ...p,
    Email: mainEmail, // Pastikan Email terisi
    Age: Number(p.Age)
  }));

  const registrationData = {
    event: {
      ...event.value!,
      SK: (event.value?.SK || '') as string // Pastikan SK string
    },
    participants: finalParticipants as any[]
  };

  if ((event.value.Price || 0) === 0) {
    userStore.registerEvent(registrationData);
    router.push('/dashboard');
  } else {
    // Pastikan checkout store bersih sebelum start
    if (checkoutStore.clearCheckout) checkoutStore.clearCheckout();

    checkoutStore.startCheckout(registrationData);
    router.push('/checkout');
  }
};
</script>

<style scoped>
/* Modern Styles */
.letter-spacing-1 {
  letter-spacing: 1px;
}

.ls-1 {
  letter-spacing: 0.5px;
}

.x-small {
  font-size: 0.8rem;
}

.bg-light-subtle {
  background-color: #f8f9fa;
}

.transition-hover {
  transition: all 0.2s ease;
}

.transition-hover:hover {
  border-color: var(--color-primary, #004754) !important;
  background-color: #fff !important;
}

.modern-input {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 0.6rem 0.8rem;
  transition: all 0.2s;
}

.modern-input:focus {
  background-color: #fff;
  border-color: var(--color-primary, #004754);
  box-shadow: 0 0 0 3px rgba(0, 71, 84, 0.1);
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 991px) {
  .fixed-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(8px);
  }
}
</style>