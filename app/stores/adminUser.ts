// app/stores/adminUser.ts

import { defineStore } from "pinia";
import Swal from "sweetalert2";
import type { AuthUser } from '~/types/auth'; //   gunakan tipe AuthUser yang sudah ada

// Definisikan tipe User yang akan   gunakan di store
//   tambahkan properti 'password' opsional untuk form
type UserFormData = Partial<AuthUser> & {
  password?: string;
  // Tambahkan properti lain dari API /list-account jika ada (cth: sk, user_id, dll)
  // Untuk saat ini   asumsikan email adalah ID unik
};

export const useAdminUserStore = defineStore("adminUser", {
  state: () => ({
    users: [] as AuthUser[],
    loading: false,
    search: "",
    perPage: 10, // Kamu bisa sesuaikan
    currentPage: 1,
  }),

  getters: {
    // Getter ini hanya pakai state, jadi arrow function tidak masalah
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
    
    // * Getter ini mengakses getter lain (filteredData).
    // Jadi,   HARUS pakai function biasa dan `this`.
    totalItems(): number {
      return this.filteredData.length; // Gunakan `this.filteredData`
    },

    // * Getter ini mengakses state (perPage) dan getter lain (totalItems).
    // Harus pakai function biasa dan `this`.
    totalPages(): number {
      // Akses totalItems lewat `this` dan state.perPage lewat `this`
      return Math.ceil(this.totalItems / this.perPage) || 1;
    },

    // * Getter ini mengakses state (currentPage, perPage) dan getter (filteredData).
    // Harus pakai function biasa dan `this`.
    paginatedData(): AuthUser[] {
      const start = (this.currentPage - 1) * this.perPage;
      // Akses filteredData dan state.perPage lewat `this`
      return this.filteredData.slice(start, start + this.perPage);
    },
  },

  actions: {
    // Aksi ganti halaman dari contohmu
    changePage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Aksi ambil data /list-account
    async getListaccount() {
      if (this.users.length > 0 && !this.loading) return; // Jangan fetch ulang jika sudah ada
      
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore(); // Gunakan toastStore dari dauroh
      
      try {
        const res = await $apiBase.get("list-account");
        // Asumsikan res.data adalah array of users
        //   sesuaikan dengan tipe AuthUser
        this.users = res.data.map((user: any): AuthUser => ({
          name: user.name || user.username || 'N/A',
          email: user.email,
          role: user.role || 'user',
          email_verified: user.email_verified || false,
          // tambahkan properti lain jika ada dari API
        }));
      } catch (error: any) {
        toastStore.showToast({
          message: `Gagal memuat daftar user: ${error.message}`,
          type: "danger",
        });
      } finally {
        this.loading = false;
      }
    },

    // Aksi untuk tambah user baru (dipakai di create.vue)
    async addAccount(formData: UserFormData) {
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      try {
        //   gunakan endpoint dari contohmu: signup-account?type=user-admin
        const res = await $apiBase.post(`signup-account?type=user-admin`, formData);
        
        if (res.data) {
          // Tambahkan user baru ke state agar reaktif
          this.users.unshift(res.data);
        }
        
        Swal.fire({
          icon: "success",
          title: "User Berhasil Dibuat",
          showConfirmButton: false,
          timer: 1500,
        });
        return true; // Berhasil

      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Gagal menambahkan user baru.";
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: errorMessage,
        });
        return false; // Gagal
        
      } finally {
        this.loading = false;
      }
    },

    // Aksi untuk hapus user
    async deleteAccount(email: string) {
      // Tampilkan konfirmasi dulu
      const result = await Swal.fire({
        title: 'Anda yakin?',
        text: `Ingin menghapus user dengan email: ${email}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      });

      if (!result.isConfirmed) {
        return false; // Batal
      }

      // Lanjutkan hapus jika dikonfirmasi
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessToken = useCookie("AccessToken").value; // Ambil token untuk auth

      try {
        // Endpoint ini spekulatif, sesuaikan dengan API-mu
        // Mungkin: /delete-account?email=... atau /delete-account/user_id
        await $apiBase.delete(`/delete-account?email=${email}`, {
          data: { AccessToken: accessToken }, // Kirim token jika diperlukan
        });

        // Hapus user dari state
        this.users = this.users.filter(user => user.email !== email);
        
        toastStore.showToast({
          message: "User berhasil dihapus.",
          type: "success",
        });
        return true; // Berhasil

      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || "Gagal menghapus user.";
        toastStore.showToast({
          message: errorMessage,
          type: "danger",
        });
        return false; // Gagal
      
      } finally {
        this.loading = false;
      }
    },
    
    // bisa tambahkan updateAccount di sini
    // async updateAccount(formData: UserFormData) { ... }
  },
});