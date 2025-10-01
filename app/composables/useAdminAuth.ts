// composables/useAdminAuth.ts
import Swal from "sweetalert2"

export const useAdminAuth = () => {
  const admin = useState("admin_user", () => null)
  const router = useRouter()
  const { $apiBase } = useNuxtApp()

  const login = async (data: any) => {
    try {
      // endpoint khusus admin
      const res = await $apiBase.post("admin/signin-account", data)

      // simpan token admin di localStorage
      localStorage.setItem("AdminToken", res.data.IdToken)
      localStorage.setItem("AdminRefreshToken", res.data.RefreshToken)

      await getAdmin() // load data admin

      router.push("/admin") // arahkan ke halaman admin
    } catch (error: any) {
      Swal.fire({
        text: error.response?.data?.error || error.message || "Login admin gagal",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      })
    }
  }

  const logout = async () => {
    try {
      await $apiBase.post("admin/signout-account", {
        AccessToken: localStorage.getItem("AdminToken")
      })
    } catch {}
    finally {
      localStorage.removeItem("AdminToken")
      localStorage.removeItem("AdminRefreshToken")
      admin.value = null
      router.push("/admin/login")
    }
  }

  const getAdmin = async () => {
    try {
      const res = await $apiBase.get("admin/get-account")
      admin.value = res.data
    } catch (error) {
      admin.value = null
      throw error
    }
  }

  return { admin, login, logout, getAdmin }
}
