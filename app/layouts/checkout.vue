<template>
  <div class="checkout-layout">
    <header class="checkout-header">
      <div class="container">
        <div>
          <h5 class="mb-0 text-white">Pembayaran Registrasi</h5>
          <p class="mb-0 text-white-50 small">silahkan ikuti sesuai petunjuk dibawah ini.</p>
        </div>
      </div>
    </header>
    
    <main class="checkout-main">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <slot />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
/* Style tidak berubah, tetap konsisten */
.checkout-layout {
  background-color: #f0f4f8; /* Warna latar belakang netral */
  min-height: 100vh;
}

.checkout-header {
  background-color: var(--color-primary); /* Menggunakan warna primary dari variables.scss */
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.checkout-main {
  padding-bottom: 2rem;
}

/* Tombol WhatsApp global (tetap ada karena ini untuk bantuan, bukan distraksi) */
:global(.whatsapp-fab) {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #25D366;
  color: white;
  border-radius: 50px;
  padding: 0.5rem 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 100;
}

:global(.whatsapp-fab:hover) {
  background-color: #1EAE50;
  color: white;
}
</style>