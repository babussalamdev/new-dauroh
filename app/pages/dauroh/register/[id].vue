<template>
  <div class="container py-5">
    
    <div 
      v-if="daurohStore.loading.detailPublic || (dauroh && String(dauroh.SK) !== String(daurohSK))" 
      class="text-center py-5"
    >
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Memuat data event...</p>
    </div>

    <div v-else-if="dauroh" class="row justify-content-center">
      <div class="col-lg-8">
        
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-3 mb-3">
              <img 
                :src="dauroh.Picture ? `${imgBaseUrl}/${dauroh.SK}/${dauroh.Picture}.webp` : '/img/placeholder.jpg'" 
                class="rounded" 
                style="width: 80px; height: 80px; object-fit: cover;"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
              <div>
                <h4 class="fw-bold mb-1">{{ dauroh.Title }}</h4>
                <p class="text-muted mb-0 small">
                  <i class="bi bi-geo-alt me-1"></i> {{ dauroh.Place }} | 
                  <i class="bi bi-cash me-1"></i> {{ formatCurrency(dauroh.Price) }}
                </p>
              </div>
            </div>
            
            <div v-if="isSoldOut" class="alert alert-danger mb-0">
              Mohon maaf, kuota tiket sudah habis.
            </div>
          </div>
        </div>

        <div v-if="!isSoldOut" class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h5 class="mb-3 fw-bold">Pilih Tiket</h5>
            
            <div class="dropdown">
              <button 
                class="btn btn-outline-primary w-100 d-flex justify-content-between align-items-center py-3 px-4 dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                data-bs-auto-close="outside"
              >
                <span>
                  <i class="bi bi-ticket-perforated me-2"></i>
                  {{ totalTickets > 0 ? `${totalTickets} Tiket Dipilih` : 'Pilih Jumlah Tiket' }}
                </span>
                <span class="fw-bold">{{ formatCurrency(totalPrice) }}</span>
              </button>

              <div class="dropdown-menu w-100 p-3 shadow mt-2 border-0">
                <div class="d-flex flex-column gap-3">
                  
                  <div v-if="canShowIkhwan" class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="d-block fw-bold">Tiket Ikhwan</span>
                      <small class="text-muted" v-if="quotaInfo.ikhwan > 0">Sisa: {{ quotaInfo.ikhwan }}</small>
                      <small class="text-success" v-else>Tanpa Kuota</small>
                    </div>
                    <div class="input-group w-auto">
                      <button class="btn btn-sm btn-outline-secondary" @click="updateTicket('ikhwan', -1)" :disabled="formState.qtyIkhwan <= 0">-</button>
                      <input type="text" class="form-control form-control-sm text-center" style="width: 50px;" :value="formState.qtyIkhwan" readonly>
                      <button class="btn btn-sm btn-outline-secondary" @click="updateTicket('ikhwan', 1)" :disabled="isMaxReached || (quotaInfo.ikhwan > 0 && formState.qtyIkhwan >= quotaInfo.ikhwan)">+</button>
                    </div>
                  </div>

                  <div v-if="canShowAkhwat" class="d-flex justify-content-between align-items-center">
                     <div>
                      <span class="d-block fw-bold">Tiket Akhwat</span>
                      <small class="text-muted" v-if="quotaInfo.akhwat > 0">Sisa: {{ quotaInfo.akhwat }}</small>
                      <small class="text-success" v-else>Tanpa Kuota</small>
                    </div>
                    <div class="input-group w-auto">
                      <button class="btn btn-sm btn-outline-secondary" @click="updateTicket('akhwat', -1)" :disabled="formState.qtyAkhwat <= 0">-</button>
                      <input type="text" class="form-control form-control-sm text-center" style="width: 50px;" :value="formState.qtyAkhwat" readonly>
                      <button class="btn btn-sm btn-outline-secondary" @click="updateTicket('akhwat', 1)" :disabled="isMaxReached || (quotaInfo.akhwat > 0 && formState.qtyAkhwat >= quotaInfo.akhwat)">+</button>
                    </div>
                  </div>

                </div>
                
                <div class="border-top mt-3 pt-2">
                  <small class="text-danger fst-italic" v-if="isMaxReached">*Maksimal 4 tiket per akun</small>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div v-if="totalTickets > 0" class="animate-fade-in">
          <h5 class="mb-3 fw-bold">Data Peserta</h5>
          
          <form @submit.prevent="handleSubmit">
            <div v-for="(participant, index) in formState.participants" :key="index" class="card shadow-sm border-0 mb-3">
              <div class="card-header bg-light py-2">
                <span class="fw-bold text-primary">Peserta {{ index + 1 }}</span>
                <span class="badge bg-secondary ms-2">{{ participant.gender }}</span>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small">Nama Lengkap *</label>
                    <input type="text" class="form-control" v-model="participant.name" required placeholder="Sesuai KTP">
                  </div>
                  
                  <div class="col-md-6" v-if="index === 0">
                    <label class="form-label small">Email *</label>
                    <input type="email" class="form-control" v-model="participant.email" required placeholder="email@contoh.com">
                    <small class="text-muted d-block" style="font-size: 0.7rem;">Tiket akan dikirim ke email ini.</small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small">Usia *</label>
                    <input type="number" class="form-control" v-model="participant.age" required min="5" placeholder="Tahun">
                  </div>

                  <div class="col-md-6">
                     <label class="form-label small">Domisili *</label>
                    <input type="text" class="form-control" v-model="participant.domicile" required placeholder="Kota Tinggal">
                  </div>
                </div>
              </div>
            </div>

            <div class="card shadow-sm border-0 mt-4">
              <div class="card-body p-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                <div class="w-100 w-sm-auto text-center text-sm-start">
                  <small class="text-muted d-block">Total Pembayaran</small>
                  <span class="fs-4 fw-bold text-primary">{{ formatCurrency(totalPrice) }}</span>
                </div>
                <button 
                  type="submit" 
                  class="btn btn-primary px-4 py-2 rounded-pill fw-bold w-100 w-sm-auto"
                >
                  Lanjut Pembayaran <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
            
          </form>
        </div>

      </div>
    </div>

    <div v-else class="text-center py-5">
      <h3>Event Tidak Ditemukan</h3>
      <p class="text-muted">Data event tidak tersedia atau ID salah.</p>
      <button @click="router.push('/')" class="btn btn-secondary mt-3">Kembali ke Beranda</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDaurohStore } from '~/stores/dauroh';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';

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
const userStore = useUserStore();
const config = useRuntimeConfig();

const daurohSK = computed(() => String(route.params.id));

const imgBaseUrl = ref(config.public.img || '');
const dauroh = computed(() => daurohStore.currentPublicDaurohDetail);

const formState = reactive({
  qtyIkhwan: 0,
  qtyAkhwat: 0,
  participants: [] as any[]
});

// Watch computed daurohSK agar reaktif
watch(daurohSK, async (newSk) => {
  if (newSk) {
    formState.qtyIkhwan = 0;
    formState.qtyAkhwat = 0;
    formState.participants = [];
    // Pastikan fetch dilakukan
    await daurohStore.fetchPublicDaurohDetail(newSk);
  }
}, { immediate: true });

// --- COMPUTED HELPERS ---
const canShowIkhwan = computed(() => {
  if (!dauroh.value) return false;
  const g = dauroh.value.Gender?.toLowerCase() || '';
  return g.includes('ikhwan') || g.includes('umum');
});

const canShowAkhwat = computed(() => {
  if (!dauroh.value) return false;
  const g = dauroh.value.Gender?.toLowerCase() || '';
  return g.includes('akhwat') || g.includes('umum');
});

const quotaInfo = computed(() => {
  if (!dauroh.value) return { ikhwan: 0, akhwat: 0, total: 0 };
  return {
    ikhwan: Number(dauroh.value.Quota_Ikhwan || 0),
    akhwat: Number(dauroh.value.Quota_Akhwat || 0),
    total: Number(dauroh.value.Quota_Total || 0)
  };
});

const totalTickets = computed(() => formState.qtyIkhwan + formState.qtyAkhwat);
const totalPrice = computed(() => (dauroh.value?.Price || 0) * totalTickets.value);
const isMaxReached = computed(() => totalTickets.value >= 4);

const isSoldOut = computed(() => {
    if(!dauroh.value) return false;
    if (quotaInfo.value.total > 0 && quotaInfo.value.total <= 0) return true; 
    return false;
});

// --- METHODS ---

const updateTicket = (type: 'ikhwan' | 'akhwat', change: number) => {
  if (change > 0 && isMaxReached.value) return;

  if (type === 'ikhwan') {
    const newVal = formState.qtyIkhwan + change;
    if (quotaInfo.value.ikhwan > 0 && newVal > quotaInfo.value.ikhwan) return;
    if (newVal >= 0) formState.qtyIkhwan = newVal;
  } else {
    const newVal = formState.qtyAkhwat + change;
    if (quotaInfo.value.akhwat > 0 && newVal > quotaInfo.value.akhwat) return;
    if (newVal >= 0) formState.qtyAkhwat = newVal;
  }

  generateForms();
};

const generateForms = () => {
  const newParticipants: any[] = []; 

  for (let i = 0; i < formState.qtyIkhwan; i++) {
    const existing = formState.participants.find((p: any) => p.gender === 'Ikhwan' && !newParticipants.includes(p));
    if (existing) {
       newParticipants.push(existing);
    } else {
       newParticipants.push({ name: '', email: '', gender: 'Ikhwan', age: '', domicile: '' });
    }
  }

  for (let i = 0; i < formState.qtyAkhwat; i++) {
    const existing = formState.participants.find((p: any) => p.gender === 'Akhwat' && !newParticipants.includes(p));
    if (existing) {
       newParticipants.push(existing);
    } else {
       newParticipants.push({ name: '', email: '', gender: 'Akhwat', age: '', domicile: '' });
    }
  }

  formState.participants = newParticipants;
};

const formatCurrency = (val: number) => {
  if (!val) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

const handleSubmit = () => {
  if (!dauroh.value) return;

  // Copy email peserta pertama ke peserta lain (sebagai default jika backend mewajibkan)
  const mainEmail = formState.participants[0]?.email;
  const finalParticipants = formState.participants.map((p, i) => ({
    ...p,
    email: (i === 0) ? p.email : mainEmail // Peserta 2-4 pakai email peserta 1
  }));

  const registrationData = {
    dauroh: dauroh.value!,
    participants: finalParticipants
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
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-menu {
  min-width: 280px;
}
.input-group button {
  width: 35px;
}
</style>