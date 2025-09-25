import Swal from "sweetalert2";

export const useAuth = () => {
  const accessToken = useCookie("AccessToken", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });
  const user = useState("auth_user", () => null);
  const router = useRouter();
  const apiBase = useNuxtApp().$api;

  const login = async (data: any) => {
    try {
      const res = await apiBase.post("signin-account", data);
      accessToken.value = res.data.AccessToken;
      localStorage.setItem("IdToken", res.data.IdToken);
      localStorage.setItem("RefreshToken", res.data.RefreshToken);
      await getUser();
      router.push("/");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        Swal.fire({
          text: error.response.data.error,
          icon: "warning",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        Swal.fire({
          text: error,
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }
  };

  const logout = async () => {
    const token = useCookie("AccessToken");
    const data = {
      AccessToken: token.value,
    };
    try {
      await apiBase.post("signout-account", data);
    } catch (error) {
    } finally {
      token.value = null
      localStorage.removeItem("IdToken");
      localStorage.removeItem("RefreshToken");
      user.value = null;
      router.push("/login");
    }
  };

  const getUser = async () => {
    try {
      const res = await apiBase.get("get-account");
      user.value = res.data;
    } catch (error) {
      user.value = null;
      throw error;
    }
  };

  return {
    user,
    login,
    logout,
    getUser,
  };
};