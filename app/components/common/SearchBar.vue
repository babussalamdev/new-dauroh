<template>
  <div class="search-bar">
    <i class="search-icon bi-search"></i>
    <input type="text" class="form-control" placeholder="Cari event..." :value="eventStore.searchQuery"
      @input="updateSearchQuery" />
  </div>
</template>

<script setup>
import { useEventStore } from '~/stores/event';
const eventStore = useEventStore();

const updateSearchQuery = (event) => {
  eventStore.setSearchQuery(event.target.value);
};
</script>

<style scoped>
/* CSS tidak berubah */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin: 10px auto;
  margin-top: 0%;
}

.search-bar .form-control {
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.search-bar .form-control:focus {
  outline: none;
  border-color: #00bcd4;
  box-shadow: 0 4px 20px rgba(0, 188, 212, 0.1);
}

.search-icon {
  position: absolute;
  left: 15px;
  font-size: 1.2em;
  color: #888;
  pointer-events: none;
}
</style>