export default defineNuxtRouteMiddleware(async (to) => {
  const accessToken = useCookie("AccessToken");
  const user = useState<any>("auth_user");
  const { getUser, logout } = useAuth();
  const uuid = localStorage.getItem("uuid");

  if (!uuid) {
    const id = crypto.randomUUID();
    localStorage.setItem("uuid", id);
  }

  const publicPages = ["/login"];

  if (publicPages.includes(to.path)) return;

  if (!accessToken.value) {
    return navigateTo("/login");
  }

  if (accessToken.value && !user.value) {
    try {
      await getUser();
    } catch (error) {
      await logout();
      return navigateTo("/login");
    }
  }
});