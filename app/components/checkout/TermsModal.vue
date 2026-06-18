<template>
  <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-4" style="max-height: 75vh;">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold text-dark txt-subtitle" id="termsModalLabel">
            <i class="bi bi-shield-check text-primary me-2"></i>Syarat & Ketentuan
          </h5>
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body px-4 py-4 text-muted txt-body">
          <p class="mb-4 text-dark fw-medium">Dengan melakukan pembayaran, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan berikut:</p>

          <h6 class="fw-bold text-dark mt-4 mb-3">A. Pendaftaran & Pembayaran</h6>
          <ul class="mb-4">
            <li class="mb-2">Tiket yang sudah dibeli/didaftarkan <strong>tidak dapat dibatalkan atau di-refund</strong> (kecuali event dibatalkan dari pihak panitia).</li>
            <li class="mb-2">Tiket tidak dapat dipindahtangankan. Nama peserta yang terdaftar harus sesuai dengan identitas (KTP/Kartu Pelajar) saat proses registrasi ulang di lokasi. Jika berbeda, tiket dianggap hangus.</li>
            <li class="mb-2">Batas waktu transfer pembayaran adalah <strong>30 Menit</strong> sejak transaksi dibuat. Jika melewati batas waktu tersebut, maka tagihan dan kuota tiket akan otomatis hangus.</li>
          </ul>

          <h6 class="fw-bold text-dark mt-4 mb-3">B. Adab & Tata Tertib</h6>
          <ul class="mb-4">
            <li class="mb-2">Peserta diwajibkan untuk <strong>menjaga adab berpakaian</strong>: menutup aurat dengan sempurna, syar'i, sopan, dan tidak menggunakan pakaian ketat.</li>
            <li class="mb-2"><strong>Ketentuan Membaur:</strong> Terdapat pemisahan tegas antara jamaah Ikhwan dan Akhwat. Dilarang keras bercampur baur (ikhtilat) atau berinteraksi di luar batasan syariat selama berada di seluruh area event.</li>
            <li class="mb-2"><strong>Ketentuan Anak-anak:</strong> Demi menjaga kekhusyukan acara, peserta tidak diperkenankan membawa anak balita/anak kecil masuk ke dalam ruang utama acara.</li>
            <li class="mb-2">Peserta dilarang keras untuk <strong>merekam video/audio</strong> (jika Ustadz pemateri tidak berkenan) dan wajib mengkondisikan penggunaan *gadget* (mode hening/silent).</li>
          </ul>

          <h6 class="fw-bold text-dark mt-4 mb-3">C. Check-in & Kehadiran</h6>
          <ul class="mb-4">
            <li class="mb-2">Peserta wajib membawa dan menunjukkan <strong>QR Code Tiket</strong> (dari email atau riwayat pesanan) saat melakukan registrasi ulang (check-in) di lokasi.</li>
            <li class="mb-2">Peserta dianjurkan untuk hadir minimal <strong>30 menit sebelum acara dimulai</strong> untuk menghindari antrean panjang saat check-in.</li>
          </ul>

          <h6 class="fw-bold text-dark mt-4 mb-3">D. Force Majeure (Keadaan Memaksa)</h6>
          <ul class="mb-0">
            <li class="mb-2">Panitia berhak membatalkan, menunda, atau mengubah jadwal event secara sepihak apabila Ustadz pemateri berhalangan hadir atau terjadi hal-hal di luar kuasa panitia (bencana alam, musibah, perizinan, dll).</li>
            <li class="mb-2">Jika terjadi pembatalan sepihak oleh panitia, seluruh uang pendaftaran akan dikembalikan (refund) 100% kepada peserta.</li>
          </ul>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm txt-body" data-bs-dismiss="modal">Saya Mengerti</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Komponen pasif yang hanya merender UI untuk Modal Syarat & Ketentuan
</script>
