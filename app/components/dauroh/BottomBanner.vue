<template>
  <div class="container">
  <div class="card text-bg-dark" style="width:1500px">
    <img :src="Banner" class="card-img" alt="Banner">
      <div class="card-img-overlay d-flex flex-column justify-content-center p-3">
    </div>
  </div>
  </div>
</template>

<script setup>
import Banner from '~/assets/img/banner.png';
</script>

<style scoped>
.card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  width: 70%;
  max-width: 100%;
  height: 140px;
  aspect-ratio: 9 / 16;
}
.card-img {
  filter: brightness(0.6); 
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-img-overlay {
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  padding-top: 4%;
  font-size: medium;
}
</style>