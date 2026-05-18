import { defineStore } from 'pinia';
import { useNuxtApp, useCookie } from '#app';
import { useToastStore } from './toast';

export const useCertificateStore = defineStore('certificate', {
  state: () => ({
    base64Image: null as string | null,
    oldPictureName: "" as string, 
    imageErrors: [] as string[],
    
    previewData: {
      eventTitle: "JUDUL EVENT",
      participantName: "NAMA PESERTA",
      domicile: "DOMISILI"
    },

    config: {
      layout: 'landscape',
      fields: { eventTitle: true, name: true, domicile: true },
      styles: {
        eventTitle: { top: 35, left: 50, fontSize: 20, color: '#004754' },
        name: { top: 55, left: 50, fontSize: 30, color: '#000000' },
        domicile: { top: 68, left: 50, fontSize: 20, color: '#444444' }
      }
    }
  }),

  actions: {
    // TARIK DATA DARI SERVER
    async fetchCertificateData(eventSK: string) {
      try {
        const { $apiBase } = useNuxtApp() as any;
        
        const res = await $apiBase.get('/get-default', {
          params: { type: 'event', sk: eventSK }
        });
        const dataPayload = res.data?.event || res.data;
        const eventData = Array.isArray(dataPayload) ? dataPayload[0] : dataPayload;

        if (eventData) {
          // Set Gambar & Nama Lama
          if (eventData.Certificate_Picture) {
            this.base64Image = eventData.Certificate_Picture;
            this.oldPictureName = eventData.Certificate_Picture;
          } else {
            this.base64Image = null;
            this.oldPictureName = "";
          }

          // Set Konfigurasi / Koordinat
          if (eventData.Certificate_Configuration?.design) {
            this.config = eventData.Certificate_Configuration.design;
          }
        }
        return true;
      } catch (error) {
        console.error("Gagal fetch data sertifikat:", error);
        return false;
      }
    },

    // UPLOAD GAMBAR
    async uploadImageOnly(eventSK: string) {
      if (!eventSK || eventSK === 'undefined') {
        console.error("STOP: SK kosong, API tidak dijalankan.");
        return false;
      }
      
      const token = useCookie("AccessToken").value;
      if (!token || !this.base64Image) return false;
      
      const toast = useToastStore();

      try {
        const { $apiBase } = useNuxtApp() as any;
        
        const payload = {
          AccessToken: token,
          OldPicture: this.oldPictureName,
          Certificate_Picture: this.base64Image.includes("base64,") ? this.base64Image.split(",")[1] : this.base64Image
        };

        const res = await $apiBase.put(`/update-default?type=certificate-photo&sk=${eventSK}`, payload);
        const newPic = res.data?.Certificate_Picture || res.data?.event?.Certificate_Picture;
        
        if (newPic) {
          this.oldPictureName = newPic;
        }

        return true;
      } catch (error: any) {
        console.error("Gagal upload template sertifikat:", error);
        toast.showToast({ message: "Gagal mengunggah template.", type: "danger" });
        throw error;
      }
    },

    // SIMPAN CONFIG / KOORDINAT TATA LETAK
    async saveConfigOnly(eventSK: string) {
      const token = useCookie("AccessToken").value;
      if (!token) return { ok: false };

      try {
        const { $apiBase } = useNuxtApp() as any;
        const payload = {
          AccessToken: token,
          Certificate_Configuration: {
            design: {
              layout: this.config.layout,
              styles: this.config.styles,
              fields: this.config.fields
            }
          }
        };

        await $apiBase.put(`/update-default?type=event&sk=${eventSK}`, payload);
        return { ok: true };

      } catch (error: any) {
        console.error("Gagal save config:", error);
        throw error;
      }
    }
  }
});