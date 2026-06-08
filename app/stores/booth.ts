import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import { useToastStore } from "./toast";
import type { BoothSubmission } from "~/types/booth";

export const useBoothStore = defineStore("booth", {
  state: () => ({
    submissions: [] as BoothSubmission[],
    loading: false,
  }),

  getters: {
    // Sortir data terbaru di atas
    sortedSubmissions(state): BoothSubmission[] {
      return [...state.submissions].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  },

  actions: {
    // Aksi untuk mengambil semua data pengajuan
    async fetchSubmissions() {
      // Sesuai permintaan: tidak ada data dummy,
      // jadi jika data sudah ada, bisa fetch ulang (atau  skip jika Anda mau)
      // if (this.submissions.length > 0) return;

      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      try {
        // const response = await $apiBase.get('/api/booth-requests');
        // this.submissions = response.data;
        this.submissions = []; // Fallback sementara karena API belum ada

      } catch (error: any) {
        toastStore.showToast({
          message: `Gagal memuat data pengajuan booth: ${error.message}`,
          type: "danger",
        });
      } finally {
        this.loading = false;
      }
    },

    // Aksi untuk mengubah status pengajuan (Setujui/Tolak)
    async updateSubmissionStatus(submissionSK: string, newStatus: 'Disetujui' | 'Ditolak') {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      // Optimistic UI update
      const submission = this.submissions.find(s => s.SK === submissionSK);
      if (!submission) return;

      const oldStatus = submission.status;
      submission.status = newStatus; // Langsung ubah di state

      try {
        // API di-comment sementara
        // await $apiBase.put(`/api/booth-requests/${submissionSK}/status`, { 
        //   status: newStatus 
        // });

        toastStore.showToast({
          message: `Status untuk "${submission.boothName}" berhasil diubah.`,
          type: "success",
        });

      } catch (error: any) {
        // Rollback jika gagal
        submission.status = oldStatus;
        toastStore.showToast({
          message: `Gagal mengubah status: ${error.message}`,
          type: "danger",
        });
      }
    },
  },
});