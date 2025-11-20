<template>
  <div class="container mt-0">
    <div
      v-if="!daurohStore.loading.tiketDauroh && daurohStore.tiketDaurohChunks.length > 0"
      id="tiketDauroh"
      class="carousel slide carousel-dark"
      data-bs-ride="carousel"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false">
      <div class="carousel-inner">
        <div v-for="(chunk, chunkIndex) in daurohStore.tiketDaurohChunks" :key="chunkIndex" :class="['carousel-item', { active: chunkIndex === 0 }]">
          <div class="d-flex card-container-flex">
            <div v-for="dauroh in chunk" :key="dauroh. SK || dauroh.Title" class="dauroh-card-wrapper">
              
              <a :href="'/dauroh/' + dauroh. SK" @click.prevent="openImageModal(dauroh)" class="text-decoration-none d-block h-100">
                <div class="card dauroh-card rounded-lg overflow-hidden h-100">
                  <div class="position-relative">
                    <img :src="`${imgUrl}/${dauroh.SK}/${dauroh.Picture}.webp`" class="card-img-top" :alt="dauroh.Title" />
                    <span v-if="dauroh.topOverlay" class="overlay-top">{{ dauroh.topOverlay }}</span>
                  </div>
                  <div class="card-body d-flex flex-column p-3">
                    <h6 class="card-title fw-bold text-dark">{{ dauroh.Title }}</h6>
                    <small class="text-muted mb-1">{{ dauroh.date || dauroh.genre }}</small>
                    
                    <div class="mt-auto d-flex flex-column flex-sm-row gap-2">
                      
                      <button class="btn btn-sm btn-outline-primary rounded-pill w-100" @click.prevent.stop="openDetailModal(dauroh)">Detail</button>
                      
                      <button class="btn btn-sm btn-primary rounded-pill w-100" @click.prevent.stop="handleRegisterClick(dauroh)">Daftar</button>
                    
                    </div>
                  </div>
                </div>
              </a>

            </div>
          </div>
        </div>
      </div>
      </div>

    <ModalsDaurohDetailModal :show="showDetailModal" :dauroh="selectedDauroh" @close="closeDetailModal" @register="handleRegisterFromDetail" />
    <ModalsDaurohImageModal :show="showImageModal" :dauroh="selectedDauroh" @close="closeImageModal" />

    <ModalsDaurohRegistrationModal
      :show="showRegistrationModal"
      :dauroh="selectedDauroh"
      @close="closeRegistrationModal"
      @submit="handleRegistrationSubmit" />
    
    </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useDaurohStore } from "~/stores/dauroh";
  import { useToastStore } from '~/stores/toast';
  import { useAuth } from "~/composables/useAuth";
  import { useCheckoutStore } from '~/stores/checkout'; // <-- IMPORT STORE BARU

  const isHovered = ref(false);
  const daurohStore = useDaurohStore();
  // const userStore = useUserStore(); // <-- Tidak dipakai lagi
  const checkoutStore = useCheckoutStore();
  const toastStore = useToastStore();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const imgUrl = ref("");

  const config = useRuntimeConfig();

  onMounted(() => {
    imgUrl.value = config.public.img;
    daurohStore.fetchPublicTiketDauroh();
  });

  const selectedDauroh = ref(null);
  const showDetailModal = ref(false);
  const showRegistrationModal = ref(false);
  // const showQrModal = ref(false); // <-- Tidak dipakai lagi

  // State dan handler untuk modal gambar baru
  const showImageModal = ref(false);
  const openImageModal = (dauroh) => {
    selectedDauroh.value = dauroh;
    showImageModal.value = true;
  };
  const closeImageModal = () => {
    showImageModal.value = false;
  };

  const openDetailModal = (dauroh) => {
    selectedDauroh.value = dauroh;
    showDetailModal.value = true;
  };
  const closeDetailModal = () => {
    showDetailModal.value = false;
  };
  const handleRegisterFromDetail = (dauroh) => {
    closeDetailModal();
    setTimeout(() => {
      handleRegisterClick(dauroh);
    }, 200);
  };
  
  const handleRegisterClick = (dauroh) => {
    if (!isLoggedIn.value) {
      toastStore.showToast({
        message: 'Mohon login atau daftar terlebih dahulu.',
        type: 'info'
      });
      // Opsional: arahkan ke login
      // router.push('/login'); 
    } else {
      selectedDauroh.value = dauroh;
      showRegistrationModal.value = true;
    }
  };

  const closeRegistrationModal = () => {
    showRegistrationModal.value = false;
  };
  const handleRegistrationSubmit = (registrationData) => {
    closeRegistrationModal();

    // 1. Simpan data registrasi ke store checkout baru
    checkoutStore.startCheckout(registrationData);

    // 2. Arahkan user ke halaman pertama alur pembayaran
    router.push('/checkout/select');

    // 3. Hapus logika lama yang langsung mendaftarkan & menampilkan QR
    // userStore.registerDauroh(registrationData); // <-- HAPUS
    // showQrModal.value = true; // <-- HAPUS
  };
  
  // const closeQrModal = () => { ... }; // <-- HAPUS
</script>

<style scoped>
  /* Style tidak berubah */
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
  }
  .dauroh-card-wrapper {
    flex: 0 0 auto;
    width: calc(50% - 0.75rem);
    margin-bottom: 1rem;
  }
  @media (min-width: 576px) {
    .dauroh-card-wrapper {
      width: calc(50% - 0.75rem);
    }
  }
  @media (min-width: 768px) {
    .dauroh-card-wrapper {
      width: calc(33.333% - (1rem * 2 / 3) - 4px);
    }
  }
  @media (min-width: 992px) {
    .dauroh-card-wrapper {
      width: calc(25% - (1rem * 3 / 4) - 4px);
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
    left: 5px;
  }
  .carousel-control-next {
    left: auto;
    right: 5px;
  }
  @media (max-width: 991.98px) {
    .carousel-control-prev,
    .carousel-control-next {
      display: none;
    }
    .carousel {
      padding-left: 0;
      padding-right: 0;
    }
    .card-container-flex {
      padding: 0 1rem;
    }
  }
  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-size: 60%;
  }
  .card.dauroh-card {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    border: none;
    cursor: pointer;
    height: 100%;
  }
  .card.dauroh-card:hover {
    transform: translateY(-5px);
  }
  .card.dauroh-card img {
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
  .skeleton-container .dauroh-card-wrapper {
    width: calc(50% - 0.75rem);
  }
  @media (min-width: 768px) {
    .skeleton-container .dauroh-card-wrapper {
      width: calc(33.333% - (1rem * 2 / 3) - 4px);
    }
  }
  @media (min-width: 992px) {
    .skeleton-container .dauroh-card-wrapper {
      width: calc(25% - (1rem * 3 / 4) - 4px);
    }
  }
  .skeleton-container .card.dauroh-card {
    height: 100%;
  }
  .placeholder {
    background-color: #e9ecef;
  }
  .card-img-top.placeholder {
    width: 100%;
  }
</style>