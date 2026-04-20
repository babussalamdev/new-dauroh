<template>
  <footer class="footer mt-5 py-5 border-top">
    <div class="container">
      <div class="d-flex flex-column flex-lg-row justify-content-center align-items-center gap-4 mb-4">

        <div class="d-flex flex-column flex-sm-row align-items-center gap-4">
          <a class="navbar-brand text-decoration-none" href="#">
            <span class="txt-title fw-bold text-dark-custom">Event</span> <span class="txt-title fw-bold text-primary">Babussalam</span>
          </a>
          
          <div class="d-flex gap-3">
            <a href="https://www.instagram.com/babussalam_assunnah"
              class="btn btn-outline-secondary rounded-circle btn-social shadow-sm"><i class="bi bi-instagram"></i></a>
            <a href="#" class="btn btn-outline-secondary rounded-circle btn-social shadow-sm"><i class="bi bi-whatsapp"></i></a>
            <a href="https://www.youtube.com/@BabussalamAsSunnah"
              class="btn btn-outline-secondary rounded-circle btn-social shadow-sm"><i class="bi bi-youtube"></i></a>
            <a href="https://www.facebook.com/YayasanBabussalamAssunnah"
              class="btn btn-outline-secondary rounded-circle btn-social shadow-sm"><i class="bi bi-facebook"></i></a>
          </div>
        </div>
      </div>

      <hr class="my-4 text-muted opacity-25">

      <div class="text-center">
        <p class="text-muted-custom txt-caption fw-bold mb-0">
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
@import url("~/assets/css/layout/footer.css");
</style>