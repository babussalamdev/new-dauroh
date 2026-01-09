import { defineStore } from "pinia";
import Swal from "sweetalert2";
import type { AuthUser } from '~/types/auth';

export const useAdminUserStore = defineStore("adminUser", {
  state: () => ({
    users: [] as AuthUser[],
    loading: false,
    search: "",
    perPage: 10, // Naikkin dikit biar enak liatnya
    currentPage: 1,
  }),

  getters: {
    filteredData(state): AuthUser[] {
      if (!state.search) return state.users;
      return state.users.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(state.search.toLowerCase())
        )
      );
    },
    totalItems(): number { return this.filteredData.length; },
    totalPages(): number { return Math.ceil(this.totalItems / this.perPage) || 1; },
    paginatedData(): AuthUser[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredData.slice(start, start + this.perPage);
    },
  },

  actions: {
    changePage(page: number) {
      if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    },

    // Tambah parameter forceRefresh
    async getListaccount(forceRefresh = false) {
      if (this.users.length > 0 && !this.loading && !forceRefresh) return;
      
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      
      try {
        const res = await $apiBase.get("list-account");
        const rawData = res.data || res; 
        
        if (Array.isArray(rawData)) {
            this.users = rawData;
        } else if (Array.isArray(rawData.data)) {
            this.users = rawData.data;
        } else {
            this.users = [];
            console.warn("Format response tidak dikenali:", rawData);
        }

      } catch (error: any) {
        console.error("Gagal memuat:", error);
        // Optional: Reset data kalau error biar ga nampilin data basi
        // this.users = []; 
      } finally {
        this.loading = false;
      }
    },

    async addAccount(formData: any) {
    },
  },
});