<template>
  <div class="p-2">
    
    <ul class="nav nav-pills justify-content-center mb-4 gap-2" id="danamon-tab" role="tablist">
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'm-banking' }" 
          @click="type = 'm-banking'"
        >D-Mobile</button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'atm' }" 
          @click="type = 'atm'"
        >ATM Danamon</button>
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
        <li>Akses aplikasi <strong>D-Mobile</strong> di smartphone Anda.</li>
        <li>Masukkan User ID dan Password.</li>
        <li>Pilih menu <strong>Pembayaran</strong> > <strong>Virtual Account</strong>.</li>
        <li>Tambahkan biller baru pembayaran.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Pastikan data pembayaran sudah benar (Nominal: <strong>{{ formatCurrency(amount) }}</strong>).</li>
        <li>Masukkan mPIN Anda untuk konfirmasi.</li>
        <li>Transaksi selesai, simpan bukti transaksi.</li>
      </ol>

      <ol v-if="type === 'atm'" class="mb-0 ps-3">
        <li>Masukkan kartu ATM Danamon & PIN.</li>
        <li>Pilih menu <strong>Pembayaran</strong> > <strong>Lainnya</strong> > <strong>Virtual Account</strong>.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Pastikan data pembayaran sudah benar (Nominal: <strong>{{ formatCurrency(amount) }}</strong>).</li>
        <li>Pilih <strong>YA</strong> untuk bayar.</li>
        <li>Transaksi selesai, simpan struk transaksi.</li>
      </ol>

      <ol v-if="type === 'other'" class="mb-0 ps-3">
        <li>Masuk ke menu <strong>Transfer</strong> > <strong>Transfer ke Bank Lain</strong>.</li>
        <li>Masukkan Kode Bank Danamon: <strong>011</strong>.</li>
        <li>Masukkan Nomor Rekening Tujuan (Nomor VA): <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan jumlah pembayaran: <strong>{{ formatCurrency(amount) }}</strong> (Harus sesuai tagihan).</li>
        <li>Pastikan data pembayaran sudah benar.</li>
        <li>Pilih <strong>YA</strong> untuk melanjutkan transaksi.</li>
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