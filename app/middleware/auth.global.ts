export default defineNuxtRouteMiddleware(async (to) => {
  const { accessToken, user, isAdmin, getUser } = useAuth();
  
  // 1. Jika ada token tapi data user kosong (misal abis refresh), ambil data user dulu
  if (accessToken.value && !user.value) {
    try {
      await getUser();
    } catch (error) {
      accessToken.value = null; // Token error/expired, hapus saja
    }
  }

  // 2. Proteksi rute ADMIN (Lapis Pertama - Login Check)
  if (to.path.startsWith('/admin')) {
    // Jika mencoba akses /admin/login saat sudah login admin, arahkan ke dashboard admin
    if (to.path === '/admin/login' && isAdmin.value) {
      return navigateTo('/admin');
    }
    // Jika mencoba masuk ke dalam /admin tanpa login, tendang ke login
    if (to.path !== '/admin/login' && !isAdmin.value) {
      return navigateTo('/admin/login');
    }

    // 3. 🟢 PROTEKSI BERDASARKAN ROLE (Lapis Kedua - Satpam URL)
    // Hanya berjalan jika user sudah login sebagai admin dan datanya ada
    if (to.path !== '/admin/login' && isAdmin.value && user.value) {
      
      // Ambil role dari data user (Nanti sesuaikan sama nama field dari API Mulkiz)
      const userRole = user.value.role || ''; // contoh: 'finance', 'registrasi', 'admin', 'root'

      // Aturan untuk role 'finance'
      if (userRole === 'finance') {
        // Cuma boleh buka halaman utama (/admin) dan halaman keuangan (/admin/finance...)
        if (to.path !== '/admin' && !to.path.startsWith('/admin/finance')) {
          console.warn("Satpam: Akses ditolak! Role Finance dilarang masuk ke", to.path);
          return navigateTo('/admin'); // Tendang balik ke Dashboard
        }
      }

      // Aturan untuk role 'registrasi'
      if (userRole === 'registrasi') {
        // Cuma boleh buka halaman utama (/admin) dan halaman presensi (/admin/kehadiran...)
        if (to.path !== '/admin' && !to.path.startsWith('/admin/kehadiran')) {
          console.warn("Satpam: Akses ditolak! Role Registrasi dilarang masuk ke", to.path);
          return navigateTo('/admin'); // Tendang balik ke Dashboard
        }
      }
    }
  }

  // 4. Proteksi rute User Biasa (Client)
  const userOnlyPaths = ['/dashboard', '/profile', '/history'];
  if (userOnlyPaths.some(path => to.path.startsWith(path))) {
    if (!accessToken.value) {
      return navigateTo('/auth');
    }
  }
});