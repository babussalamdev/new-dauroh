import axios from 'axios'
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#app'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const router = useRouter()
    
    const createApi = (baseURL: string) => {
        const instance = axios.create({
            baseURL,
        })
        
        instance.interceptors.request.use((req) => {
            const token = localStorage.getItem('IdToken') // Mengambil token
            if (token) {
                // Baris ini yang secara otomatis menambahkan token ke header
                req.headers.Authorization = `Bearer ${token}` 
            }
            return req
        
        })

        instance.interceptors.response.use(
            res => res,
            async (error) => {
                const originalRequest = error.config
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true
                    const refreshToken = localStorage.get('RefreshToken')
                    if (refreshToken) {
                        console.log('error')
                      } else {
                        router.push('/signin')
                      }
                    }
                    return Promise.reject(error)
                  }
                )
                return instance
              }
              const apiBase = createApi(config.public.apiBase)
              return {
                provide: {
                  apiBase
                }
              }
            })