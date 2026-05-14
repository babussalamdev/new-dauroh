import { defineStore } from 'pinia';

export const useCertificateStore = defineStore('certificate', {
  state: () => ({
    base64Image: null as string | null,
    imageErrors: [] as string[],
    config: {
      layout: 'landscape',
      fields: {
        eventTitle: true,
        name: true,
        domicile: true,
      },
      styles: {
        eventTitle: { top: 35, left: 50, fontSize: 32, color: '#004754' },
        name: { top: 55, left: 50, fontSize: 40, color: '#000000' },
        domicile: { top: 68, left: 50, fontSize: 20, color: '#444444' }
      }
    },
    // 🟢 TAMBAHAN BARU: Taruh teks preview di sini biar Canvas & PDF ngambil dari sumber yang sama
    previewData: {
      eventTitle: "Dauroh Ilmu Al-Qur'an",
      participantName: "Akbar Hermawan",
      domicile: "Depok, Jawa Barat"
    }
  }),

  actions: {
    async simpanKonfigurasi(eventId: string) {
      const payload = {
        event_id: eventId,
        image_base64: this.base64Image,
        config: this.config
      };

      console.log("MOCK API POST /api/certificates", payload);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 🟢 UBAH DI SINI: Ambil teksnya dari this.previewData
      const testData = {
        bgImage: this.base64Image, 
        config: this.config,       
        eventTitle: this.previewData.eventTitle,
        participantName: this.previewData.participantName,
        domicile: this.previewData.domicile
      };
      localStorage.setItem('cert_test_data', JSON.stringify(testData));

      return true; 
    }
  }
});