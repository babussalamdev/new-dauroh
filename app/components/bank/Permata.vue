<template>
  <div class="p-2">
    
    <ul class="nav nav-pills justify-content-center mb-4 gap-2" id="permata-tab" role="tablist">
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'm-banking' }" 
          @click="type = 'm-banking'"
        >PermataNet</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'apk' }" 
          @click="type = 'apk'"
        >Mobile X</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'atm' }" 
          @click="type = 'atm'"
        >ATM Permata</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'other' }" 
          @click="type = 'other'"
        >ATM Lain</button>
      </li>
    </ul>

    <div class="instruction-content border rounded p-3 bg-light">
      
      <ol v-if="type === 'm-banking'" class="mb-0 ps-3">
        <li>Login ke akun internet banking PermataNet.</li>
        <li>Pilih menu <strong>Pembayaran</strong> lalu pilih <strong>Pembayaran Lainnya</strong>.</li>
        <li>Masukkan Kode Bank Permata (013) sebagai bank tujuan (jika diminta).</li>
        <li>Masukkan nominal transaksi: <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Masukkan 16 digit Nomor Virtual Account: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Konfirmasi kode bank, nomor virtual account, dan nominal pembayaran.</li>
        <li>Jika sudah sesuai, pilih <strong>Benar</strong>.</li>
        <li>Selesai.</li>
      </ol>

      <ol v-if="type === 'apk'" class="mb-0 ps-3">
        <li>Buka aplikasi <strong>PermataMobile X</strong>.</li>
        <li>Masukkan User ID & Password.</li>
        <li>Pilih menu <strong>Pembayaran Tagihan</strong>.</li>
        <li>Pilih <strong>Virtual Account</strong> (Akun Virtual).</li>
        <li>Masukkan 16 digit Virtual Account: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Akan muncul halaman tujuan pembayaran.</li>
        <li>Masukkan nominal pembayaran sesuai tagihan: <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Muncul konfirmasi pembayaran.</li>
        <li>Masukkan Kode Otentikasi Transaksi (Response Code).</li>
        <li>Transaksi selesai.</li>
      </ol>

      <ol v-if="type === 'atm'" class="mb-0 ps-3">
        <li>Masukkan kartu ATM & PIN.</li>
        <li>Pilih menu <strong>Transaksi Lainnya</strong>.</li>
        <li>Pilih <strong>Pembayaran</strong> > <strong>Pembayaran Lainnya</strong>.</li>
        <li>Pilih <strong>Virtual Account</strong>.</li>
        <li>Masukkan Nomor Virtual Account: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Jumlah yang harus dibayar dan nomor rekening akan muncul pada halaman konfirmasi.</li>
        <li>Jika informasi sudah benar, pilih <strong>Benar</strong>.</li>
        <li>Simpan struk transaksi.</li>
      </ol>

      <ol v-if="type === 'other'" class="mb-0 ps-3">
        <li>Masukkan kartu ATM & PIN.</li>
        <li>Pilih menu <strong>Transfer</strong> > <strong>Transfer ke Bank Lain</strong>.</li>
        <li>Masukkan Kode Bank Permata (013) diikuti 16 digit Nomor VA: <strong class="text-primary">013{{ vaNumber }}</strong> <CopyButton :text="'013' + vaNumber" /></li>
        <li>Pilih <strong>Benar</strong>.</li>
        <li>Masukkan nominal pembayaran: <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Konfirmasi kode bank, nomor virtual account, dan nominal. Jika sudah sesuai, pilih <strong>Benar</strong>.</li>
        <li>Transaksi selesai.</li>
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

const type = ref('m-banking');

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>

<style scoped>
@import url("~/assets/css/components/bank.css");
</style>