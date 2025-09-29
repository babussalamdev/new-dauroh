export default defineNuxtRouteMiddleware(async (to) => {
  const accessToken = useCookie("AccessToken");
  const user = useState<any>("auth_user");
  const { getUser, logout } = useAuth();

  // ✅ Hanya jalan di client
  if (process.client) {
    const uuid = localStorage.getItem("uuid");
    if (!uuid) {
      const id = crypto.randomUUID();
      localStorage.setItem("uuid", id);
    }
  }

  const publicPages = ["/login", "/register"];
  if (publicPages.includes(to.path)) return;

  if (!accessToken.value) {
    return await navigateTo("/login");
  }

  if (accessToken.value && !user.value) {
    try {
      await getUser();
    } catch (error) {
      await logout();
      return await navigateTo("/login");
    }
  }
});
