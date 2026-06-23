<template>
   <div class="bg-white min-vh-100 pb-5 font-blog d-flex flex-column">

      <div v-if="isLoadingDetail"
         class="container py-5 text-center d-flex align-items-center justify-content-center flex-grow-1">
         <div>
            <div class="spinner-border text-dark mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
         </div>
      </div>

      <div v-else-if="!event"
         class="container py-5 text-center d-flex align-items-center justify-content-center flex-grow-1">
         <div>
            <h3 class="fw-bold text-dark mb-3 txt-subtitle">Konten Tidak Ditemukan</h3>
            <NuxtLink to="/" class="btn btn-dark rounded-pill px-5 fw-bold txt-body shadow-sm">Kembali ke Home</NuxtLink>
         </div>
      </div>

      <div v-else>
         <div class="container pt-5 pb-4 text-center" style="max-width: 900px;">
            <h1 class="display-5 fw-bold text-dark mb-3 lh-sm txt-title text-uppercase">{{ event.Title }}</h1>

            <div
               class="d-flex justify-content-center align-items-center gap-3 text-secondary txt-caption fw-bold text-uppercase ls-1 flex-wrap">
               <span><i class="bi bi-calendar3 me-1"></i> {{ formatEventDates(event.Date) }} </span>
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
                              <i class="bi bi-image display-1 opacity-25"></i>
                              <p class="txt-caption fw-bold m-0 mt-2">Tidak ada gambar</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <article class="blog-body ql-editor px-md-2 txt-body text-dark">
                     <div v-if="event.Description" v-html="event.Description"></div>
                     <p v-else class="text-muted fst-italic text-center py-5 bg-light rounded-3 txt-body">
                        Belum ada deskripsi lengkap untuk event ini.
                     </p>
                  </article>
               </div>

               <div class="col-lg-4 ps-lg-4">
                  <div class="sticky-top" style="top: 100px; z-index: 10;">

                     <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                        <div class="card-body p-4 pt-5 text-center">
                           <p class="text-muted txt-caption text-uppercase fw-bold mb-1 ls-1">Harga Tiket</p>
                           <h3 class="fw-bold text-primary mb-4 txt-title fs-3">{{ formatCurrency(event.Price) }}</h3>

                           <button
                              class="btn btn-dark w-100 rounded-pill py-3 fw-bold txt-body shadow-sm mb-3 transition-transform d-flex align-items-center justify-content-center gap-2"
                              :disabled="!registrationStatus(event).canRegister || isLoadingCheck"
                              @click="handleRegisterClick">
                              <span v-if="isLoadingCheck" class="spinner-border spinner-border-sm" role="status"
                                 aria-hidden="true"></span>
                              <span>{{ registrationStatus(event).message }}</span>
                           </button>

                           <div v-if="!registrationStatus(event).canRegister"
                              class="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis txt-caption fw-bold py-2 mb-0 rounded-3">
                              <i class="bi bi-info-circle me-1"></i> {{ registrationStatus(event).message }}
                           </div>

                           <span
                              class="badge bg-light text-dark border px-3 py-2 rounded-pill text-uppercase txt-caption fw-bold shadow-sm mt-3">
                              {{ getGenderLabel(event.Gender) }}
                           </span>
                        </div>
                        
                        <div v-if="event.Whatsapp" class="card-footer bg-light p-3 text-center border-0">
                           <p class="mb-2 text-muted txt-caption fw-bold">Ada kendala pendaftaran?</p>
                           <a :href="`https://wa.me/${event.Whatsapp}`" target="_blank" class="btn btn-outline-success w-100 rounded-pill fw-bold txt-body py-2 shadow-sm d-flex align-items-center justify-content-center gap-2">
                              <i class="bi bi-whatsapp"></i> Hubungi Panitia
                           </a>
                        </div>
                        <div v-else class="card-footer bg-light p-3 text-center border-0 txt-caption text-muted">
                           Ada kendala? <a href="#" class="text-dark fw-bold text-decoration-none txt-caption">Hubungi Admin</a>
                        </div>
                     </div>

                     <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                        <div class="card-body p-4">
                           <div v-if="isNonQuota(event)" class="text-center py-2">
                              <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill txt-body fw-bold">
                                 <i class="bi bi-infinity me-1"></i> Kuota Tanpa Batas
                              </span>
                           </div>

                           <div v-else class="d-flex flex-column gap-4">
                              <div v-if="showIkhwan(event)">
                                 <div class="d-flex justify-content-between align-items-end mb-2">
                                    <div class="d-flex align-items-center gap-2 fw-bold text-secondary">
                                       <i class="bi bi-people"></i> <span class="txt-caption text-uppercase">Sisa Kuota Ikhwan</span>
                                    </div>
                                    <div>
                                       <span class="fw-bold fs-0 text-primary">{{ formatQuota(getRemaining(event.Quota_Ikhwan, event.Sold_Ikhwan)) }}</span>
                                       <span class="text-secondary txt-caption"> / {{ event.Quota_Ikhwan }}</span>
                                    </div>
                                 </div>
                                 <div class="progress" style="height: 10px;">
                                    <div class="progress-bar rounded-pill bg-primary" role="progressbar" :style="`width: ${getPercentage(event.Sold_Ikhwan, event.Quota_Ikhwan)}%;`" :aria-valuenow="getPercentage(event.Sold_Ikhwan, event.Quota_Ikhwan)" aria-valuemin="0" aria-valuemax="100"></div>
                                 </div>
                              </div>

                              <div v-if="showAkhwat(event)">
                                 <div class="d-flex justify-content-between align-items-end mb-2">
                                    <div class="d-flex align-items-center gap-2 fw-bold text-secondary">
                                       <i class="bi bi-people"></i> <span class="txt-caption text-uppercase">Sisa Kuota Akhwat</span>
                                    </div>
                                    <div>
                                       <span class="fw-bold fs-0 text-danger">{{ formatQuota(getRemaining(event.Quota_Akhwat, event.Sold_Akhwat)) }}</span>
                                       <span class="text-secondary txt-caption"> / {{ event.Quota_Akhwat }}</span>
                                    </div>
                                 </div>
                                 <div class="progress" style="height: 10px;">
                                    <div class="progress-bar rounded-pill bg-danger" role="progressbar" :style="`width: ${getPercentage(event.Sold_Akhwat, event.Quota_Akhwat)}%;`" :aria-valuenow="getPercentage(event.Sold_Akhwat, event.Quota_Akhwat)" aria-valuemin="0" aria-valuemax="100"></div>
                                 </div>
                              </div>

                              <div v-if="showTotal(event) && !showIkhwan(event) && !showAkhwat(event)">
                                 <div class="d-flex justify-content-between align-items-end mb-2">
                                    <div class="d-flex align-items-center gap-2 fw-bold text-secondary">
                                       <i class="bi bi-people"></i> <span class="txt-caption text-uppercase">Sisa Kuota Umum</span>
                                    </div>
                                    <div>
                                       <span class="fw-bold fs-5 text-primary">{{ formatQuota(getRemaining(event.Quota_Total, event.Sold_Total)) }}</span>
                                       <span class="text-secondary txt-caption"> / {{ event.Quota_Total }}</span>
                                    </div>
                                 </div>
                                 <div class="progress" style="height: 10px;">
                                    <div class="progress-bar rounded-pill bg-primary" role="progressbar" :style="`width: ${getPercentage(event.Sold_Total, event.Quota_Total)}%;`" :aria-valuenow="getPercentage(event.Sold_Total, event.Quota_Total)" aria-valuemin="0" aria-valuemax="100"></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                        <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                           <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2 txt-subtitle">
                              <i class="bi bi-info-circle-fill text-primary"></i> Jadwal Event
                           </h6>
                        </div>
                        <div class="card-body p-4">
                           <ul class="list-unstyled mb-0 d-flex flex-column gap-3 txt-body text-secondary">
                              <li class="border-bottom pb-2">
                                 <div class="d-flex flex-column gap-2 mt-1">
                                    <div v-for="(day, i) in getDetailedSchedule(event.Date)" :key="i" class="d-flex justify-content-between align-items-center bg-light p-2 rounded-3">
                                       <span class="text-secondary txt-caption"><i class="bi bi-calendar-event me-1"></i>{{ day.date }}</span>
                                       <span class="fw-bold text-dark txt-caption"><i class="bi bi-clock me-1 text-primary"></i>{{ day.time }}</span>
                                    </div>
                                 </div>
                              </li>
                           </ul>
                        </div>
                     </div>

                     <!-- LOKASI EVENT MAP -->
                     <div v-if="event.Maps" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                        <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                           <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2 txt-subtitle">
                              <i class="bi bi-geo-alt-fill text-danger"></i> Lokasi Event
                           </h6>
                        </div>
                        <div class="card-body p-4">
                           <a :href="event.Maps" target="_blank" class="d-block rounded-3 overflow-hidden border position-relative text-decoration-none" style="height: 150px;">
                              <img src="~/assets/img/googlemaps.jpg" alt="Lokasi Peta" class="w-100 h-100" style="object-fit: cover; opacity: 0.8;">
                              <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-10 transition-all hover-opacity-50">
                                 <div class="bg-white text-dark px-3 py-2 rounded-pill fw-bold shadow-sm txt-caption d-flex align-items-center gap-2 hover-up">
                                    <i class="bi bi-box-arrow-up-right text-primary"></i> Buka Maps
                                 </div>
                              </div>
                           </a>
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

const event = ref<any>(null);
const isLoadingDetail = ref(true);

onMounted(async () => {
   currentUrl.value = window.location.href;
   
   if (eventSK) {
      if (
         eventStore.currentPublicEventDetail?.SK === eventSK && 
         eventStore.currentPublicEventDetail?.isDetailFetched
      ) {
         event.value = eventStore.currentPublicEventDetail;
         isLoadingDetail.value = false;
         return; 
      }

      isLoadingDetail.value = true;
      const rawData = await eventStore.fetchViewData('one-item-detail', 'event', eventSK);
      
      if (rawData) {
         rawData.Price = Number(rawData.Price || 0);
         rawData.isDetailFetched = true; 
         
         event.value = rawData;
         eventStore.currentPublicEventDetail = rawData;

         const index = eventStore.tiketEvent.findIndex(e => String(e.SK) === eventSK);
         if (index !== -1) {
            const targetEvent = eventStore.tiketEvent[index];
            if (targetEvent) {
               Object.assign(targetEvent, rawData);
            }
         }
      }
      
      isLoadingDetail.value = false;
   }
});

watch(event, (newVal) => {
   if (newVal) {
      useHead({
         title: `${newVal.Title} - Babussalam Event`,
      });
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

const getDayName = (dateObj: any) => {
   if (!dateObj) return '-';
   const rawDates = Object.values(dateObj).map((d: any) => d?.date).filter(Boolean) as string[];
   if (rawDates.length === 0 || !rawDates[0]) return '-';

   return new Date(rawDates[0]).toLocaleDateString('id-ID', { weekday: 'long' });
};

const convertTo24h = (timeStr?: string) => {
  if (!timeStr) return '';
  const cleanStr = timeStr.replace('.', ':');
  const [time, modifier] = cleanStr.split(' ');
  if (!time) return '';
  let [hours, minutes] = time.split(':');
  let h = parseInt(hours || "0", 10);
  if (modifier?.toUpperCase() === 'PM' && h < 12) h += 12;
  if (modifier?.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}.${minutes}`;
};

const getTimeRange = (dateObj: any) => {
   if (!dateObj) return '-';
   const first = Object.values(dateObj)[0] as any;
   if (!first) return '-';
   const s = convertTo24h(first.start_time) || '??';
   const e = convertTo24h(first.end_time) || '??';
   return `${s} - ${e} WIB`;
};

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
            router.push('/auth');
         }
      });
      return;
   }

   try {
      isLoadingCheck.value = true;
      await userStore.fetchUserTransactions();

      const pendingTicket = userStore.tickets.find(ticket => {
         const ticketEventSK = ticket.Subject || ticket.event?.SK || ticket.EventSK;
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
            router.push('/history');
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


:deep(.blog-body ul),
:deep(.blog-body ol) {
   padding-left: 1.5rem;

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