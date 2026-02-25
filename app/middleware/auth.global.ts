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

  // 2. Proteksi rute ADMIN
  if (to.path.startsWith('/admin')) {
    // Jika mencoba akses /admin/login saat sudah login admin, arahkan ke dashboard admin
    if (to.path === '/admin/login' && isAdmin.value) {
      return navigateTo('/admin');
    }
    if (to.path !== '/admin/login' && !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }

  const userOnlyPaths = ['/dashboard', '/profile', '/history'];
  if (userOnlyPaths.some(path => to.path.startsWith(path))) {
    if (!accessToken.value) {
      return navigateTo('/auth');
    }
  }
});