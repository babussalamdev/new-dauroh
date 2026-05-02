import Swal from 'sweetalert2';

export const useAlert = () => {
  const alert = (title: string, text: string, icon: any = 'success') => {
    return Swal.fire({
      title,
      text,
      icon,
      // 🟢 1. Atur lebar (defaultnya biasanya 32rem / 512px)
      width: '24rem', 
      // 🟢 2. Kecilin padding biar gak terlalu bulky
      padding: '1.25rem',
      showConfirmButton: false,
      timer: 2000,
      // 🟢 3. Kecilin font title & content lewat customClass
      customClass: {
        popup: 'rounded-4 shadow-sm border-0',
        title: 'fs-5 fw-bold mb-1', // Pake class Bootstrap biar simpel
        htmlContainer: 'txt-caption text-muted mt-0',
        confirmButton: 'btn btn-primary rounded-pill px-4 txt-caption',
        cancelButton: 'btn btn-light border rounded-pill px-4 txt-caption'
      },
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      }
    });
  };

  const confirm = (title: string, text: string, confirmButtonText: string = 'Ya, Lanjutkan') => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      width: '26rem', // Khusus konfirmasi boleh agak lebar sedikit biar teksnya gak numpuk
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#004754', // Warna brand Yayasan lu
      cancelButtonColor: '#f8f9fa',
      // Pastiin class tombolnya juga dikecilin sizenya
      customClass: {
        popup: 'rounded-4 shadow-lg border-0',
        title: 'fs-5 fw-bold',
        htmlContainer: 'txt-body text-muted',
        confirmButton: 'btn btn-primary rounded-pill px-4 txt-caption py-2 ms-2',
        cancelButton: 'btn btn-light border rounded-pill px-4 txt-caption py-2'
      },
      buttonsStyling: false // Matikan style bawaan swal biar class Bootstrap kita dominan
    });
  };

  return { alert, confirm };
};