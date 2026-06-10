<template>
  <div class="container py-5">
    <div v-if="eventStore.loading.detailPublic || (event && String(event.SK) !== String(eventSK))"
      class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted txt-caption fw-bold letter-spacing-1">MEMUAT DATA EVENT...</p>
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
                <h5 class="txt-subtitle fw-bold mb-1 text-dark">{{ event.Title }}</h5>
                <div class="d-flex flex-wrap gap-3 text-muted txt-caption mt-2 fw-bold">
                  <span class="d-flex align-items-center gap-1"><i class="bi bi-geo-alt-fill text-danger"></i> {{
                    event.Place }}</span>
                  <span class="d-flex align-items-center gap-1"><i class="bi bi-tag-fill text-primary"></i> {{
                    formatCurrency(event.Price) }}</span>
                </div>
              </div>
            </div>

            <div v-if="isSoldOut" class="bg-danger-subtle text-danger px-4 py-2 text-center txt-caption fw-bold">
              <i class="bi bi-exclamation-circle me-1"></i> {{ soldOutMessage }}
            </div>
          </div>
        </div>

        <div v-if="!isSoldOut" class="card shadow-sm border-0 mb-4 rounded-4">
          <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
            <h6 class="txt-subtitle fw-bold m-0 d-flex align-items-center gap-2 text-dark">
              <i class="bi bi-ticket-perforated-fill text-primary"></i> Pilih Tiket
            </h6>
          </div>
          <div class="card-body p-4">
            <div class="d-flex flex-column gap-3">

              <div v-if="canShowIkhwan"
                class="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center transition-hover">
                <div>
                  <span class="txt-body fw-bold text-dark d-block">Tiket Ikhwan</span>
                  <span class="txt-caption fw-bold" :class="getDynamicQuotaColor(remainingQuota.ikhwan, formState.qtyIkhwan)">
                    {{ getDynamicQuotaText(event?.Quota_Ikhwan, event?.Sold_Ikhwan, formState.qtyIkhwan) }}
                  </span>
                </div>
                <div class="counter-input d-flex align-items-center bg-white rounded-pill shadow-sm border p-1">
                  <button class="btn btn-icon rounded-circle btn-sm" @click="updateTicket('ikhwan', -1)"
                    :disabled="formState.qtyIkhwan <= 0">
                    <i class="bi bi-dash"></i>
                  </button>
                  <input type="text" class="form-control border-0 text-center txt-body fw-bold p-0 mx-1"
                    style="width: 40px; background: transparent;" :value="formState.qtyIkhwan" readonly>
                  <button class="btn btn-icon rounded-circle btn-sm btn-primary text-white"
                    @click="updateTicket('ikhwan', 1)"
                    :disabled="isMaxReached || isQuotaReached(remainingQuota.ikhwan, formState.qtyIkhwan)">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              <div v-if="canShowAkhwat"
                class="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center transition-hover">
                <div>
                  <span class="txt-body fw-bold text-dark d-block">Tiket Akhwat</span>
                  <span class="txt-caption fw-bold" :class="getDynamicQuotaColor(remainingQuota.akhwat, formState.qtyAkhwat)">
                    {{ getDynamicQuotaText(event?.Quota_Akhwat, event?.Sold_Akhwat, formState.qtyAkhwat) }}
                  </span>
                </div>
                <div class="counter-input d-flex align-items-center bg-white rounded-pill shadow-sm border p-1">
                  <button class="btn btn-icon rounded-circle btn-sm" @click="updateTicket('akhwat', -1)"
                    :disabled="formState.qtyAkhwat <= 0">
                    <i class="bi bi-dash"></i>
                  </button>
                  <input type="text" class="form-control border-0 text-center txt-body fw-bold p-0 mx-1"
                    style="width: 40px; background: transparent;" :value="formState.qtyAkhwat" readonly>
                  <button class="btn btn-icon rounded-circle btn-sm btn-primary text-white"
                    @click="updateTicket('akhwat', 1)"
                    :disabled="isMaxReached || isQuotaReached(remainingQuota.akhwat, formState.qtyAkhwat)">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

            </div>

            <div v-if="isMaxReached" class="mt-3 text-center">
              <span class="badge bg-warning-subtle text-warning border border-warning-subtle txt-caption fw-bold">
                <i class="bi bi-info-circle me-1"></i> Maksimal 4 tiket per akun
              </span>
            </div>
          </div>
        </div>

        <div v-if="totalTickets > 0" class="animate-slide-up">
          <form @submit.prevent="handleSubmit">
            <div v-for="(participant, index) in formState.participants" :key="index"
              class="card shadow-sm border-0 mb-3 rounded-4 overflow-hidden">
              
              <div v-if="index === 0" class="mb-4 p-3 bg-primary-subtle rounded-3 d-flex align-items-start gap-3 m-3 pb-3">
                <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style="width: 32px; height: 32px;">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div>
                  <h5 class="text-primary txt-body fw-bold d-block mb-1">Data Pemesan</h5>
                  <div class="txt-caption fw-bold text-muted mb-0">{{ user?.fullname }}</div>
                  <div class="txt-caption text-muted opacity-75">{{ user?.email }}</div>
                  <input type="hidden" v-model="participant.Email">
                </div>
              </div>

              <div
                class="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <span class="txt-label fw-bold text-primary text-uppercase ls-1">Peserta {{ index + 1 }}</span>
                <span class="badge rounded-pill txt-caption fw-bold"
                  :class="participant.Gender === 'Ikhwan' ? 'bg-info-subtle text-info-emphasis' : 'bg-danger-subtle text-danger-emphasis'">
                  {{ participant.Gender }}
                </span>
              </div>

              <div class="card-body p-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label txt-label fw-bold text-muted text-uppercase mb-1">Nama Lengkap</label>
                    <input type="text" class="form-control modern-input txt-body" v-model="participant.Name" required>
                  </div>

                  <div class="col-6">
                    <label class="form-label txt-label fw-bold text-muted text-uppercase mb-1">Usia</label>
                    <div class="input-group">
                      <input type="number" class="form-control modern-input txt-body" v-model="participant.Age" required min="5"
                        placeholder="0">
                      <span class="input-group-text bg-light border-start-0 text-muted txt-caption fw-bold"
                        style="border-color: #e9ecef;">Thn</span>
                    </div>
                  </div>

                  <div class="col-6">
                    <label class="form-label txt-label fw-bold text-muted text-uppercase mb-1">Domisili</label>
                    <input type="text" class="form-control modern-input txt-body" v-model="participant.Domicile" required
                      placeholder="Kota">
                  </div>
                </div>
              </div>
            </div>

            <div class="fixed-bottom-bar bg-white border-top shadow-lg p-3 rounded-top-4 mt-4">
              <div class="container d-flex justify-content-between align-items-center px-0 px-lg-3"
                style="max-width: 600px;">
                <div>
                  <span class="text-muted d-block txt-caption fw-bold mb-1">Total Pembayaran</span>
                  <span class="txt-title fw-bold text-primary lh-1">{{ formatCurrency(totalPrice) }}</span>
                </div>
                <button type="submit" class="btn btn-primary px-4 py-2 rounded-pill txt-body fw-bold shadow-sm"
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
      <h5 class="txt-subtitle fw-bold text-dark">Event Tidak Ditemukan</h5>
      <p class="text-muted txt-body">Silakan periksa kembali link atau kembali ke beranda.</p>
      <button @click="router.push('/')" class="btn btn-outline-primary rounded-pill px-4 mt-2 txt-body fw-bold shadow-sm">Ke Beranda</button>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Edit User' });
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '~/stores/event';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import { useAlert } from '~/utils/swal';
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
const { user } = useAuth();
const { alert: swalAlert, confirm: swalConfirm } = useAlert();

const eventSK = computed(() => route.params.id ? String(route.params.id) : '');
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
        const now = new Date().getTime();
        
        // apakah draf sudah lebih dari 24 jam (86400000 milidetik)
        const DRAFT_MAX_AGE = 86400000;
        // Kalau draf lama gak punya timestamp, kita anggap udah expired
        const isTooOld = parsed.timestamp ? (now - parsed.timestamp > DRAFT_MAX_AGE) : true; 
        
        // apakah event pendaftarannya sudah ditutup
        let isEventExpired = false;
        if (event.value?.Registration?.end_registration) {
          isEventExpired = dayjs().isAfter(dayjs(event.value.Registration.end_registration));
        }

        if (isTooOld || isEventExpired) {
          // BERSIIHKAN SAMPAH
          localStorage.removeItem(STORAGE_KEY.value);

        } else {
          // LOAD DRAF (Karena masih valid)
          if (parsed.qtyIkhwan) formState.qtyIkhwan = parsed.qtyIkhwan;
          if (parsed.qtyAkhwat) formState.qtyAkhwat = parsed.qtyAkhwat;
          if (parsed.participants) formState.participants = parsed.participants;
        }
      } catch (e) {
        console.error("Gagal memuat draf", e);
      
        localStorage.removeItem(STORAGE_KEY.value);
      }
    }
  }
});

watch(formState, (newVal) => {
  if (process.client) {
    const draftData = {
      ...newVal,
      timestamp: new Date().getTime() 
    };
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(draftData));
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

const remainingQuota = computed(() => {
  if (!event.value) return { ikhwan: 0, akhwat: 0, total: 0 };
  const getRemain = (quota: any, sold: any) => {
    if (quota === 'non-quota') return 'non-quota';
    const remain = Number(quota || 0) - Number(sold || 0);
    return remain > 0 ? remain : 0;
  };
  return {
    ikhwan: getRemain(event.value.Quota_Ikhwan, event.value.Sold_Ikhwan),
    akhwat: getRemain(event.value.Quota_Akhwat, event.value.Sold_Akhwat),
    total: getRemain(event.value.Quota_Total, event.value.Sold_Total)
  };
});

const getDynamicQuotaText = (quotaTotal: any, soldTotal: any, selectedQty: number) => {
  if (quotaTotal === 'non-quota') return 'Tanpa Batas Kuota';
  if (typeof quotaTotal === 'number' || !isNaN(Number(quotaTotal))) {
    const realRemaining = Number(quotaTotal) - Number(soldTotal || 0);
    const dynamicRemaining = realRemaining - selectedQty;
    return dynamicRemaining <= 0 ? 'Habis' : `Sisa: ${dynamicRemaining} Tiket`;
  }
  return 'Habis';
};

const getDynamicQuotaColor = (remain: any, selectedQty: number) => {
  if (remain === 'non-quota') return 'text-success';
  if (typeof remain === 'number') {
    const dynamicRemain = remain - selectedQty;
    if (dynamicRemain <= 0) return 'text-danger fw-bold';
    if (dynamicRemain < 5) return 'text-warning fw-bold';
    return 'text-muted';
  }
  return 'text-danger';
};

const isQuotaReached = (remain: any, selectedQty: number) => {
  if (remain === 'non-quota') return false;
  return selectedQty >= remain;
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
    if (typeof remainingQuota.value.ikhwan === 'number' && newVal > remainingQuota.value.ikhwan) return;
    if (newVal >= 0) formState.qtyIkhwan = newVal;
  } else {
    const newVal = formState.qtyAkhwat + change;
    if (typeof remainingQuota.value.akhwat === 'number' && newVal > remainingQuota.value.akhwat) return;
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
    if (!hasFilledUser && user.value) {
      hasFilledUser = true;
      return {
        Name: user.value.name || '',
        Email: user.value.email || '',
        Gender: gender,
        Age: user.value.Age || '',
        Domicile: user.value.domicile || ''
      }
    }
    return { Name: '', Email: '', Gender: gender, Age: '', Domicile: '' };
  }

  for (let i = 0; i < formState.qtyIkhwan; i++) {
    const existing = popExisting('Ikhwan');
    if (existing) {
      newParticipants.push(existing);
      if (existing.Email === user.value?.email) hasFilledUser = true;
    } else {
      newParticipants.push(createParticipant('Ikhwan'));
    }
  }

  for (let i = 0; i < formState.qtyAkhwat; i++) {
    const existing = popExisting('Akhwat');
    if (existing) {
      newParticipants.push(existing);
      if (existing.Email === user.value?.email) hasFilledUser = true;
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

  const userRole = (user.value?.role || user.value?.Role || "").toLowerCase();
  const isRegistrasi = userRole === 'registrasi';

  const conflictingTransaction = userStore.transactions.find(t => {
    const tEventSK = (t.SK || '').split('#')[0];
    if (tEventSK !== event.value!.SK) return false;
    const status = getSmartStatus(t);
    return status === 'PENDING';
  });

  if (conflictingTransaction && !isRegistrasi) {
    swalConfirm(
      'Sudah Terdaftar',
      'Anda memiliki tagihan aktif untuk event ini. Lanjutkan ke instruksi pembayaran?',
      'Lanjutkan Bayar'
    ).then(async (result) => {
      if (result.isConfirmed) {
        checkoutStore.isLoading = true;
        try {
          const isTransactionValid = await checkoutStore.checkExistingTransaction(conflictingTransaction.SK);
          
          if (isTransactionValid) {
            await checkoutStore.restoreTransactionData(conflictingTransaction.SK);
            checkoutStore.setStep('instructions'); 
            router.push('/checkout');
          } else {
            // Jika expired di Flip, arahkan untuk pilih bank ulang
            await checkoutStore.restoreTransactionData(conflictingTransaction.SK);
            router.push('/checkout');
          }
        } catch (error) {
          console.error("Gagal memulihkan transaksi:", error);
          swalAlert('Kesalahan', 'Gagal memulihkan data transaksi.', 'error');
        } finally {
          checkoutStore.isLoading = false;
        }
      }
    });
    return;
  }

  if (!formState.participants.every(p => p.Name && p.Age && p.Domicile)) {
    swalAlert('Data Belum Lengkap', 'Mohon isi semua data peserta sebelum melanjutkan.', 'warning');
    return;
  }

  if (process.client) {
    localStorage.removeItem(STORAGE_KEY.value);
  }

  const mainEmail = user.value?.email || formState.participants[0]?.Email || '';

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
    // 🟢 Notifikasi buat Event Gratis
    try {
      await userStore.registerEvent(registrationData);
      swalAlert('Berhasil!', 'Pendaftaran event berhasil dilakukan.', 'success').then(() => {
        router.push('/dashboard');
      });
    } catch (e) {
      swalAlert('Gagal', 'Terjadi kesalahan saat mendaftar.', 'error');
    }
  } else {
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