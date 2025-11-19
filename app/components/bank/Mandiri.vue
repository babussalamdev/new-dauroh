<template>
  <div class="p-2">
    
    <ul class="nav nav-pills justify-content-center mb-4 gap-2" id="mandiri-tab" role="tablist">
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'livin' }" 
          @click="type = 'livin'"
        >Livin' by Mandiri</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'atm' }" 
          @click="type = 'atm'"
        >ATM Mandiri</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'other' }" 
          @click="type = 'other'"
        >Bank Lain</button>
      </li>
    </ul>

    <div class="instruction-content border rounded p-3 bg-light">
      
      <ol v-if="type === 'livin'" class="mb-0 ps-3">
        <li>Login ke aplikasi <strong>Livin' by Mandiri</strong>.</li>
        <li>Pilih menu <strong>Bayar</strong>.</li>
        <li>Ketik <strong>“DOKU VA Aggregator”</strong> atau <strong>“88899”</strong> pada kolom pencarian penyedia jasa.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan nominal pembayaran: <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Tekan <strong>Lanjutkan</strong>.</li>
        <li>Pastikan detail pembayaran (No VA dan Jumlah) sudah sesuai.</li>
        <li>Pilih Rekening Sumber.</li>
        <li>Pilih <strong>Lanjut Bayar</strong> kemudian masukkan PIN dan konfirmasi.</li>
        <li>Transaksi selesai, simpan resi sebagai bukti.</li>
      </ol>

      <ol v-if="type === 'atm'" class="mb-0 ps-3">
        <li>Masukkan Kartu ATM Mandiri dan PIN.</li>
        <li>Pilih menu <strong>Bayar/Beli</strong>.</li>
        <li>Pilih menu <strong>Lainnya</strong> > <strong>Lainnya</strong> > <strong>Multipayment</strong>.</li>
        <li>Masukkan Kode Perusahaan / Institusi: <strong>88899</strong>, lalu tekan <strong>BENAR</strong>.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan nominal pembayaran, lalu tekan <strong>Lanjutkan</strong>.</li>
        <li>Pastikan detail pembayaran sudah benar.</li>
        <li>Konfirmasi pembayaran dengan pilih <strong>YA</strong>.</li>
        <li>Transaksi selesai, simpan struk transaksi.</li>
      </ol>

      <ol v-if="type === 'other'" class="mb-0 ps-3">
        <li>Buka menu <strong>Transfer</strong> > <strong>Ke Rek Bank Lain</strong>.</li>
        <li>Masukkan Kode Bank Mandiri: <strong>008</strong>.</li>
        <li>Masukkan Nomor Rekening Tujuan (Kode Bayar): <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan jumlah pembayaran: <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Pilih <strong>Benar</strong>.</li>
        <li>Muncul layar Konfirmasi Transfer. Pastikan Nomor Rekening, Nama, dan Jumlah sudah benar.</li>
        <li>Tekan <strong>Benar</strong> untuk menyelesaikan transaksi.</li>
      </ol>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CopyButton from '~/components/bank/CopyButton.vue';

const props = defineProps<{
  vaNumber: string;
  amount: number;
}>();

const type = ref('livin');

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>

<style scoped>
.nav-pills .nav-link {
  color: var(--bs-secondary);
  border: 1px solid #dee2e6;
  background-color: #fff;
  margin-bottom: 5px;
}
.nav-pills .nav-link.active {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>