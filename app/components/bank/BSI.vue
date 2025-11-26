<template>
  <div class="p-2">
    
    <ul class="nav nav-pills justify-content-center mb-4 gap-2" id="bsi-tab" role="tablist">
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'mobile' }" 
          @click="type = 'mobile'"
        >BSI Mobile</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'byond' }" 
          @click="type = 'byond'"
        >Byond by BSI</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'net' }" 
          @click="type = 'net'"
        >BSI Net</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'atm' }" 
          @click="type = 'atm'"
        >ATM</button>
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
      
      <ol v-if="type === 'mobile'" class="mb-0 ps-3">
        <li>Buka aplikasi <strong>BSI Mobile</strong>.</li>
        <li>Pilih menu <strong>Pembayaran</strong> / <strong>Payment</strong>.</li>
        <li>Pilih menu <strong>Institusi</strong> (atau E-commerce jika menggunakan merchant).</li>
        <li>Masukkan Nama Institusi/Kode (Jika ada) atau langsung masukkan Nomor VA.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan PIN BSI Mobile.</li>
        <li>Pastikan data pembayaran benar, lalu konfirmasi.</li>
        <li>Transaksi selesai.</li>
      </ol>

      <ol v-if="type === 'byond'" class="mb-0 ps-3">
        <li>Buka Aplikasi dan login <strong>Byond by BSI</strong>.</li>
        <li>Pilih menu <strong>Bayar dan Beli</strong>.</li>
        <li>Pilih <strong>Virtual Account</strong>.</li>
        <li>Input Nomor Virtual Account: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Pastikan informasi yang tertera di layar sudah benar (Nominal: <strong>{{ formatCurrency(amount) }}</strong>).</li>
        <li>Klik <strong>Konfirmasi</strong> dan masukkan PIN.</li>
        <li>Transaksi berhasil dilakukan.</li>
      </ol>

      <ol v-if="type === 'net'" class="mb-0 ps-3">
        <li>Buka <strong>BSI Net</strong> (Internet Banking).</li>
        <li>Pilih menu <strong>Pembayaran</strong>.</li>
        <li>Pilih Jenis Pembayaran <strong>Institusi</strong>.</li>
        <li>Masukkan Nomor Pembayaran/VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Klik tombol <strong>Verifikasi Aplikasi Pembayaran</strong>.</li>
        <li>Masukkan PIN dan Token BSI Net.</li>
        <li>Klik tombol <strong>Submit</strong>.</li>
        <li>Transaksi selesai.</li>
      </ol>

      <ol v-if="type === 'atm'" class="mb-0 ps-3">
        <li>Masukkan kartu ATM & PIN.</li>
        <li>Pilih menu <strong>Pembayaran/Pembelian</strong>.</li>
        <li>Pilih menu <strong>Akademik/Institusi</strong>.</li>
        <li>Masukkan Kode Institusi (jika diminta) + Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Tekan <strong>Benar</strong>.</li>
        <li>Pastikan data benar, lalu tekan <strong>Benar</strong> pada layar konfirmasi.</li>
        <li>Transaksi selesai.</li>
      </ol>

      <ol v-if="type === 'other'" class="mb-0 ps-3">
        <li>Buka menu <strong>Transfer Antar Bank</strong> (Online/BI-Fast).</li>
        <li>Pilih Bank Tujuan: <strong>BSI (451)</strong>.</li>
        <li>Masukkan Nomor Rekening Tujuan (Nomor VA): <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan jumlah pembayaran: <strong>{{ formatCurrency(amount) }}</strong> (Harus sesuai).</li>
        <li>Ikuti instruksi selanjutnya untuk menyelesaikan transaksi.</li>
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

const type = ref('mobile');

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>

<style scoped>
@import url("~/assets/css/components/bank.css");
</style>