export default defineNuxtRouteMiddleware(async (to) => {
  // halaman publik
  const publicPages = ["/", "/login", "/register", "/admin/login"]

  // Kalau route bukan public page, wajib login
  if (!publicPages.includes(to.path)) {
    const token = process.client ? localStorage.getItem("IdToken") : null
    const user = useState<any>("auth_user")
    const { getUser, logout } = useAuth()

    if (!token) {
      return navigateTo("/login")
    }

    if (token && !user.value) {
      try {
        await getUser()
      } catch {
        await logout()
        return navigateTo("/login")
      }
    }
  }
})
