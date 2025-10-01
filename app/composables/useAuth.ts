import { useLoading } from '~/composables/useLoading'
import Swal from "sweetalert2";

export const useAuth = () => {
    const loading = useLoading() // panggil state global
    const accessToken = useCookie("AccessToken", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  const user = useState("auth_user", () => null)
  const router = useRouter()
  const { $apiBase } = useNuxtApp()

  const login = async (data: any) => {
    loading.value = true            // nyalain spinner global
    try {
      const res = await $apiBase.post("signin-account", data);

      // simpan token di localStorage (supaya interceptor axios kebaca)
      accessToken.value = res.data.AccessToken;
      localStorage.setItem("IdToken", res.data.IdToken)
      localStorage.setItem("RefreshToken", res.data.RefreshToken)

      // kalau mau cookie juga:
      await getUser()
      router.push("/")
    } catch (error: any) {
      Swal.fire({
        text: error.response?.data?.error || error.message || "Login gagal",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      })
    } finally {
      loading.value = false          // matiin spinner global
    }
  }

  const logout = async () => {
    try {
      await $apiBase.post("signout-account", {
        AccessToken: localStorage.getItem("IdToken"),
      })
    } catch {}
    finally {
      localStorage.removeItem("IdToken")
      localStorage.removeItem("RefreshToken")
      useCookie("AccessToken").value = null
      user.value = null
      router.push("/login")
    }
  }

  const getUser = async () => {
    try {
      const res = await $apiBase.get("get-account")
      user.value = res.data
    } catch (error) {
      user.value = null
      throw error
    }
  }
  const isLoggedIn = computed(() => !!user.value)

  return {
    user,
    login,
    logout,
    getUser,
    isLoggedIn,
}
}
