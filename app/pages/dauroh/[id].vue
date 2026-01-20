<template>
  <div class="bg-white min-vh-100 pb-5 font-blog">
    
    <div v-if="daurohStore.loading.detailPublic" class="container py-5 text-center" style="min-height: 50vh;">
      <div class="spinner-border text-dark" role="status"></div>
      <p class="mt-3 text-muted ls-1 small text-uppercase">Memuat Artikel...</p>
    </div>

    <div v-else-if="!dauroh" class="container py-5 text-center">
      <div class="py-5">
        <h3 class="fw-bold text-dark">Konten Tidak Ditemukan</h3>
        <NuxtLink to="/" class="btn btn-outline-dark rounded-pill mt-3 px-4">Kembali ke Home</NuxtLink>
      </div>
    </div>

    <div v-else>
      
      <div class="container pt-5 pb-4 text-center" style="max-width: 900px;">
         <span class="badge bg-light text-dark border mb-3 px-3 py-2 rounded-pill text-uppercase ls-1 x-small fw-bold">
            {{ dauroh.Gender === 'ikhwan, akhwat' ? 'Umum' : dauroh.Gender }}
         </span>
         
         <h1 class="display-5 fw-bold text-dark mb-3 lh-sm">{{ dauroh.Title }}</h1>
         
         <div class="d-flex justify-content-center align-items-center gap-3 text-muted small text-uppercase ls-1">
            <span><i class="bi bi-calendar3 me-1"></i> {{ formatDate(dauroh.Date) }}</span>
            <span class="text-light-gray">|</span>
            <span><i class="bi bi-geo-alt me-1"></i> {{ dauroh.Place }}</span>
         </div>
      </div>

      <div class="container pb-5">
        <div class="row justify-content-center">
          
          <div class="col-lg-8">
            
            <div class="mb-5 rounded-4 overflow-hidden shadow-sm position-relative bg-light">
               <img 
                  v-if="dauroh.Picture"
                  :src="`${imgUrl}/${dauroh.SK}/${dauroh.Picture}.webp`" 
                  class="w-100 h-auto d-block" 
                  :alt="dauroh.Title"
                  @error="onImageError"
               >
               <div v-else class="py-5 text-center text-muted bg-light">
                  <i class="bi bi-image fs-1 opacity-25"></i>
               </div>
            </div>

            <article class="blog-body ql-editor px-md-3">
               <div v-if="dauroh.Description" v-html="dauroh.Description"></div>
               <p v-else class="text-muted fst-italic text-center py-4">
                 Belum ada deskripsi lengkap untuk event ini.
               </p>
            </article>

            <div class="mt-5 pt-4 border-top px-md-3">
               <div class="d-flex align-items-center gap-2">
                  <span class="fw-bold small text-uppercase me-2">Bagikan:</span>
                  <button class="btn btn-sm btn-light rounded-circle" @click="copyLink" title="Salin Link"><i class="bi bi-link-45deg"></i></button>
                  <a :href="`https://wa.me/?text=${encodeURIComponent(dauroh.Title + ' ' + currentUrl)}`" target="_blank" class="btn btn-sm btn-success rounded-circle text-white"><i class="bi bi-whatsapp"></i></a>
               </div>
            </div>

          </div>

          <div class="col-lg-4 mt-5 mt-lg-0 ps-lg-5">
             <div class="sticky-top" style="top: 100px;">
                
                <div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                   <div class="card-body p-4 text-center">
                      <p class="text-muted x-small text-uppercase fw-bold mb-1">Tiket / Infaq</p>
                      <h3 class="fw-bold text-primary mb-4">{{ formatCurrency(dauroh.Price) }}</h3>
                      
                      <button 
                        class="btn btn-dark w-100 rounded-pill py-3 fw-bold shadow-sm mb-3"
                        :disabled="!registrationStatus.canRegister"
                        @click="handleRegisterClick"
                      >
                        {{ registrationStatus.message }}
                      </button>

                      <div v-if="!registrationStatus.canRegister" class="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis x-small py-2 mb-0">
                         <i class="bi bi-info-circle me-1"></i> Pendaftaran belum dibuka / penuh.
                      </div>
                   </div>
                   <div class="card-footer bg-light p-3 text-center border-0 x-small">
                      Ada kendala? <a href="#" class="text-dark fw-bold">Hubungi Admin</a>
                   </div>
                </div>

                <div class="card border-0 bg-soft-gray rounded-4 p-4">
                   <h6 class="fw-bold text-dark mb-3 x-small text-uppercase">Detail Waktu</h6>
                   <ul class="list-unstyled mb-0 d-flex flex-column gap-3 small text-secondary">
                      <li class="d-flex justify-content-between border-bottom pb-2">
                         <span>Hari</span>
                         <span class="fw-bold text-dark">{{ getDayName(dauroh.Date) }}</span>
                      </li>
                      <li class="d-flex justify-content-between border-bottom pb-2">
                         <span>Jam</span>
                         <span class="fw-bold text-dark">{{ getTimeRange(dauroh.Date) }}</span>
                      </li>
                      <li class="d-flex justify-content-between">
                         <span>Kuota</span>
                         <span class="fw-bold text-dark">{{ getQuotaDisplay(dauroh) }}</span>
                      </li>
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
// Import CSS Quill agar output HTML (ul, ol, bold) tampil benar
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

onMounted(() => {
  currentUrl.value = window.location.href;
  if (daurohSK) {
    daurohStore.fetchPublicDaurohDetail(daurohSK);
  }
});

// --- SEO Title ---
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
  if (!dateObj || typeof dateObj !== 'object') return 'Jadwal Menyusul';
  const rawDates = Object.values(dateObj).map((d: any) => d?.date).filter(Boolean) as string[];
  if (rawDates.length === 0 || !rawDates[0]) return 'Jadwal Menyusul';
  
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

const getQuotaDisplay = (d: any) => {
  if (!d) return '-';
  if (d.Quota_Total === 'non-quota') return 'Tanpa Batas';
  return `${d.Quota_Total}`;
};

const registrationStatus = computed(() => {
  if (!dauroh.value) return { canRegister: false, message: 'Loading...' };
  if (dauroh.value.Status !== 'active') return { canRegister: false, message: 'Event Selesai / Tutup' };
  
  // Logic kuota sederhana
  if (dauroh.value.Quota_Total !== 'non-quota' && Number(dauroh.value.Quota_Total) <= 0) {
      return { canRegister: false, message: 'Kuota Penuh' };
  }
  
  return { canRegister: true, message: 'Daftar Sekarang' };
});

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
/* TYPOGRAPHY BLOG */
.font-blog {
  font-family: 'Georgia', 'Times New Roman', serif; /* Font serif agar mirip artikel bacaan/koran */
}
.font-blog h1, .font-blog h2, .font-blog h3, .font-blog h4, .font-blog h5, .font-blog h6, 
.font-blog .btn, .font-blog .badge, .font-blog .ls-1 {
  font-family: 'Inter', system-ui, -apple-system, sans-serif; /* Font sans-serif untuk UI element */
}

.bg-soft-gray { background-color: #f9f9f9; }
.text-light-gray { color: #ddd; }
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.75rem; }

/* QUILL CONTENT STYLING (Penting untuk Output) */
:deep(.blog-body) {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #333;
}
/* Style gambar di dalam konten (Output) */
:deep(.blog-body img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 2rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
:deep(.blog-body p) {
  margin-bottom: 1.5rem;
}
:deep(.blog-body ul), :deep(.blog-body ol) {
  padding-left: 2rem;
  margin-bottom: 1.5rem;
}
:deep(.blog-body li) {
  margin-bottom: 0.5rem;
}
:deep(.blog-body h2) {
  font-weight: 800;
  margin-top: 3rem;
  margin-bottom: 1rem;
  font-size: 1.75rem;
}
</style>