<template>
  <div class="admin-sidebar bg-dark">
    <div class="sidebar-header">
      <NuxtLink class="navbar-brand d-flex align-items-center text-white text-decoration-none" to="/">
        <img src="~/assets/img/Logo-Mahad.png" alt="Dauroh Logo" style="height: 35px;" class="me-2">
        <span class="fs-5 fw-semibold">Dauroh Admin</span>
      </NuxtLink>
    </div>
    
    <ul class="nav flex-column mt-3">
      <li class="nav-item">
        <span class="nav-category">MENU UTAMA</span>
      </li>
      <li class="nav-item">
        <NuxtLink to="/admin" class="nav-link">
          <i class="bi bi-speedometer2 me-2"></i>
          Dashboard
        </NuxtLink>
      </li>

      <li class="nav-item">
        <a class="nav-link collapsed" href="#collapseManajemen" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapseManajemen">
          <i class="bi bi-archive-fill me-2"></i>
          Manajemen Konten
          <i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <div class="collapse" id="collapseManajemen">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <NuxtLink to="/admin" class="nav-link">
                Tiket Dauroh
              </NuxtLink>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link disabled">
                Promo (Contoh)
              </a>
            </li>
          </ul>
        </div>
      </li>
      </ul>
    
    <div class="mt-auto p-3">
      <NuxtLink to="/" class="btn btn-outline-secondary btn-sm w-100">
        <i class="bi bi-box-arrow-left me-2"></i>
        Kembali ke Situs
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.admin-sidebar {
  background-color: #212529;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  transition: transform 0.3s ease-in-out;
  z-index: 1030;
  border-right: 1px solid var(--bs-border-color);
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-category {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6c757d;
  text-transform: uppercase;
}

.nav-link {
  color: #adb5bd;
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.nav-link:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-exact-active {
  color: #ffffff;
  font-weight: 500;
}

.nav-link i {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.nav-link .bi-chevron-down {
  transition: transform 0.3s ease;
}

.nav-link:not(.collapsed) .bi-chevron-down {
  transform: rotate(-180deg);
}

.sub-menu {
  padding-left: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
}

.sub-menu .nav-link {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 0.85rem;
}

/* Pastikan style ini yang digunakan */
.sub-menu .nav-link.router-link-exact-active {
  color: #ffffff;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.1); /* Bukan warna biru */
}
</style>