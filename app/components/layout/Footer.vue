<template>
  <footer class="footer mt-5 py-5 border-top">
    <div class="container">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4 mb-4">
        
        <div class="d-flex flex-column flex-sm-row align-items-center gap-4">
          <a class="navbar-brand fw-bold" href="#">
            <span class="fs-4 text-dark-custom">Dauroh</span> <span class="fs-4 text-primary">Babussalam</span>
          </a>
          <div class="d-flex gap-3">
            <a href="https://www.instagram.com/babussalam_assunnah" class="btn btn-outline-secondary rounded-circle btn-social"><i class="bi bi-instagram"></i></a>
            <a href="#" class="btn btn-outline-secondary rounded-circle btn-social"><i class="bi bi-whatsapp"></i></a>
            <a href="https://www.youtube.com/@BabussalamAsSunnah" class="btn btn-outline-secondary rounded-circle btn-social"><i class="bi bi-youtube"></i></a>
            <a href="https://www.facebook.com/YayasanBabussalamAssunnah" class="btn btn-outline-secondary rounded-circle btn-social"><i class="bi bi-facebook"></i></a>
          </div>
        </div>
        </div>

      <hr class="my-4">

      <div class="text-center">
       
        <p class="text-muted-custom small">
          Copyrights © {{ new Date().getFullYear() }} Babussalam
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Tidak ada logika JS spesifik di sini
</script>

<style scoped>
.footer {
  background-color: #F8FAFC;
  border-top: 1px solid #e9ecef;
}
.footer a:hover {
    color: var(--color-primary) !important;
}
.btn-social {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>