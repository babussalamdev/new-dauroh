// app/stores/adminUser.ts

import { defineStore } from "pinia";
import Swal from "sweetalert2";
import type { AuthUser } from '~/types/auth'; // Menggunakan tipe AuthUser yang sudah ada
import { useNuxtApp } from "#app"; // Import useNuxtApp untuk $apiBase

// Tipe untuk form data, diambil dari create.vue (name, email, password, role)
type UserFormData = Partial<AuthUser> & {
  password?: string;
};

export const useAdminUserStore = defineStore("adminUser", {
  state: () => ({
    users: [] as AuthUser[], // Mengganti 'account' menjadi 'users' agar sesuai dengan file index.vue Anda
    loading: false,
    search: "",
    perPage: 5, // Menggunakan 5 seperti contoh referensi UKS
    currentPage: 1,
  }),

  getters: {
    // Getter ini memfilter state.users berdasarkan state.search
    filteredData(state): AuthUser[] {
      if (!state.search) {
        return state.users;
      }
      return state.users.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(state.search.toLowerCase())
        )
      );
    },
    
    // Getter ini (dan di bawahnya) perlu 'this' untuk mengakses getter 'filteredData'
    totalItems(): number {
      return this.filteredData.length;
    },

    totalPages(): number {
      return Math.ceil(this.totalItems / this.perPage) || 1;
    },

    paginatedData(): AuthUser[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredData.slice(start, start + this.perPage);
    },
  },

  actions: {
    // Aksi untuk ganti halaman
    changePage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Aksi untuk mengambil data user (GET /list-account)
    async getListaccount() {
      // Guard agar tidak fetch ulang jika data sudah ada
      if (this.users.length > 0 && !this.loading) return; 
      
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      
      try {
        const res = await $apiBase.get("list-account");
        
        // Diambil dari contoh referensi UKS (langsung assign)
        // Ini berasumsi API mengembalikan array yang sesuai dengan tipe AuthUser[]
        this.users = res.data; 

      } catch (error: any) {
        console.error("Gagal memuat daftar user:", error.message);
        // Tampilkan error di console, tidak menggunakan toast
      } finally {
        this.loading = false;
      }
    },

    // Aksi untuk tambah user baru (POST /signup-account?type=user-admin)
    // Disesuaikan dengan form di 'create.vue', bukan 'inputAccount' dari UKS
    async addAccount(formData: UserFormData) {
      this.loading = true;
      const { $apiBase } = useNuxtApp();

      try {
        // Menggunakan endpoint yang Anda berikan
        const res = await $apiBase.post(`signup-account?type=user-admin`, formData);
        
        if (res.data) {
          // Tambahkan user baru ke awal array agar langsung terlihat
          this.users.unshift(res.data);
        }
        
        Swal.fire({
          icon: "success",
          title: "User Berhasil Dibuat",
          showConfirmButton: false,
          timer: 1500,
        });
        return true; // Mengembalikan status sukses

      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Gagal menambahkan user baru.";
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: errorMessage,
        });
        return false; // Mengembalikan status gagal
        
      } finally {
        this.loading = false;
      }
    },
  },
});