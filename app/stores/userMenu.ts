import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserMenuStore = defineStore('userMenu', () => {
  // STATE
  const menus = ref<any[]>([]);

  // ACTION: Buat nyimpen menu pas login
  function setMenus(newMenus: any[]) {
    menus.value = newMenus;
  }

  // ACTION: Buat ngosongin menu pas logout
  function resetStore() {
    menus.value = [];
  }

  return { 
    menus, 
    setMenus, 
    resetStore 
  };
});