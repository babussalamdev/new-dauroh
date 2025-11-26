<template>
  <div class="p-2">
    
    <ul class="nav nav-pills justify-content-center mb-4 gap-2" id="bni-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'm-banking' }" 
          @click="type = 'm-banking'"
        >Mobile Banking</button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'atm' }" 
          @click="type = 'atm'"
        >ATM</button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'i-banking' }" 
          @click="type = 'i-banking'"
        >Internet Banking</button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'teller' }" 
          @click="type = 'teller'"
        >Teller</button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'other' }" 
          @click="type = 'other'"
        >Bank Lain</button>
      </li>
    </ul>

    <div class="instruction-content border rounded p-3 bg-light">
      
      <ol v-if="type === 'm-banking'" class="mb-0 ps-3">
        <li>Buka aplikasi <strong>BNI Mobile Banking</strong>.</li>
        <li>Login ke akun Anda.</li>
        <li>Pilih menu <strong>Transfer</strong>.</li>
        <li>Pilih <strong>Virtual Account Billing</strong>.</li>
        <li>Pilih rekening debit Anda.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <BankCopyButton :text="vaNumber" /></li>
        <li>Konfirmasi tagihan yang muncul (Pastikan nominal <strong>{{ formatCurrency(amount) }}</strong>).</li>
        <li>Masukkan PIN Transaksi.</li>
        <li>Transaksi berhasil.</li>
      </ol>

      <ol v-if="type === 'atm'" class="mb-0 ps-3">
        <li>Masukkan kartu ATM BNI & PIN.</li>
        <li>Pilih menu <strong>Menu Lain</strong> > <strong>Transfer</strong>.</li>
        <li>Pilih <strong>Virtual Account Billing</strong>.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <BankCopyButton :text="vaNumber" /></li>
        <li>Konfirmasi data tagihan.</li>
        <li>Pilih <strong>Ya</strong> untuk bayar.</li>
        <li>Simpan struk bukti pembayaran.</li>
      </ol>

      <ol v-if="type === 'i-banking'" class="mb-0 ps-3">
        <li>Login ke <strong>BNI Internet Banking</strong>.</li>
        <li>Pilih menu <strong>Transfer</strong> > <strong>Virtual Account Billing</strong>.</li>
        <li>Masukkan Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> <BankCopyButton :text="vaNumber" /></li>
        <li>Pilih rekening debit yang akan digunakan.</li>
        <li>Konfirmasi data tagihan.</li>
        <li>Masukkan Kode Otentikasi Token BNI.</li>
        <li>Transaksi berhasil.</li>
      </ol>

      <ol v-if="type === 'teller'" class="mb-0 ps-3">
        <li>Kunjungi Kantor Cabang BNI terdekat.</li>
        <li>Ambil nomor antrian Teller.</li>
        <li>Isi formulir Setoran Tunai / Pemindahan Dana.</li>
        <li>Tulis Nomor VA: <strong class="text-primary">{{ vaNumber }}</strong> dan nominal <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Serahkan ke Teller.</li>
        <li>Simpan bukti setoran.</li>
      </ol>

      <ol v-if="type === 'other'" class="mb-0 ps-3">
        <li>Gunakan menu <strong>Transfer Antar Bank</strong> (Online/BI-Fast).</li>
        <li>Pilih Bank Tujuan: <strong>BNI (009)</strong>.</li>
        <li>Masukkan Nomor Rekening Tujuan: <strong class="text-primary">{{ vaNumber }}</strong> <BankCopyButton :text="vaNumber" /></li>
        <li>Masukkan nominal bayar: <strong>{{ formatCurrency(amount) }}</strong> (Harus persis).</li>
        <li>Konfirmasi rincian transfer.</li>
        <li>Selesaikan transaksi.</li>
      </ol>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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