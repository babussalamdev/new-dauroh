import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import { useToastStore } from "~/stores/toast"; 

export interface AdminUser {
  Name: string;
  SK: string;       
  Series?: string;
  role?: string;
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
    currentType: "all", 
  }),

  getters: {
    filteredData(state): AdminUser[] {
      if (!state.search) return state.users;
      
      const keyword = state.search.toLowerCase();
      
      return state.users.filter((user) => {
        const name = user.Name ? String(user.Name).toLowerCase() : "";
        const email = user.SK ? String(user.SK).toLowerCase() : "";
        const roleSeries = user.Series ? String(user.Series).toLowerCase() : "";
        const roleReal = user.role ? String(user.role).toLowerCase() : "";
        
        return name.includes(keyword) || 
               email.includes(keyword) || 
               roleSeries.includes(keyword) ||
               roleReal.includes(keyword);
      });
    },
    totalItems(): number { return this.filteredData.length; },
    totalPages(): number { return Math.ceil(this.totalItems / this.perPage) || 1; },
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

    async getListaccount(type: string = 'all', forceRefresh = false) {
       if (this.users.length > 0 && this.currentType === type && !this.loading && !forceRefresh) return;
       
       this.loading = true;
       this.currentType = type; 
       
       const { $apiBase } = useNuxtApp() as any;
       try {
         const res = await $apiBase.get(`/list-account?type=${type}`);
         const rawData = res.data || res; 
         
         if (Array.isArray(rawData)) { this.users = rawData; }
         else if (rawData && Array.isArray(rawData.data)) { this.users = rawData.data; }
         else { this.users = []; }
         
         this.currentPage = 1;
       } catch (error: any) { 
          console.error(`Gagal load account (${type}):`, error); 
          this.users = [];
       } finally { 
          this.loading = false; 
       }
    },
   async changeUserStatus(email: string, newStatus: 'active' | 'inactive') {
      this.loading = true;
      const { $apiBase } = useNuxtApp() as any;
      const toast = useToastStore();

      try {
        await $apiBase.delete(`/disable-account?email=${email}&status=${newStatus}`);
        
        toast.showToast({
            message: `User berhasil di-${newStatus === 'inactive' ? 'blokir' : 'aktifkan'}!`,
            type: 'success'
        });
        await this.getListaccount(this.currentType, true);
        return true;

      } catch (error: any) {
        console.error("Gagal update status:", error);
        toast.showToast({ 
            message: error.response?.data?.message || "Gagal mengubah status user.", 
            type: 'danger' 
        });
        return false;
      } finally {
        this.loading = false;
      }
    },

    async addAccount(formData: any) {
      this.loading = true;
      const { $apiBase } = useNuxtApp() as any;
      const toast = useToastStore(); 

      try {
        await $apiBase.post("/signup-account?type=user-admin", formData);
        await this.getListaccount(this.currentType, true);
        toast.showToast({ message: 'User berhasil ditambahkan!', type: 'success' });
        return true;
      } catch (error: any) {
        console.error("Gagal tambah account:", error);
        toast.showToast({ message: error.response?.data?.message || "Gagal menambahkan user", type: 'danger' });
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});