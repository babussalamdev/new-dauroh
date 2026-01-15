<template>
  <div class="container py-5">
    
    <div 
      v-if="daurohStore.loading.detailPublic || (dauroh && String(dauroh.SK) !== String(daurohSK))" 
      class="text-center py-5"
    >
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted small letter-spacing-1">MEMUAT DATA EVENT...</p>
    </div>

    <div v-else-if="dauroh" class="row justify-content-center">
      <div class="col-lg-7 col-xl-6">
        
        <div class="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden position-relative">
          <div class="card-body p-0">
            <div class="d-flex bg-white p-4 align-items-center gap-4">
               <div class="flex-shrink-0 position-relative">
                  <img 
                    :src="dauroh.Picture ? `${imgBaseUrl}/${dauroh.SK}/${dauroh.Picture}.webp` : '/img/placeholder.jpg'" 
                    class="rounded-3 shadow-sm" 
                    style="width: 90px; height: 90px; object-fit: cover;"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  >
               </div>
               <div class="flex-grow-1">
                 <h5 class="fw-bold mb-1 text-dark">{{ dauroh.Title }}</h5>
                 <div class="d-flex flex-wrap gap-3 text-muted x-small mt-2">
                    <span class="d-flex align-items-center gap-1"><i class="bi bi-geo-alt-fill text-danger"></i> {{ dauroh.Place }}</span>
                    <span class="d-flex align-items-center gap-1"><i class="bi bi-tag-fill text-primary"></i> {{ formatCurrency(dauroh.Price) }}</span>
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
               
               <div v-if="canShowIkhwan" class="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center transition-hover">
                  <div>
                    <span class="fw-bold text-dark d-block">Tiket Ikhwan</span>
                    <small class="x-small" :class="getDynamicQuotaColor(quotaInfo.ikhwan, formState.qtyIkhwan)">
                       {{ getDynamicQuotaText(quotaInfo.ikhwan, formState.qtyIkhwan) }}
                    </small>
                  </div>
                  <div class="counter-input d-flex align-items-center bg-white rounded-pill shadow-sm border p-1">
                     <button class="btn btn-icon rounded-circle btn-sm" @click="updateTicket('ikhwan', -1)" :disabled="formState.qtyIkhwan <= 0">
                        <i class="bi bi-dash"></i>
                     </button>
                     <input type="text" class="form-control border-0 text-center fw-bold p-0 mx-1" style="width: 40px; background: transparent;" :value="formState.qtyIkhwan" readonly>
                     <button class="btn btn-icon rounded-circle btn-sm btn-primary text-white" 
                        @click="updateTicket('ikhwan', 1)" 
                        :disabled="isMaxReached || isQuotaReached(quotaInfo.ikhwan, formState.qtyIkhwan)">
                        <i class="bi bi-plus"></i>
                     </button>
                  </div>
               </div>

               <div v-if="canShowAkhwat" class="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center transition-hover">
                  <div>
                    <span class="fw-bold text-dark d-block">Tiket Akhwat</span>
                    <small class="x-small" :class="getDynamicQuotaColor(quotaInfo.akhwat, formState.qtyAkhwat)">
                       {{ getDynamicQuotaText(quotaInfo.akhwat, formState.qtyAkhwat) }}
                    </small>
                  </div>
                  <div class="counter-input d-flex align-items-center bg-white rounded-pill shadow-sm border p-1">
                     <button class="btn btn-icon rounded-circle btn-sm" @click="updateTicket('akhwat', -1)" :disabled="formState.qtyAkhwat <= 0">
                        <i class="bi bi-dash"></i>
                     </button>
                     <input type="text" class="form-control border-0 text-center fw-bold p-0 mx-1" style="width: 40px; background: transparent;" :value="formState.qtyAkhwat" readonly>
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
          <h6 class="fw-bold mb-3 px-1">Data Peserta</h6>
          
          <form @submit.prevent="handleSubmit">
            <div v-for="(participant, index) in formState.participants" :key="index" class="card shadow-sm border-0 mb-3 rounded-4 overflow-hidden">
              <div class="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <span class="fw-bold text-primary small text-uppercase ls-1">Peserta {{ index + 1 }}</span>
                <span class="badge rounded-pill" :class="participant.Gender === 'Ikhwan' ? 'bg-info-subtle text-info-emphasis' : 'bg-danger-subtle text-danger-emphasis'">
                   {{ participant.Gender }}
                </span>
              </div>
              
              <div class="card-body p-4">
                <div v-if="index === 0" class="mb-4 p-3 bg-primary-subtle rounded-3 d-flex align-items-start gap-3">
                   <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                      <i class="bi bi-person-fill"></i>
                   </div>
                   <div>
                      <small class="text-primary fw-bold d-block">Data Akun Pendaftar</small>
                      <div class="small text-muted mb-1">{{ userStore.user?.fullname }}</div>
                      <div class="x-small text-muted opacity-75">{{ userStore.user?.email }}</div>
                      <input type="hidden" v-model="participant.Email"> 
                   </div>
                </div>

                <div class="row g-3">
                   <div class="col-12">
                     <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Nama Lengkap</label>
                     <input type="text" class="form-control modern-input" v-model="participant.Name" required>
                   </div>
                   
                   <div class="col-6">
                     <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Usia</label>
                     <div class="input-group">
                        <input type="number" class="form-control modern-input" v-model="participant.Age" required min="5" placeholder="0">
                        <span class="input-group-text bg-light border-start-0 text-muted x-small" style="border-color: #e9ecef;">Thn</span>
                     </div>
                   </div>

                   <div class="col-6">
                      <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Domisili</label>
                      <input type="text" class="form-control modern-input" v-model="participant.Domicile" required placeholder="Kota">
                   </div>
                </div>
              </div>
            </div>

            <div class="fixed-bottom-bar bg-white border-top shadow-lg p-3 rounded-top-4 mt-4">
               <div class="container d-flex justify-content-between align-items-center px-0 px-lg-3" style="max-width: 600px;">
                  <div>
                    <small class="text-muted d-block x-small">Total Pembayaran</small>
                    <span class="fs-4 fw-bold text-primary lh-1">{{ formatCurrency(totalPrice) }}</span>
                  </div>
                  <button 
                    type="submit" 
                    class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
                    :disabled="totalTickets === 0"
                  >
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
import { useDaurohStore } from '~/stores/dauroh';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';
import dayjs from 'dayjs'; 

definePageMeta({
  middleware: (to, from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/login');
  }
});

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const checkoutStore = useCheckoutStore();
const userStore = useUserStore(); // REVISI 1: Panggil User Store
const config = useRuntimeConfig();

const daurohSK = computed(() => String(route.params.id));

const imgBaseUrl = ref(config.public.img || '');
const dauroh = computed(() => daurohStore.currentPublicDaurohDetail);

const formState = reactive({
  qtyIkhwan: 0,
  qtyAkhwat: 0,
  participants: [] as any[]
});

const STORAGE_KEY = computed(() => `dauroh_reg_draft_${daurohSK.value}`);

onMounted(async () => {
  // Pastikan profile user ter-load biar bisa auto-fill
  if (!userStore.user) {
      await userStore.fetchUserProfile();
  }
  
  // FIX: Selalu panggil fetchUserProfile untuk memastikan data sinkron dengan sesi aktif
  // Timpa pengecekan di atas, atau cukup panggil langsung:
  await userStore.fetchUserProfile(); 

  if (process.client) { 
    const saved = localStorage.getItem(STORAGE_KEY.value);
    if (saved) {
      // ... logic load draft ...
    }
  }
});

watch(formState, (newVal) => {
  if (process.client) {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(newVal));
  }
}, { deep: true });

watch(daurohSK, async (newSk) => {
  if (newSk) {
    if (!process.client || !localStorage.getItem(`dauroh_reg_draft_${newSk}`)) {
      formState.qtyIkhwan = 0;
      formState.qtyAkhwat = 0;
      formState.participants = [];
    }
    await daurohStore.fetchPublicDaurohDetail(newSk);
  }
}, { immediate: true });

// --- HELPERS ---
const canShowIkhwan = computed(() => {
  if (!dauroh.value) return false;
  const g = dauroh.value.Gender?.toLowerCase() || '';
  return g.includes('ikhwan') || g.includes('ikhwan, akhwat');
});

const canShowAkhwat = computed(() => {
  if (!dauroh.value) return false;
  const g = dauroh.value.Gender?.toLowerCase() || '';
  return g.includes('akhwat') || g.includes('ikhwan, akhwat');
});

const quotaInfo = computed(() => {
  if (!dauroh.value) return { ikhwan: 0, akhwat: 0, total: 0 };
  return {
    ikhwan: dauroh.value.Quota_Ikhwan,
    akhwat: dauroh.value.Quota_Akhwat,
    total: dauroh.value.Quota_Total
  };
});

// REVISI 2: Logic Sisa Tiket Realtime (Visual Only)
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
        if (remaining < 5) return 'text-warning fw-bold'; // Warn if running low
        return 'text-muted';
    }
    return 'text-danger';
};

const isQuotaReached = (quotaTotal: any, selectedQty: number) => {
    if (quotaTotal === 'non-quota') return false;
    return selectedQty >= quotaTotal;
}
// End Revisi 2

const soldOutMessage = ref("Mohon maaf, kuota tiket sudah habis.");

const isSoldOut = computed(() => {
    if(!dauroh.value) return false;

    if (dauroh.value.Status === 'inactive') {
      soldOutMessage.value = "Pendaftaran ditutup (Non-Aktif).";
      return true;
    }

    if (dauroh.value.Date) {
       const dates = Object.values(dauroh.value.Date);
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
        const q = dauroh.value.Quota_Ikhwan;
        if (q === 'non-quota' || (typeof q === 'number' && q > 0)) {
            ikhwanAvailable = true;
        }
    }

    let akhwatAvailable = false;
    if (canShowAkhwat.value) {
        const q = dauroh.value.Quota_Akhwat;
        if (q === 'non-quota' || (typeof q === 'number' && q > 0)) {
            akhwatAvailable = true;
        }
    }

    if (ikhwanAvailable || akhwatAvailable) return false;

    soldOutMessage.value = "Mohon maaf, kuota tiket sudah habis.";
    return true;
});

const totalTickets = computed(() => formState.qtyIkhwan + formState.qtyAkhwat);
const totalPrice = computed(() => (dauroh.value?.Price || 0) * totalTickets.value);
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
    if (idx !== -1) {
      return oldParticipants.splice(idx, 1)[0];
    }
    return null;
  };

  // Logic Generate Form
  let hasFilledUser = false; // Flag biar user store cuma dipake sekali di index 0

  const createParticipant = (gender: string) => {
      // REVISI 1: Cek apakah ini peserta pertama yang digenerate?
      // Jika ya, ambil data dari User Store
      if (!hasFilledUser && userStore.user) {
          hasFilledUser = true;
          return {
              Name: userStore.user.fullname || '',
              Email: userStore.user.email || '', // Email masuk ke state tapi input hidden
              Gender: gender,
              Age: '',
              Domicile: ''
          }
      }
      return { Name: '', Email: '', Gender: gender, Age: '', Domicile: '' };
  }

  // Loop Ikhwan
  for (let i = 0; i < formState.qtyIkhwan; i++) {
    const existing = popExisting('Ikhwan');
    if (existing) {
       newParticipants.push(existing);
       if(existing.Email === userStore.user?.email) hasFilledUser = true; // Mark used if existing matches
    } else {
       newParticipants.push(createParticipant('Ikhwan'));
    }
  }

  // Loop Akhwat
  for (let i = 0; i < formState.qtyAkhwat; i++) {
    const existing = popExisting('Akhwat');
    if (existing) {
       newParticipants.push(existing);
       if(existing.Email === userStore.user?.email) hasFilledUser = true;
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

const handleSubmit = () => {
  if (!dauroh.value || !dauroh.value.SK) return;
  
  if (process.client) {
    localStorage.removeItem(STORAGE_KEY.value);
  }

  // REVISI 1: Logic Email
  // Ambil email dari User Store (Logged In User) sebagai Main Email
  const mainEmail = userStore.user?.email || formState.participants[0]?.Email;
  
  const finalParticipants = formState.participants.map((p) => ({
    ...p,
    // Semua peserta pakai email akun utama
    Email: mainEmail,
    Age: Number(p.Age)
  }));

  const registrationData = {
    dauroh: {
        ...dauroh.value,
        SK: dauroh.value.SK as string 
    },
    participants: finalParticipants as any[] 
  };

  if ((dauroh.value.Price || 0) === 0) {
    userStore.registerDauroh(registrationData);
    router.push('/dashboard');
  } else {
    checkoutStore.startCheckout(registrationData);
    router.push('/checkout/select');
  }
};
</script>

<style scoped>
/* Modern Styles */
.letter-spacing-1 { letter-spacing: 1px; }
.ls-1 { letter-spacing: 0.5px; }
.x-small { font-size: 0.8rem; }
.bg-light-subtle { background-color: #f8f9fa; }

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

/* Animations */
.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Sticky Bottom Bar on Mobile */
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