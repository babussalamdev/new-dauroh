import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import { useToastStore } from "~/stores/toast"; 

export interface AdminUser {
  Name: string;
  SK: string;       
  Series?: string;  // Kita kasih tanda ? (optional)
  role?: string;    // <--- TAMBAHIN INI (PENTING!)
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
        
        // Cek Role di kedua field (Series atau role)
        const roleSeries = user.Series ? String(user.Series).toLowerCase() : "";
        const roleReal = user.role ? String(user.role).toLowerCase() : "";
        
        return name.includes(keyword) || 
               email.includes(keyword) || 
               roleSeries.includes(keyword) ||
               roleReal.includes(keyword);
      });
    },
    // ... (sisanya sama, tidak perlu diubah) ...
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
    async getListaccount(forceRefresh = false) {
       // ... (kode getListaccount sama, tidak perlu diubah) ...
       if (this.users.length > 0 && !this.loading && !forceRefresh) return;
       this.loading = true;
       const { $apiBase } = useNuxtApp() as any;
       try {
         const res = await $apiBase.get("/list-account");
         const rawData = res.data || res; 
         if (Array.isArray(rawData)) { this.users = rawData; }
         else if (rawData && Array.isArray(rawData.data)) { this.users = rawData.data; }
         else { this.users = []; }
       } catch (error: any) { console.error("Gagal load account:", error); } 
       finally { this.loading = false; }
    },
    
    async addAccount(formData: any) {
      this.loading = true;
      const { $apiBase } = useNuxtApp() as any;
      const toast = useToastStore(); 

      try {
        await $apiBase.post("/signup-account?type=user-admin", formData);
        
        await this.getListaccount(true);
        
        toast.showToast({
            message: 'User berhasil ditambahkan!',
            type: 'success'
        });

        return true;

      } catch (error: any) {
        console.error("Gagal tambah account:", error);
        
        const resData = error.response?.data;
        let msg = resData?.message || resData?.error || error.message || "Gagal menambahkan user";
        toast.showToast({
            message: msg,
            type: 'danger'
        });

        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});