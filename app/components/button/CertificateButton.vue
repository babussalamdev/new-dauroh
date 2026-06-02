<template>
  <button 
    @click="downloadCertificate" 
    :disabled="isGenerating"
    class="btn btn-sm btn-outline-success py-1 px-3 rounded-pill txt-caption fw-bold"
  >
    <span v-if="isGenerating" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
    <i v-else></i>
    {{ isGenerating ? 'Menyiapkan...' : 'Unduh Sertifikat' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { jsPDF } from 'jspdf';
import { useNuxtApp, useRuntimeConfig } from '#app';

const props = defineProps({
  pk: { type: String, required: true },  // ID Transaksi
  sk: { type: String, required: true },  // ID Peserta
  esk: { type: String, required: true }  // ID Event
});

const isGenerating = ref(false);
const { $apiBase } = useNuxtApp();
const config = useRuntimeConfig();
const imgBaseUrl = config.public.img || 'https://d29bixrlxe7n06.cloudfront.net';

const downloadCertificate = async () => {
  try {
    isGenerating.value = true;

    // API PREVIEW SERTIFIKAT
    const response = await $apiBase.get('/get-attendance', {
      params: {
        type: 'certificate-preview',
        pk: props.pk,
        sk: props.sk,
        esk: props.esk
      }
    });

    const certData = response.data?.data || response.data;
    if (!certData || !certData.Certificate_Configuration?.design) {
      throw new Error("Konfigurasi sertifikat tidak ditemukan.");
    }

    // Cuma ambil design dari Configuration
    const { design } = certData.Certificate_Configuration;
    const layout = design.layout || 'landscape';
    const isLandscape = layout === 'landscape';

    // 2. SETUP PDF
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;

    // 3. LOAD GAMBAR BACKGROUND DARI CLOUDFRONT
  
    const picName = certData.Certificate_Picture;
    const imageUrl = `${imgBaseUrl}/${props.esk}/${picName}.webp?t=${new Date().getTime()}`;
    const imgData = await fetch(imageUrl, {
        mode: 'cors',
        cache: 'no-cache'
      })
      .then(r => {
        if (!r.ok) throw new Error("Gagal memuat template gambar sertifikat.");
        return r.blob();
      })
      .then(blob => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });

    // Tempel background memenuhi kertas A4
    doc.addImage(imgData as string, 'WEBP', 0, 0, pageWidth, pageHeight);
    const drawText = (textKey: string) => {
      const style = design.styles[textKey];
      const textValue = design.fields[textKey];

      if (!style || !textValue) return;

      // Konversi persentase menjadi milimeter
      const x = (style.left / 100) * pageWidth;
      const y = (style.top / 100) * pageHeight;
      const calculatedFontSize = style.fontSize ? (style.fontSize / 1123) * 297 * 3.5 : 16;
      
      doc.setFont('helvetica', textKey === 'name' ? 'bold' : 'normal');
      doc.setFontSize(calculatedFontSize);
      doc.setTextColor(style.color || '#000000');

      // align center & baseline middle = transform: translate(-50%, -50%)
      doc.text(textValue.trim(), x, y, { align: 'center', baseline: 'middle' });
    };

    // Eksekusi print text sesuai ketersediaan data di fields
    if (design.fields.eventTitle) drawText('eventTitle');
    if (design.fields.name) drawText('name');
    if (design.fields.domicile) drawText('domicile');

    // 5. DOWNLOAD PDF
    const cleanFileName = (design.fields.name || 'Sertifikat').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Sertifikat_${cleanFileName}.pdf`);

  } catch (error: any) {
    console.error("Gagal cetak sertifikat:", error);
    alert(error.message || "Terjadi kesalahan saat mengunduh sertifikat.");
  } finally {
    isGenerating.value = false;
  }
};
</script>