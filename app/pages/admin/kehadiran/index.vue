<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Presensi'}, {text: 'Log Kehadiran'}]" />

    <AdminKehadiranLogTable />
    
  </div>
</template>

<script setup lang="ts">
// Di halaman utama murni cuma buat ngatur Layout dan Meta Title aja
useHead({ title: 'Presensi Peserta' });
definePageMeta({ layout: 'admin' });
</script>