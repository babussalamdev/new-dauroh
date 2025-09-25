<template>
  <div class="container">
  <div class="card text-bg-dark" style="width:1500px">
    <img :src="cityRainImage" class="card-img" alt="City Rain">
    <div class="card-img-overlay">
      <p class="card-text fw-bold" >Makanan & minuman enak siap nemenin nonton! <br>
        <a href="#" class="btn btn-primary bg-info-light">Lihat semua ></a>
    </p>
    </div>
  </div>
  </div>
</template>
<script setup>
import cityRainImage from '~/assets/img/city-rain.jpg';
</script>
<style scoped>
.card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  width: 70%;
  max-width: 100%;
  height: 120px;
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
  padding-top: 2.5%;
  font-size: medium;
}
</style>