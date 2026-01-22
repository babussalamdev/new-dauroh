<template>
  <div class="bg-white min-vh-100 pb-5 font-blog">
    
    <div v-if="daurohStore.loading.detailPublic" class="container py-5 text-center d-flex align-items-center justify-content-center" style="min-height: 60vh;">
      <div>
         <div class="spinner-border text-dark mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
      </div>
    </div>

    <div v-else-if="!dauroh" class="container py-5 text-center d-flex align-items-center justify-content-center" style="min-height: 60vh;">
      <div>
        <h3 class="fw-bold text-dark mb-3">Konten Tidak Ditemukan</h3>
        <NuxtLink to="/" class="btn btn-dark rounded-pill px-5 fw-bold">Kembali ke Home</NuxtLink>
      </div>
    </div>

    <div v-else>
      
      <div class="container pt-5 pb-4 text-center" style="max-width: 900px;">
         <h1 class="display-5 fw-bold text-dark mb-3 lh-sm">{{ dauroh.Title }}</h1>
         
         <div class="d-flex justify-content-center align-items-center gap-3 text-secondary small text-uppercase ls-1 flex-wrap">
            <span><i class="bi bi-calendar3 me-1"></i> {{ formatDate(dauroh.Date) }}</span>
            <span class="text-light-gray d-none d-sm-inline">|</span>
            <span><i class="bi bi-geo-alt me-1"></i> {{ dauroh.Place }}</span>
         </div>
      </div>

      <div class="container pb-5">
        <div class="row justify-content-center g-5">
          
          <div class="col-lg-8">
            
            <div class="mb-5 rounded-4 overflow-hidden shadow-sm position-relative bg-light mx-auto border" style="max-width: 100%;">
               <div class="aspect-ratio-box">
                   <img 
                      v-if="dauroh.Picture"
                      :src="`${imgUrl}/${dauroh.SK}/${dauroh.Picture}.webp`" 
                      class="img-poster" 
                      :alt="dauroh.Title"
                      @error="onImageError"
                   >
                   <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted py-5">
                      <div class="text-center">
                         <i class="bi bi-image fs-1 opacity-25"></i>
                         <p class="small m-0 mt-2">Tidak ada gambar</p>
                      </div>
                   </div>
               </div>
            </div>

            <article class="blog-body ql-editor px-md-2">
               <div v-if="dauroh.Description" v-html="dauroh.Description"></div>
               <p v-else class="text-muted fst-italic text-center py-5 bg-light rounded-3">
                 Belum ada deskripsi lengkap untuk event ini.
               </p>
            </article>
          </div>
          <div class="col-lg-4 ps-lg-4">
             <div class="sticky-top" style="top: 100px; z-index: 10;">
                
                <div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 position-relative">
                   
                   <div class="position-absolute top-0 end-0 m-3">
                       
                   </div>

                   <div class="card-body p-4 pt-5 text-center">
                      <p class="text-muted x-small text-uppercase fw-bold mb-1 ls-1">Harga Tiket</p>
                      <h3 class="fw-bold text-primary mb-4">{{ formatCurrency(dauroh.Price) }}</h3>
                      
                      <button 
                        class="btn btn-dark w-100 rounded-pill py-3 fw-bold shadow-sm mb-3 transition-transform"
                        :disabled="!registrationStatus.canRegister"
                        @click="handleRegisterClick"
                      >
                        {{ registrationStatus.message }}
                      </button>

                      <div v-if="!registrationStatus.canRegister" class="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis x-small py-2 mb-0 rounded-3">
                         <i class="bi bi-info-circle me-1"></i> {{ registrationStatus.message }}
                      </div>
                      <span class="badge bg-light text-dark border px-3 py-2 rounded-pill text-uppercase x-small fw-bold shadow-sm">
                           {{ getGenderLabel(dauroh.Gender) }}
                       </span>
                   </div>
                   
                   <div class="card-footer bg-light p-3 text-center border-0 x-small text-muted">
                      Ada kendala? <a href="#" class="text-dark fw-bold text-decoration-none">Hubungi Admin</a>
                   </div>
                </div>

                <div class="card border-0 bg-soft-gray rounded-4 p-4">
                   <h6 class="fw-bold text-dark mb-4 x-small text-uppercase ls-1 border-bottom pb-2">Detail Event</h6>
                   <ul class="list-unstyled mb-0 d-flex flex-column gap-3 small text-secondary">
                      <li class="d-flex justify-content-between">
                         <span>Hari</span>
                         <span class="fw-bold text-dark">{{ getDayName(dauroh.Date) }}</span>
                      </li>
                      <li class="d-flex justify-content-between">
                         <span>Jam</span>
                         <span class="fw-bold text-dark">{{ getTimeRange(dauroh.Date) }}</span>
                      </li>
                      
                      <template v-if="showTotal">
                         <li class="d-flex justify-content-between align-items-center">
                             <span>Sisa Kuota</span>
                             <span class="fw-bold text-dark">{{ formatQuota(dauroh.Quota_Total) }}</span>
                         </li>
                      </template>
                      
                      <template v-else>
                         <li v-if="showIkhwan" class="d-flex justify-content-between align-items-center">
                            <span>Kuota Ikhwan</span>
                            <span class="fw-bold text-dark">{{ formatQuota(dauroh.Quota_Ikhwan) }}</span>
                         </li>
                         <li v-if="showAkhwat" class="d-flex justify-content-between align-items-center">
                            <span>Kuota Akhwat</span>
                            <span class="fw-bold text-dark">{{ formatQuota(dauroh.Quota_Akhwat) }}</span>
                         </li>
                      </template>

                   </ul>
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
import { useDaurohStore } from '~/stores/dauroh';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import 'quill/dist/quill.snow.css'; 

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const { isLoggedIn } = useAuth();
const config = useRuntimeConfig();

const daurohSK = String(route.params.id);
const imgUrl = ref(config.public.img || '');
const currentUrl = ref('');

const dauroh = computed(() => daurohStore.currentPublicDaurohDetail);

const getGenderLabel = (g: string) => {
    if (!g) return 'Umum';
    return g.includes('ikhwan, akhwat') ? 'Ikhwan, Akhwat' : g;
};

// Logic tampilan kuota (sama seperti sebelumnya)
const showTotal = computed(() => {
    if (!dauroh.value) return false;
    const g = dauroh.value.Gender?.toLowerCase() || '';
    if (dauroh.value.Quota_Total === 'non-quota') return true;
    return g === 'umum' || (!g.includes('ikhwan') && !g.includes('akhwat'));
});

const showIkhwan = computed(() => {
    const g = dauroh.value?.Gender?.toLowerCase() || '';
    return g.includes('ikhwan') || g.includes('laki') || g.includes('pria') || g.includes('ikhwan, akhwat'); 
});

const showAkhwat = computed(() => {
    const g = dauroh.value?.Gender?.toLowerCase() || '';
    return g.includes('akhwat') || g.includes('perempuan') || g.includes('wanita') || g.includes('ikhwan, akhwat');
});

// --- [REVISI PENTING] LOGIC TOMBOL DAFTAR ---
const registrationStatus = computed(() => {
  const d = dauroh.value;
  if (!d) return { canRegister: false, message: 'Loading...' };
  
  if (d.Status !== 'active') return { canRegister: false, message: 'Event Selesai / Tutup' };
  
  // 1. Cek Unlimited
  if (d.Quota_Total === 'non-quota') {
     return { canRegister: true, message: 'Daftar Sekarang' };
  }

  // 2. Logic Pengecekan Kuota (FIX BUG KUOTA PENUH)
  // Cek apakah SALAH SATU slot masih tersedia (> 0)
  const qTotal = Number(d.Quota_Total || 0);
  const qIkhwan = Number(d.Quota_Ikhwan || 0);
  const qAkhwat = Number(d.Quota_Akhwat || 0);

  // Jika Total masih ada, ATAU Ikhwan masih ada, ATAU Akhwat masih ada
  if (qTotal > 0 || qIkhwan > 0 || qAkhwat > 0) {
     return { canRegister: true, message: 'Daftar Sekarang' };
  }
  
  // Jika semua benar-benar habis
  return { canRegister: false, message: 'Kuota Penuh' };
});

onMounted(() => {
  currentUrl.value = window.location.href;
  if (daurohSK) {
    daurohStore.fetchPublicDaurohDetail(daurohSK);
  }
});

watch(dauroh, (newVal) => {
  if (newVal) {
    useHead({
      title: `${newVal.Title} - Babussalam Event`,
    });
  }
});

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).style.display = 'none';
};

const formatCurrency = (val: number | string) => {
  if (!val || Number(val) === 0) return 'GRATIS';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val));
};

const formatDate = (dateObj: any) => {
  if (!dateObj || typeof dateObj !== 'object') return 'Akan Datang';
  const rawDates = Object.values(dateObj).map((d: any) => d?.date).filter(Boolean) as string[];
  if (rawDates.length === 0 || !rawDates[0]) return 'Akan Datang';
  
  return new Date(rawDates[0]).toLocaleDateString('id-ID', { 
     day: 'numeric', month: 'long', year: 'numeric' 
  });
};

const getDayName = (dateObj: any) => {
  if (!dateObj) return '-';
  const rawDates = Object.values(dateObj).map((d: any) => d?.date).filter(Boolean) as string[];
  if (rawDates.length === 0 || !rawDates[0]) return '-';
  
  return new Date(rawDates[0]).toLocaleDateString('id-ID', { weekday: 'long' });
};

const getTimeRange = (dateObj: any) => {
  if (!dateObj) return '-';
  const first = Object.values(dateObj)[0] as any;
  if (!first) return '-';
  const s = first.start_time?.substring(0,5) || '??';
  const e = first.end_time?.substring(0,5) || '??';
  return `${s} - ${e} WIB`;
};

const formatQuota = (val: string | number) => {
    if (val === 'non-quota') return 'Tanpa Batas';
    if (val === 0 || val === '0') return '0 (Penuh)';
    if (!val) return '-';
    return `${val} Orang`;
};

const handleRegisterClick = () => {
  if (!isLoggedIn.value) {
    router.push(`/login?redirect=/dauroh/${daurohSK}`);
  } else {
    router.push(`/dauroh/register/${daurohSK}`);
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(currentUrl.value);
  alert('Link tersalin!');
};
</script>

<style scoped>
.font-blog {
  font-family: 'Georgia', 'Times New Roman', serif;
}
.font-blog h1, .font-blog h2, .font-blog h3, .font-blog h4, .font-blog h5, .font-blog h6, 
.font-blog .btn, .font-blog .badge, .font-blog .ls-1, .font-blog .x-small, .font-blog small, 
.font-blog .card-body, .font-blog .nav-link {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.bg-soft-gray { background-color: #f8f9fa; }
.text-light-gray { color: #ddd; }
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.75rem; }

.aspect-ratio-box {
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: #f8f9fa;
    padding: 1rem;
}

.img-poster {
    max-width: 100%;
    height: auto;
    max-height: 450px; 
    object-fit: contain; 
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

/* QUILL CONTENT STYLING */
:deep(.blog-body) {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #212529;
}
:deep(.blog-body img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 2rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
:deep(.blog-body p) { margin-bottom: 1.5rem; }
:deep(.blog-body ul), :deep(.blog-body ol) { padding-left: 1.5rem; margin-bottom: 1.5rem; }
:deep(.blog-body li) { margin-bottom: 0.5rem; }
:deep(.blog-body h2) { font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.6rem; }

.transition-transform { transition: transform 0.2s; }
.transition-transform:hover { transform: translateY(-2px); }
</style>