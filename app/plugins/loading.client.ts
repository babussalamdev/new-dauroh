import { useRouter } from 'vue-router'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const isLoading = useLoading()

  router.beforeEach((to, from, next) => {
    isLoading.value = true
    next()
  })

  router.afterEach(() => {
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  })
})
