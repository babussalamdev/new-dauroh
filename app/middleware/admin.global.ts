import { useAdminAuth } from "~/composables/useAdminAuth"

export default defineNuxtRouteMiddleware(async (to) => {
  // hanya guard route /admin
  if (!to.path.startsWith("/admin")) return

  const token = process.client ? localStorage.getItem("AdminToken") : null
  const admin = useState<any>("admin_user")
  const { getAdmin, logout } = useAdminAuth()

  // kalau bukan halaman login dan belum token
  if (to.path !== "/admin/login" && !token) {
    return navigateTo("/admin/login")
  }

  // kalau ada token tapi belum ada state admin
  if (token && !admin.value) {
    try {
      await getAdmin()
    } catch {
      await logout()
      return navigateTo("/admin/login")
    }
  }
})
