<template>
  <button @click="generatePDF" :disabled="isGenerating">
    <span v-if="isGenerating" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
    <i v-else class="bi bi-download me-1"></i>
    <slot>{{ isGenerating ? 'Menyiapkan...' : 'Kuitansi' }}</slot>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import bgReceiptImage from '~/assets/img/Bg-Receipt.png';
import { useNuxtApp } from '#app'; 

const props = defineProps({
  transaction: { type: Object, required: true },
  event: { type: Object, required: true },
  participants: { type: [Array, Number] as any, required: true },
  discountAmount: { type: Number, default: 0 },
  infaqAmount: { type: Number, default: 0 }
});

const isGenerating = ref(false);
const { $apiBase } = useNuxtApp(); 

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

const generatePDF = async () => {
  try {
    isGenerating.value = true;

    // 🟢 LOGIKA SMART SK TRANSAKSI
    let skTransaksi = props.transaction.SK;
    if (!skTransaksi || skTransaksi.includes('@')) {
       const rawTitle = props.transaction.title || props.transaction.Title || "";
       if (rawTitle.includes('EVENT ')) {
           skTransaksi = rawTitle.replace('EVENT ', '').trim();
       } else {
           skTransaksi = props.transaction.id; 
       }
    }
    
    // API INVOICE
    const response = await $apiBase.get('/get-payment', {
      params: { type: 'invoice', sk: skTransaksi }
    });

    const invoiceData = response.data?.data || response.data;

    if (!invoiceData || !invoiceData.header) {
        throw new Error("Data invoice tidak lengkap dari server.");
    }

    const { header, peserta, ringkasan } = invoiceData;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // LOAD BACKGROUND
    const imgData = await fetch(bgReceiptImage).then(r => r.blob()).then(blob => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    });

    doc.addImage(imgData as string, 'PNG', 0, 0, 210, 297);
    const primaryColor = '#1e88e5'; 

    // 1. HEADER KIRI (INVOICE & DETAIL EVENT)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(primaryColor);
    doc.text('INVOICE', 20, 40);

    doc.setFontSize(11);
    doc.setTextColor('#333333');
    doc.text('Event:', 20, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`${header.event_name || '-'}`, 20, 53);

    // 2. HEADER KANAN (BRANDING WATERMARK DI POJOK ATAS)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor); 
    doc.text('tiket.sisalam.id', 190, 40, { align: 'right' }); // Sejajar tinggi dengan teks INVOICE

    const formattedDate = dayjs(header.tgl_invoice).format('DD MMM YYYY • HH:mm');

    // 3. TABEL PESERTA
    const tableData = peserta.map((p: any) => [
      p.nama || 'Peserta', 
      formatCurrency(Number(p.harga_tiket || 0))
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Nama Peserta', 'Harga Tiket']], 
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: '#ffffff', fontStyle: 'bold', halign: 'center' },
      columnStyles: { 
        0: { halign: 'left' }, 
        1: { halign: 'right' } 
      },
      margin: { left: 20, right: 20 }
    });

    // 4. AREA TENGAH (Satu level setelah tabel selesai)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    let currentY = finalY;

    // KIRI TENGAH: DETAIL ADMINISTRATIF TRANSAKSI
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#333333');
    doc.text(`Tgl Invoice : ${formattedDate}`, 20, finalY);
    doc.text(`ID Transaksi : ${header.id_transaksi || '-'}`, 20, finalY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#198754'); // Hijau status lunas
    doc.text(`Status : ${header.status || 'LUNAS'}`, 20, finalY + 10);

    // KANAN TENGAH: KALKULASI RINGKASAN HARGA
    doc.setFontSize(10);
    doc.setTextColor('#333333');
    doc.setFont('helvetica', 'normal');

    // Sub-Total
    doc.text('Sub-Total', 140, currentY);
    doc.text(formatCurrency(Number(ringkasan.sub_total || 0)), 190, currentY, { align: 'right' });

    // Diskon / Voucher 
    if (Number(ringkasan.diskon_voucher || 0) > 0) {
      currentY += 7;
      doc.text('Diskon / Voucher', 140, currentY);
      doc.setTextColor('#dc3545'); 
      doc.text(`- ${formatCurrency(Number(ringkasan.diskon_voucher))}`, 190, currentY, { align: 'right' });
      doc.setTextColor('#333333'); 
    }

    // Infaq 
    if (Number(ringkasan.infaq || 0) > 0) {
      currentY += 7;
      doc.text('Infaq / Donasi', 140, currentY);
      doc.text(`+ ${formatCurrency(Number(ringkasan.infaq))}`, 190, currentY, { align: 'right' });
    }

    // Kotak Grand Total
    const grandTotalY = currentY + 15;
    doc.setFillColor(primaryColor);
    doc.rect(120, grandTotalY - 6, 70, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#ffffff');
    doc.text('Grand Total:', 125, grandTotalY);
    doc.text(formatCurrency(Number(ringkasan.grand_total || 0)), 185, grandTotalY, { align: 'right' });

    // 5. AREA BAWAH (FOOTER & TERMS AND CONDITIONS)
    // Diletakkan secara absolut di area bawah halaman (A4 tinggi maksimal 297mm)
    const footerStartY = 250; 
    
    doc.setTextColor('#333333');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Catatan / Terms:', 20, footerStartY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jazakumullah Khairan. Tiket ini adalah bukti sah pembayaran pendaftaran Anda.', 20, footerStartY + 5);
    doc.text('Harap tunjukkan QR Code pada saat registrasi ulang di lokasi event.', 20, footerStartY + 10);

    // Mini Watermark Tambahan di paling bawah sendiri
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.text('Dicetak oleh sistem tiket babussalam.', 20, 280);

    // Eksekusi Download
    doc.save(`Invoice_${header.id_transaksi || 'Dauroh'}.pdf`);
    
  } catch (error: any) {
    console.error("Gagal generate PDF:", error);
    alert(error.message || "Gagal mengunduh kuitansi.");
  } finally {
    isGenerating.value = false;
  }
};
</script>