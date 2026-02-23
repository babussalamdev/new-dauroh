<template>
  <div class="admin-sidebar bg-dark">
    <div class="sidebar-header">
      <NuxtLink class="navbar-brand d-flex align-items-center text-white text-decoration-none" to="/">
        <img src="~/assets/img/Logo-Mahad.png" alt="Event Logo" style="height: 35px;" class="me-2">
        <span class="fs-5 fw-semibold">Event Admin</span>
      </NuxtLink>
    </div>

    <ul class="nav flex-column mt-3">
      <li class="nav-item">
        <span class="nav-category">MENU UTAMA</span>
      </li>

      <li v-for="item in mainMenuItems" :key="item.text" class="nav-item">
        <NuxtLink :to="item.to" class="nav-link">
          <i :class="`bi ${item.icon} me-2`"></i>
          {{ item.text }}
        </NuxtLink>
      </li>

      <li v-for="dropdown in dropdownMenuItems" :key="dropdown.id" class="nav-item">
        <a class="nav-link collapsed" :href="`#${dropdown.id}`" data-bs-toggle="collapse" role="button">
          <i :class="`bi ${dropdown.icon} me-2`"></i>
          {{ dropdown.text }}
          <i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <div class="collapse" :id="dropdown.id">
          <ul class="nav flex-column sub-menu">
            <li v-for="subItem in dropdown.items" :key="subItem.text" class="nav-item">
              <NuxtLink :to="subItem.to" :class="['nav-link', { disabled: subItem.disabled }]">
                - {{ subItem.text }}
              </NuxtLink>
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

<script setup>
// Impor data menu dari file terpisah
import { mainMenuItems, dropdownMenuItems } from '~/data/adminMenu';
</script>

<style scoped>
@import url("~/assets/css/admin/sidebar.css");
</style>