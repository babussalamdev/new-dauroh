<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>
        <li class="breadcrumb-item txt-caption text-muted">Presensi</li>
        <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Log Kehadiran</li>
      </ol>
    </nav>

    <AdminKehadiranLogTable />
    
  </div>
</template>

<script setup lang="ts">
// Di halaman utama murni cuma buat ngatur Layout dan Meta Title aja
useHead({ title: 'Presensi Peserta' });
definePageMeta({ layout: 'admin' });
</script>