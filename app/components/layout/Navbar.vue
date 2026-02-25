<template>
  <nav class="fixed-navbar navbar navbar-expand-lg navbar-light py-3 sticky-top" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <NuxtLink class="navbar-brand fw-bold text-dark-custom" to="/">
        <img src="/assets/img/Logo-Mahad.png" alt="Event Tickets Logo" style="height: 40px;" class="me-2">
        <span class="fs-6 d-none d-sm-inline">tiket.sisalam.id</span>
      </NuxtLink>

      <div class="d-flex align-items-center ms-auto d-lg-none">
        <template v-if="isLoggedIn">
          <span class="navbar-text text-dark-custom me-3 fw-medium">
            Halo, {{ userName }}
          </span>
        </template>
        <button class="navbar-toggler d-block border-1 shadow-none p-0" type="button" data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
          <i class="navbar-toggler-icon"></i>
        </button>
      </div>

      <div class="collapse navbar-collapse d-none d-lg-block" id="navbarDesktop">

        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-3">

          <li class="nav-item">
            <NuxtLink class="nav-link" to="/" active-class="active">Home</NuxtLink>
          </li>

          <template v-if="isLoggedIn">
            <li class="nav-item">
              <NuxtLink v-if="isAdmin" class="nav-link" to="/admin" active-class="active">
                Dashboard Admin
              </NuxtLink>
              <NuxtLink v-else class="nav-link" to="/dashboard" active-class="active">
                Dashboard
              </NuxtLink>
            </li>
          </template>

          <li class="nav-item text-muted opacity-25 mx-1" v-if="isLoggedIn">|</li>

          <li class="nav-item" v-if="!isLoggedIn">
            <div class="d-flex align-items-center gap-3">
              <NuxtLink class="nav-link text-dark fw-medium" to="/auth">Login</NuxtLink>
              <NuxtLink to="/auth" class="btn btn-primary px-4 rounded-pill">Buat Akun</NuxtLink>
            </div>
          </li>

          <li class="nav-item dropdown" v-if="isLoggedIn">
            <button class="btn btn-light rounded-pill dropdown-toggle d-flex align-items-center gap-2" type="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle text-primary"></i>
              <span class="fw-medium">{{ userName }}</span>
            </button>

            <ul class="dropdown-menu dropdown-menu-end text-small shadow">
              <li>
                <NuxtLink class="dropdown-item" to="/profile">
                  <i class="bi bi-person-gear me-2"></i> Profil Saya
                </NuxtLink>
              </li>

              <li v-if="!isAdmin">
                <NuxtLink class="dropdown-item" to="/history">
                  <i class="bi bi-clock-history me-2"></i> Riwayat Pendaftaran
                </NuxtLink>
              </li>

              <li>
                <hr class="dropdown-divider">
              </li>

              <li>
                <button class="dropdown-item text-danger" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </li>
            </ul>
          </li>

        </ul>
      </div>

    </div>
  </nav>

  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel"
    ref="offcanvasRef">
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
            <NuxtLink class="nav-link" to="/history" active-class="active" @click="closeOffcanvas">
              <i class="bi bi-clock-history me-2"></i>Riwayat Pendaftaran
            </NuxtLink>
          </li>

          <li class="nav-item mb-2">
            <NuxtLink class="nav-link" to="/profile" active-class="active" @click="closeOffcanvas">
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
            <NuxtLink class="nav-link" to="/auth" active-class="active" @click="closeOffcanvas">
              <i class="bi bi-box-arrow-in-right me-2"></i>Login
            </NuxtLink>
          </li>
          <li class="nav-item mt-2">
            <NuxtLink to="/auth" class="btn btn-primary w-100 rounded-pill" @click="closeOffcanvas">Buat Akun
            </NuxtLink>
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

// --- Fix Scroll Issue ---
const closeOffcanvas = () => {
  const closeBtn = offcanvasRef.value?.querySelector('[data-bs-dismiss="offcanvas"]')
  if (closeBtn) {
    (closeBtn as HTMLElement).click()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  const backdrops = document.querySelectorAll('.offcanvas-backdrop')
  backdrops.forEach(backdrop => backdrop.remove())
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  document.body.removeAttribute('data-bs-overflow')
  document.body.removeAttribute('data-bs-padding-right')
})

watch(() => router.currentRoute.value.path, () => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  const backdrop = document.querySelector('.offcanvas-backdrop')
  if (backdrop) {
    backdrop.remove()
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import url("~/assets/css/layout/navbar.css");

/* Bersihkan panah default dropdown bootstrap */
.dropdown-toggle::after {
  display: block
}
</style>