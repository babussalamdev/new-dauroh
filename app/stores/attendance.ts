import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNuxtApp } from '#app';
import { useAuth } from '~/composables/useAuth';
import { useGlobalEventStore } from '~/stores/globalEvent';
import type { AttendanceParticipant } from '~/types/attendance';

export const useAttendanceStore = defineStore('attendance', () => {

  // --- STATE ---
  const participants = ref<AttendanceParticipant[]>([]); 
  const loading = ref(false);

  // --- ACTIONS ---
  async function fetchAttendanceData(statusType: 'present' | 'not-present' = 'present') {
    const globalStore = useGlobalEventStore(); 

    if (!globalStore.activeEventSK) return; 
    
    loading.value = true;
    participants.value = [];

    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get('/get-attendance', {
        params: {
          type: statusType,
          sk: globalStore.activeEventSK
        }
      });

      const rawData = res.data || [];
      participants.value = rawData.map((p: any) => ({
        pk: p.PK, 
        name: p.Name,
        ticketId: p.SK, 
        gender: p.Gender?.toLowerCase() === 'akhwat' ? 'p' : 'l', 
        age: p.Age,
        scanTime: p.CheckIn || null, 
        status: statusType === 'present' ? 'hadir' : 'belum',
        isCertificateSent: p.Certificate_Eligible === 'true'
      }));

    } catch (error) {
      console.error("Gagal ambil data kehadiran:", error);
    } finally {
      loading.value = false;
    }
  }

  // Fungsi untuk check-in Manual (Admin)
  async function markManualAttendance(pk: string, sk: string) {
    try {
      const { $apiBase } = useNuxtApp() as any;
      const { accessToken } = useAuth();

      const payload = {
        AccessToken: accessToken.value,
        PK: pk,
        SK: sk
      };

      await $apiBase.put('/update-attendance?type=admin', payload);

      // Auto-hapus peserta dari state jika saat ini lagi buka tab "not-present"
      participants.value = participants.value.filter(p => p.ticketId !== sk);

      return { success: true };
    } catch (error: any) {
      console.error("Gagal check-in manual:", error);
      return { success: false, message: error.response?.data?.message || 'Gagal mengubah status.' };
    }
  }

  async function markScanAttendance(pk: string, sk: string) {
    try {
      const { $apiBase } = useNuxtApp() as any;
      const { accessToken } = useAuth();

      const payload = {
        AccessToken: accessToken.value,
        PK: pk,
        SK: sk
      };

      await $apiBase.put('/update-attendance?type=scan', payload);

      return { success: true };
    } catch (error: any) {
      console.error("Gagal scan tiket:", error);
      return { success: false, message: error.response?.data?.message || 'Tiket gagal dipindai.' };
    }
  }

  // Ambil data sertifikat peserta
  async function fetchCertificatePreview(pk: string, sk: string, esk: string) {
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get('/get-attendance', {
        params: {
          type: 'certificate-preview',
          pk: pk,
          sk: sk,
          esk: esk
        }
      });
      return res.data; 
    } catch (error) {
      console.error("Gagal tarik preview sertifikat:", error);
      return null;
    }
  }

 async function distributeCertificatesBulk(updatesPayload: any[]) {
    try {
      const { $apiBase } = useNuxtApp() as any;
      const { accessToken } = useAuth();
      const payload = {
        AccessToken: accessToken.value,
        Updates: updatesPayload
      };

      await $apiBase.put('/update-attendance?type=certificate-eligible', payload);
      updatesPayload.forEach(update => {
        const participant = participants.value.find(p => p.ticketId === update.SK);
        if (participant) {
           participant.isCertificateSent = true; // Kita tandain udah dikirim
        }
      });
      
      return true;
    } catch (error) {
      console.error("Gagal membagikan sertifikat:", error);
      return false;
    }
  }


  return {
    participants,
    loading,
    fetchAttendanceData,
    markManualAttendance,
    markScanAttendance,
    fetchCertificatePreview,
    distributeCertificatesBulk
  };
});