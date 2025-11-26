<template>
  <div class="p-2">
    
    <ul class="nav nav-pills justify-content-center mb-4 gap-2" id="bri-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link btn-sm" 
          :class="{ active: type === 'm-banking' }" 
          @click="type = 'm-banking'"
        >BRImo (Mobile)</button>
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
        <li>Buka aplikasi <strong>BRImo (BRI Mobile)</strong>.</li>
        <li>Login dengan Username dan Password Anda.</li>
        <li>Pilih menu <strong>Pembayaran</strong> > <strong>BRIVA</strong>.</li>
        <li>Masukkan Nomor BRIVA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Klik <strong>Kirim</strong>.</li>
        <li>Periksa detail pembayaran (Pastikan nominal <strong>{{ formatCurrency(amount) }}</strong>).</li>
        <li>Masukkan <strong>PIN BRImo</strong> Anda.</li>
        <li>Transaksi berhasil.</li>
      </ol>

      <ol v-if="type === 'atm'" class="mb-0 ps-3">
        <li>Masukkan kartu ATM BRI & PIN.</li>
        <li>Pilih menu <strong>Transaksi Lain</strong> > <strong>Pembayaran</strong>.</li>
        <li>Pilih menu <strong>Lainnya</strong> > <strong>BRIVA</strong>.</li>
        <li>Masukkan Nomor BRIVA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Pilih <strong>Benar</strong>.</li>
        <li>Konfirmasi pembayaran, pilih <strong>Ya</strong>.</li>
        <li>Simpan struk transaksi.</li>
      </ol>

      <ol v-if="type === 'i-banking'" class="mb-0 ps-3">
        <li>Login ke <strong>Internet Banking BRI</strong>.</li>
        <li>Pilih menu <strong>Pembayaran & Pembelian</strong>.</li>
        <li>Pilih sub-menu <strong>BRIVA</strong>.</li>
        <li>Masukkan Nomor BRIVA: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Klik <strong>Kirim</strong>.</li>
        <li>Periksa data transaksi dan masukkan password / mToken.</li>
        <li>Transaksi berhasil.</li>
      </ol>

      <ol v-if="type === 'teller'" class="mb-0 ps-3">
        <li>Ambil nomor antrian Teller di Kantor Cabang BRI.</li>
        <li>Isi Slip Setoran Tunai.</li>
        <li>Masukkan Nomor BRIVA: <strong class="text-primary">{{ vaNumber }}</strong> dan nominal <strong>{{ formatCurrency(amount) }}</strong>.</li>
        <li>Serahkan slip dan uang tunai kepada Teller.</li>
        <li>Simpan salinan slip setoran sebagai bukti.</li>
      </ol>

      <ol v-if="type === 'other'" class="mb-0 ps-3">
        <li>Gunakan menu <strong>Transfer Antar Bank</strong> di ATM/Mobile Bank lain.</li>
        <li>Pilih Bank Tujuan: <strong>BRI (002)</strong>.</li>
        <li>Masukkan Nomor Rekening Tujuan: <strong class="text-primary">{{ vaNumber }}</strong> <CopyButton :text="vaNumber" /></li>
        <li>Masukkan nominal bayar: <strong>{{ formatCurrency(amount) }}</strong> (Harus persis).</li>
        <li>Konfirmasi rincian transfer (Pastikan nama penerima sesuai).</li>
        <li>Selesaikan transaksi.</li>
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