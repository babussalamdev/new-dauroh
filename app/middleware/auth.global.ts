export default defineNuxtRouteMiddleware(async (to) => {
  const { accessToken, user, isAdmin, getUser } = useAuth();
  if (accessToken.value && !user.value) {
    try {
      await getUser();
    } catch (error) {
      accessToken.value = null;
    }
  }
  if (to.path.startsWith('/admin')) {
    // Jika mencoba akses /admin/login saat sudah login admin, arahkan ke dashboard admin
    if (to.path === '/admin/login' && isAdmin.value) {
      return navigateTo('/admin');
    }
    
    if (to.path !== '/admin/login' && !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }

  // 3. Proteksi rute User Biasa (Client)
  const userOnlyPaths = ['/dashboard', '/profile', '/history'];
  if (userOnlyPaths.some(path => to.path.startsWith(path))) {
    if (!accessToken.value) {
      return navigateTo('/auth');
    }
  }
});