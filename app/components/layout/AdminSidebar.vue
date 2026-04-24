<template>
  <div class="admin-sidebar bg-dark">
    <div class="sidebar-header">
      <NuxtLink class="navbar-brand d-flex align-items-center text-white text-decoration-none" to="/">
        <img src="~/assets/img/Logo-Mahad.png" alt="Event Logo" style="height: 35px;" class="me-2">
        <span class="fs-5 fw-semibold">Event Admin</span>
      </NuxtLink>
    </div>

    <ul class="nav flex-column mt-3">
      <li class="nav-item px-3 mb-2">
        <span class="nav-category txt-title text-white-50">MENU UTAMA</span>
      </li>

      <template v-for="(menu, index) in menuStore.menus" :key="index">
        
        <li v-if="!menu.subMenus" class="nav-item">
          <NuxtLink :to="menu.url" class="nav-link">
            <i :class="`bi ${menu.icon} me-2`"></i>
            {{ menu.title }}
          </NuxtLink>
        </li>

        <li v-else class="nav-item">
          <a class="nav-link collapsed" :href="`#collapse-${index}`" data-bs-toggle="collapse" role="button">
            <i :class="`bi ${menu.icon} me-2`"></i>
            {{ menu.title }}
            <i class="bi bi-chevron-down ms-auto"></i>
          </a>
          <div class="collapse" :id="`collapse-${index}`">
            <ul class="nav flex-column sub-menu">
              <li v-for="sub in menu.subMenus" :key="sub.title" class="nav-item">
                <NuxtLink :to="sub.url" class="nav-link">
                  - {{ sub.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </li>

      </template>
    </ul>

    <div class="mt-auto p-3">
      <NuxtLink to="/" class="btn btn-outline-secondary btn-sm w-100">
        <i class="bi bi-box-arrow-left me-2 txt-body text-white"></i>
        Kembali ke Situs
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// 🟢 IMPORT STORE MENU
import { useUserMenuStore } from '~/stores/userMenu';

const menuStore = useUserMenuStore();
</script>

<style scoped>
@import url("~/assets/css/admin/sidebar.css");
</style>