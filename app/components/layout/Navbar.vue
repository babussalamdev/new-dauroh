<template>
  <nav 
    class="fixed-navbar navbar navbar-expand navbar-light py-3 sticky-top"
    :class="{ 'scrolled': isScrolled }"
  >
    <div class="container">
      <NuxtLink class="navbar-brand fw-bold text-dark-custom" to="/">
        <img src="/assets/img/Logo-Mahad.png" alt="Dauroh Tickets Logo" style="height: 40px;" class="me-2">
        <span class="fs-4 d-none d-sm-inline">Dauroh</span>
      </NuxtLink>

      <div class="d-flex align-items-center ms-auto">
        
        <template v-if="isLoggedIn">
          <span class="navbar-text text-dark-custom me-3 fw-medium">
            Halo, {{ userName }}
          </span>
        </template>

        <button 
          class="navbar-toggler d-block border-1 shadow-none p-0" 
          type="button" 
          data-bs-toggle="offcanvas" 
          data-bs-target="#offcanvasNavbar" 
          aria-controls="offcanvasNavbar"
        >
          <i class="navbar-toggler-icon"></i>
        </button>

      </div>
    </div>
  </nav>

  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" ref="offcanvasRef">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title fw-bold" id="offcanvasNavbarLabel">Menu</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      
      <ul class="navbar-nav justify-content-start flex-grow-1 pe-3">
        
        <li class="nav-item mb-2">
          <NuxtLink class="nav-link" to="/" active-class="active" @click="closeOffcanvas">
            <i class="bi bi-house-door me-2"></i>Home
          </NuxtLink>
        </li>

        <template v-if="isLoggedIn">
          <li class="nav-item mb-2">
            <NuxtLink v-if="isAdmin" class="nav-link" to="/admin" active-class="active" @click="closeOffcanvas">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard Admin
            </NuxtLink>
            <NuxtLink v-else class="nav-link" to="/dashboard" active-class="active" @click="closeOffcanvas">
              <i class="bi bi-grid me-2"></i>Dashboard
            </NuxtLink>
          </li>

          <li class="nav-item mb-2" v-if="!isAdmin">
            <NuxtLink class="nav-link" to="/riwayat-pendaftaran" active-class="active" @click="closeOffcanvas">
              <i class="bi bi-clock-history me-2"></i>Riwayat Pendaftaran
            </NuxtLink>
          </li>

          <li class="nav-item mb-2">
            <NuxtLink class="nav-link" to="/profile/edit" active-class="active" @click="closeOffcanvas">
              <i class="bi bi-person-circle me-2"></i>Profil Saya
            </NuxtLink>
          </li>

          <li class="nav-item mt-auto">
             <hr class="my-3">
             <button @click="handleLogout" class="btn btn-danger w-100 rounded-pill">
              <i class="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </li>

        </template>

        <template v-else>
          <li class="nav-item mb-2">
            <NuxtLink class="nav-link" to="/login" active-class="active" @click="closeOffcanvas">
              <i class="bi bi-box-arrow-in-right me-2"></i>Login
            </NuxtLink>
          </li>
           <li class="nav-item mt-2">
            <NuxtLink to="/register" class="btn btn-primary w-100 rounded-pill" @click="closeOffcanvas">Buat Akun</NuxtLink>
          </li>
        </template>
      </ul>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const isScrolled = ref(false)
const { user, logout, isLoggedIn, isAdmin } = useAuth()
const router = useRouter()
const offcanvasRef = ref<HTMLElement | null>(null)

const userName = computed(() => user.value?.name || 'User')

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const handleLogout = async () => {
  closeOffcanvas()
  await logout()
}

// --- [LOGIKA BARU] Fix Scroll Issue ---
const closeOffcanvas = () => {
  // Cari elemen close button di dalam offcanvas dan klik secara virtual
  // Ini cara paling aman agar Bootstrap membersihkan event-nya sendiri
  const closeBtn = offcanvasRef.value?.querySelector('[data-bs-dismiss="offcanvas"]')
  if (closeBtn) {
    (closeBtn as HTMLElement).click()
  }
}

// Pembersihan Paksa saat komponen dihancurkan (pindah layout)
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  
  // Hapus backdrop sisa (jika ada)
  const backdrops = document.querySelectorAll('.offcanvas-backdrop')
  backdrops.forEach(backdrop => backdrop.remove())

  // Hapus style overflow hidden dari body yang bikin nyangkut
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  document.body.removeAttribute('data-bs-overflow')
  document.body.removeAttribute('data-bs-padding-right')
})

// Watch route change untuk memastikan menu tertutup
watch(() => router.currentRoute.value.path, () => {
  // Pastikan body bersih setiap ganti halaman
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  
  // Hapus backdrop jika masih nyangkut
  const backdrop = document.querySelector('.offcanvas-backdrop')
  if (backdrop) {
    backdrop.remove()
  }
})
// --- Akhir Logika Baru ---

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.fixed-navbar {
  background-color: transparent !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  z-index: 1000;
}
.fixed-navbar.scrolled {
  background-color: transparent !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.navbar-brand {
  font-family: 'Montserrat', sans-serif;
}
.nav-link {
  font-weight: 500;
  color: #333;
  padding: 10px 15px;
  border-radius: 8px;
  transition: background 0.2s;
}
.nav-link:hover, .nav-link.active {
  color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.05);
}
</style>