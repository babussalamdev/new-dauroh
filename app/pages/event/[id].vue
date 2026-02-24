<template>
   <div class="bg-white min-vh-100 pb-5 font-blog d-flex flex-column">

      <div v-if="eventStore.loading.detailPublic"
         class="container py-5 text-center d-flex align-items-center justify-content-center flex-grow-1">
         <div>
            <div class="spinner-border text-dark mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
         </div>
      </div>

      <div v-else-if="!event"
         class="container py-5 text-center d-flex align-items-center justify-content-center flex-grow-1">
         <div>
            <h3 class="fw-bold text-dark mb-3">Konten Tidak Ditemukan</h3>
            <NuxtLink to="/" class="btn btn-dark rounded-pill px-5 fw-bold">Kembali ke Home</NuxtLink>
         </div>
      </div>

      <div v-else>
         <div class="container pt-5 pb-4 text-center" style="max-width: 900px;">
            <h1 class="display-5 fw-bold text-dark mb-3 lh-sm">{{ event.Title }}</h1>

            <div
               class="d-flex justify-content-center align-items-center gap-3 text-secondary small text-uppercase ls-1 flex-wrap">
               <span><i class="bi bi-calendar3 me-1"></i> {{ formatDate(event.Date) }}</span>
               <span class="text-light-gray d-none d-sm-inline">|</span>
               <span><i class="bi bi-geo-alt me-1"></i> {{ event.Place }}</span>
            </div>
         </div>

         <div class="container pb-5 flex-grow-1">
            <div class="row justify-content-center g-5">

               <div class="col-lg-8">
                  <div class="mb-5 rounded-4 overflow-hidden shadow-sm position-relative bg-light mx-auto border"
                     style="max-width: 100%;">
                     <div class="aspect-ratio-box">
                        <img v-if="event.Picture" :src="`${imgUrl}/${event.SK}/${event.Picture}.webp`"
                           class="img-poster" :alt="event.Title" @error="onImageError">
                        <div v-else
                           class="w-100 h-100 d-flex align-items-center justify-content-center text-muted py-5">
                           <div class="text-center">
                              <i class="bi bi-image fs-1 opacity-25"></i>
                              <p class="small m-0 mt-2">Tidak ada gambar</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <article class="blog-body ql-editor px-md-2">
                     <div v-if="event.Description" v-html="event.Description"></div>
                     <p v-else class="text-muted fst-italic text-center py-5 bg-light rounded-3">
                        Belum ada deskripsi lengkap untuk event ini.
                     </p>
                  </article>
               </div>

               <div class="col-lg-4 ps-lg-4">
                  <div class="sticky-top" style="top: 100px; z-index: 10;">

                     <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                        <div class="card-body p-4 pt-5 text-center">
                           <p class="text-muted x-small text-uppercase fw-bold mb-1 ls-1">Harga Tiket</p>
                           <h3 class="fw-bold text-primary mb-4">{{ formatCurrency(event.Price) }}</h3>

                           <button
                              class="btn btn-dark w-100 rounded-pill py-3 fw-bold shadow-sm mb-3 transition-transform d-flex align-items-center justify-content-center gap-2"
                              :disabled="!registrationStatus.canRegister || isLoadingCheck"
                              @click="handleRegisterClick">
                              <span v-if="isLoadingCheck" class="spinner-border spinner-border-sm" role="status"
                                 aria-hidden="true"></span>
                              <span>{{ registrationStatus.message }}</span>
                           </button>

                           <div v-if="!registrationStatus.canRegister"
                              class="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis x-small py-2 mb-0 rounded-3">
                              <i class="bi bi-info-circle me-1"></i> {{ registrationStatus.message }}
                           </div>

                           <span
                              class="badge bg-light text-dark border px-3 py-2 rounded-pill text-uppercase x-small fw-bold shadow-sm mt-3">
                              {{ getGenderLabel(event.Gender) }}
                           </span>
                        </div>

                        <div class="card-footer bg-light p-3 text-center border-0 x-small text-muted">
                           Ada kendala? <a href="#" class="text-dark fw-bold text-decoration-none">Hubungi Admin</a>
                        </div>
                     </div>

                     <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                        <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                           <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                              <i class="bi bi-pie-chart-fill text-primary"></i> Sisa Kuota
                           </h6>
                        </div>
                        <div class="card-body p-4">

                           <div v-if="isNonQuota" class="text-center py-2">
                              <span
                                 class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                 <i class="bi bi-infinity me-1"></i> Tanpa Batas
                              </span>
                           </div>

                           <div v-else class="d-flex flex-column gap-3">
                              <div v-if="showIkhwan"
                                 class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 border-start border-4 border-primary">
                                 <span class="small fw-bold text-secondary ps-1">Ikhwan</span>
                                 <span class="fw-bold text-dark">
                                    {{ formatQuota(getRemaining(event.Quota_Ikhwan, event.Sold_Ikhwan)) }}
                                 </span>
                              </div>

                              <div v-if="showAkhwat"
                                 class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 border-start border-4 border-danger">
                                 <span class="small fw-bold text-secondary ps-1">Akhwat</span>
                                 <span class="fw-bold text-dark">
                                    {{ formatQuota(getRemaining(event.Quota_Akhwat, event.Sold_Akhwat)) }}
                                 </span>
                              </div>

                              <div v-if="showTotal && !showIkhwan && !showAkhwat"
                                 class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3">
                                 <span class="small fw-bold text-secondary">Tiket Tersedia</span>
                                 <span class="fw-bold text-dark">
                                    {{ formatQuota(getRemaining(event.Quota_Total, event.Sold_Total)) }}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                        <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                           <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                              <i class="bi bi-info-circle-fill text-primary"></i> Detail Event
                           </h6>
                        </div>
                        <div class="card-body p-4">
                           <ul class="list-unstyled mb-0 d-flex flex-column gap-3 small text-secondary">
                              <li class="d-flex justify-content-between border-bottom pb-2">
                                 <span>Hari</span>
                                 <span class="fw-bold text-dark">{{ getDayName(event.Date) }}</span>
                              </li>
                              <li class="d-flex justify-content-between border-bottom pb-2">
                                 <span>Jam</span>
                                 <span class="fw-bold text-dark">{{ getTimeRange(event.Date) }}</span>
                              </li>

                              <li class="d-flex justify-content-between">
                                 <span>Total Kapasitas</span>
                                 <span class="fw-bold text-dark text-end" style="max-width: 60%;">
                                    {{ totalQuotaDisplay }}
                                 </span>
                              </li>
                           </ul>
                        </div>
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
import { useEventStore } from '~/stores/event';
import { useCheckoutStore } from '~/stores/checkout';
import { useUserStore } from '~/stores/user'; 
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useTransactionStatus } from '~/composables/useTransactionStatus'; 
import Swal from 'sweetalert2';
import dayjs from 'dayjs'; 
import 'quill/dist/quill.snow.css';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const checkoutStore = useCheckoutStore();
const userStore = useUserStore(); 
const { isLoggedIn } = useAuth();
const { getSmartStatus } = useTransactionStatus(); 
const config = useRuntimeConfig();

const eventSK = String(route.params.id);
const imgUrl = ref(config.public.img || '');
const currentUrl = ref('');
const isLoadingCheck = ref(false);

const event = computed(() => eventStore.currentPublicEventDetail);

// --- HELPER LOGIC (Koneksi ke Store) ---
const isNonQuota = computed(() => eventStore.isNonQuota(event.value));
const showTotal = computed(() => eventStore.showTotal(event.value));
const showIkhwan = computed(() => eventStore.showIkhwan(event.value));
const showAkhwat = computed(() => eventStore.showAkhwat(event.value));
const totalQuotaDisplay = computed(() => eventStore.totalQuotaDisplay(event.value));
const registrationStatus = computed(() => eventStore.registrationStatus(event.value));

const getGenderLabel = eventStore.getGenderLabel;
const getRemaining = eventStore.getRemaining;
const formatQuota = eventStore.formatQuota;
// ---------------------------------------

onMounted(() => {
   currentUrl.value = window.location.href;
   // API untuk memanggil data detail event dipicu di sini
   if (eventSK) {
      eventStore.fetchPublicEventDetail(eventSK);
   }
});

watch(event, (newVal) => {
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
   const s = first.start_time?.substring(0, 5) || '??';
   const e = first.end_time?.substring(0, 5) || '??';
   return `${s} - ${e} WIB`;
};

// [REVISI] Logic Double Order 
const handleRegisterClick = async () => {
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

   try {
      isLoadingCheck.value = true;
      await userStore.fetchUserTransactions();

      const pendingTicket = userStore.tickets.find(ticket => {
         const ticketEventSK = ticket.event?.SK || ticket.EventSK || ticket.SK;
         const status = getSmartStatus(ticket);
         const isTimeUp = ticket.Expired_Date ? dayjs().isAfter(dayjs(ticket.Expired_Date)) : false;
         return (String(ticketEventSK) === String(eventSK)) && (status === 'PENDING') && !isTimeUp;
      });

      if (pendingTicket) {
         Swal.fire({
            icon: 'warning',
            title: 'Pendaftaran Terdeteksi',
            text: 'Anda sudah mendaftar event ini dan statusnya masih Menunggu Pembayaran. Silakan cek riwayat Anda.',
            confirmButtonText: 'Cek Riwayat',
            buttonsStyling: false,
            customClass: {
               popup: 'rounded-4 border-0 shadow-lg p-4',
               title: 'fs-5 fw-bold text-dark mb-2',
               htmlContainer: 'text-muted small mb-4',
               confirmButton: 'btn btn-primary rounded-pill px-4 shadow-sm fw-medium'
            }
         }).then(() => {
            router.push('/riwayat-pendaftaran');
         });
      } else {
         router.push(`/event/register/${eventSK}`);
      }

   } catch (error) {
      console.error("Error checking transaction:", error);
      router.push(`/event/register/${eventSK}`);
   } finally {
      isLoadingCheck.value = false;
   }
};
</script>

<style scoped>
.font-blog {
   font-family: 'Georgia', 'Times New Roman', serif;
}

.font-blog h1,
.font-blog h2,
.font-blog h3,
.font-blog h4,
.font-blog h5,
.font-blog h6,
.font-blog .btn,
.font-blog .badge,
.font-blog .ls-1,
.font-blog .x-small,
.font-blog small,
.font-blog .card-body,
.font-blog .nav-link,
.font-blog .card-header {
   font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.bg-soft-gray {
   background-color: #f8f9fa;
}

.text-light-gray {
   color: #ddd;
}

.ls-1 {
   letter-spacing: 1px;
}

.x-small {
   font-size: 0.75rem;
}

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
   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
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
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.blog-body p) {
   margin-bottom: 1.5rem;
}

:deep(.blog-body ul),
:deep(.blog-body ol) {
   padding-left: 1.5rem;
   margin-bottom: 1.5rem;
}

:deep(.blog-body li) {
   margin-bottom: 0.5rem;
}

:deep(.blog-body h2) {
   font-weight: 800;
   margin-top: 2.5rem;
   margin-bottom: 1rem;
   font-size: 1.6rem;
}

.transition-transform {
   transition: transform 0.2s;
}

.transition-transform:hover {
   transform: translateY(-2px);
}
</style>