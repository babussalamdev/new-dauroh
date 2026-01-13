import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

export interface AdminUser {
  Name: string;
  SK: string;       // Email
  Series: string;   // Role
  Whatsapp?: string;
  Gender?: string;
  Status?: string;
  PK?: string;
  Birth_Date?: string;
  Username?: string;
  CreatedAt?: string;
  [key: string]: any; 
}

export const useAdminUserStore = defineStore("adminUser", {
  state: () => ({
    users: [] as AdminUser[],
    loading: false,
    search: "",
    perPage: 10,
    currentPage: 1,
  }),

  getters: {
    filteredData(state): AdminUser[] {
      if (!state.search) return state.users;
      
      const keyword = state.search.toLowerCase();
      
      return state.users.filter((user) => {
        const name = user.Name ? String(user.Name).toLowerCase() : "";
        const email = user.SK ? String(user.SK).toLowerCase() : "";
        const role = user.Series ? String(user.Series).toLowerCase() : "";
        return name.includes(keyword) || 
               email.includes(keyword) || 
               role.includes(keyword);
      });
    },

    totalItems(): number { return this.filteredData.length; },
    
    totalPages(): number { 
        return Math.ceil(this.totalItems / this.perPage) || 1; 
    },
    
    paginatedData(): AdminUser[] {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredData.slice(start, end);
    },
  },

  actions: {
    changePage(page: number) {
      if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    },

    async getListaccount(forceRefresh = false) {
      if (this.users.length > 0 && !this.loading && !forceRefresh) return;
      
      this.loading = true;
      const { $apiBase } = useNuxtApp() as any;
      
      try {
        const res = await $apiBase.get("/list-account");
        const rawData = res.data || res; 
        
        if (Array.isArray(rawData)) {
            this.users = rawData;
        } else if (rawData && Array.isArray(rawData.data)) {
            this.users = rawData.data;
        } else {
            console.warn("Format response tidak dikenali:", rawData);
            this.users = [];
        }

      } catch (error: any) {
        console.error("Gagal memuat list account:", error);
      } finally {
        this.loading = false;
      }
    },

    async addAccount(formData: any) {
    },
  },
});