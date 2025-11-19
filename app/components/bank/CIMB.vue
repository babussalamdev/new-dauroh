<template>
  <div class="p-2">
    
    <ul class="nav nav-pills justify-content-center mb-4 gap-2" id="cimb-tab" role="tablist">
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'octo' }" 
          @click="type = 'octo'"
        >Octo Mobile</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'octoc' }" 
          @click="type = 'octoc'"
        >Octo Clicks</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'atm' }" 
          @click="type = 'atm'"
        >ATM CIMB</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'i-banking' }" 
          @click="type = 'i-banking'"
        >I-Banking Lain</button>
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
      
      <ol v-if="type === 'octo'" class="mb-0 ps-3">
        <li>Login ke aplikasi <strong>Octo Mobile</strong>.</li>
        <li>Pilih menu <strong>Transfer</strong>.</li>
        <li>Pilih menu <strong>Transfer to Other CIMB Niaga Account</strong>.</li>
        <li>Pilih sumber dana (Source of fund).</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan jumlah pembayaran: <strong>{{ formatCurrency(amount) }}</strong> (Sesuai tagihan).</li>
        <li>Klik tombol <strong>Next</strong>.</li>
        <li>Pastikan data (Nomor VA, Nama, Jumlah) sudah benar.</li>
        <li>Klik tombol <strong>Confirm</strong>.</li>
        <li>Masukkan PIN Mobile Banking Anda.</li>
      </ol>

      <ol v-if="type === 'octoc'" class="mb-0 ps-3">
        <li>Login ke <strong>OCTO Clicks</strong> (<a href="https://www.octoclicks.co.id" target="_blank" class="text-decoration-none">www.octoclicks.co.id</a>).</li>
        <li>Pilih menu <strong>Pembayaran Tagihan</strong>.</li>
        <li>Pilih kategori transaksi: <strong>Virtual Account</strong>.</li>
        <li>Pilih rekening sumber dana.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Klik tombol <strong>Lanjutkan</strong> untuk verifikasi detail.</li>
        <li>Pastikan data (Nomor VA, Nama, Total Tagihan) sudah benar.</li>
        <li>Masukkan 6 digit OTP dan tekan tombol <strong>Submit</strong>.</li>
        <li>Klik tombol <strong>Konfirmasi</strong> untuk memproses pembayaran.</li>
      </ol>

      <ol v-if="type === 'atm'" class="mb-0 ps-3">
        <li>Masukkan Kartu ATM dan PIN CIMB Anda.</li>
        <li>Pilih menu <strong>Pembayaran</strong> > <strong>Lanjut</strong> > <strong>Virtual Account</strong>.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Pilih rekening debit.</li>
        <li>Pastikan Nomor VA, Nama, dan Jumlah tagihan yang muncul di layar sudah benar.</li>
        <li>Pilih <strong>OK</strong> untuk melakukan pembayaran.</li>
        <li>Simpan struk konfirmasi pembayaran.</li>
      </ol>

      <ol v-if="type === 'i-banking'" class="mb-0 ps-3">
        <li>Login ke internet banking bank Anda.</li>
        <li>Pilih menu <strong>Transfer ke Bank Lain Online</strong>.</li>
        <li>Pilih bank tujuan: <strong>Bank CIMB Niaga (022)</strong>.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan jumlah pembayaran: <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Ikuti instruksi selanjutnya untuk menyelesaikan transaksi.</li>
      </ol>

      <ol v-if="type === 'other'" class="mb-0 ps-3">
        <li>Masukkan Kartu ATM dan PIN di mesin ATM (Alto/Bersama/Prima).</li>
        <li>Pilih menu <strong>TRANSFER</strong> > <strong>TRANSFER KE BANK LAIN</strong>.</li>
        <li>Masukkan Kode Bank CIMB Niaga: <strong>022</strong>.</li>
        <li>Masukkan jumlah pembayaran: <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Ikuti instruksi selanjutnya untuk menyelesaikan transaksi.</li>
        <li>Simpan struk konfirmasi pembayaran.</li>
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

const type = ref('octo');

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