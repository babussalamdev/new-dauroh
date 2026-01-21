export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, isAdmin, getUser, logout } = useAuth();

  // 1. Selalu coba pulihkan sesi jika state user kosong dan ada token
  if (!isLoggedIn.value && process.client) {
    const token = localStorage.getItem("IdToken");
    if (token) {
      try {
        await getUser(); 
      } catch {
        await logout();
        return; 
      }
    }
  }
  // 2. Tentukan halaman publik
  const publicPages = ["/", "/login", "/register", "/admin/login", "/verify"];
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/dauroh/');

  // 3. Lindungi halaman yang tidak publik
  if (!isPublicPage) {
    if (!isLoggedIn.value) {
      return navigateTo("/login");
    }
  }

  // 4. Lindungi halaman admin secara spesifik
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!isAdmin.value) {
      return navigateTo('/dashboard'); 
    }
  }
});