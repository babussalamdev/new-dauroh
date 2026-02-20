import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useNuxtApp } from "#app";
import { useToastStore } from "~/stores/toast";
// Import interface dari folder types
import type { AdminUser } from "~/types/admin"; 

export const useAdminUserStore = defineStore("adminUser", () => {
  // --- State ---
  const users = ref<AdminUser[]>([]);
  const loading = ref(false);
  const search = ref("");
  const perPage = ref(10);
  const currentPage = ref(1);
  const currentType = ref("all");

  // --- Getters ---
  const filteredData = computed(() => {
    if (!search.value) return users.value;
    const keyword = search.value.toLowerCase();

    return users.value.filter((user) => {
      const name = user.Name ? String(user.Name).toLowerCase() : "";
      const email = user.SK ? String(user.SK).toLowerCase() : "";
      const roleSeries = user.Series ? String(user.Series).toLowerCase() : "";
      const roleReal = user.role ? String(user.role).toLowerCase() : "";

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        roleSeries.includes(keyword) ||
        roleReal.includes(keyword)
      );
    });
  });

  const totalItems = computed(() => filteredData.value.length);
  const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value) || 1);

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredData.value.slice(start, end);
  });

  // --- Actions ---
  function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  async function getListaccount(type: string = 'all', forceRefresh = false) {
    if (users.value.length > 0 && currentType.value === type && !loading.value && !forceRefresh) return;

    loading.value = true;
    currentType.value = type;

    const { $apiBase } = useNuxtApp() as any;
    try {
      const res = await $apiBase.get(`/list-account?type=${type}`);
      const rawData = res.data || res;

      if (Array.isArray(rawData)) {
        users.value = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        users.value = rawData.data;
      } else {
        users.value = [];
      }
      currentPage.value = 1;
    } catch (error: any) {
      console.error(`Gagal load account (${type}):`, error);
      users.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function changeUserStatus(email: string, newStatus: 'active' | 'inactive') {
    loading.value = true;
    const { $apiBase } = useNuxtApp() as any;
    const toast = useToastStore();

    try {
      await $apiBase.delete(`/disable-account?email=${email}&status=${newStatus}`);
      toast.showToast({
        message: `User berhasil di-${newStatus === 'inactive' ? 'blokir' : 'aktifkan'}!`,
        type: 'success'
      });
      await getListaccount(currentType.value, true);
      return true;
    } catch (error: any) {
      toast.showToast({
        message: error.response?.data?.message || "Gagal mengubah status user.",
        type: 'danger'
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function addAccount(formData: any) {
    loading.value = true;
    const { $apiBase } = useNuxtApp() as any;
    const toast = useToastStore();

    try {
      await $apiBase.post("/signup-account?type=user-admin", formData);
      await getListaccount(currentType.value, true);
      toast.showToast({ message: 'User berhasil ditambahkan!', type: 'success' });
      return true;
    } catch (error: any) {
      toast.showToast({ 
        message: error.response?.data?.message || "Gagal menambahkan user", 
        type: 'danger' 
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    users, loading, search, perPage, currentPage, currentType,
    filteredData, totalItems, totalPages, paginatedData,
    changePage, getListaccount, changeUserStatus, addAccount
  };
});