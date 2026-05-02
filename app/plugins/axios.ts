import axios from 'axios'
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const router = useRouter()
    
    const createApi = (baseURL: string) => {
        const instance = axios.create({
            baseURL,
        })
        instance.interceptors.request.use((req) => {
            const token = localStorage.getItem('IdToken') 
            if (token) {
                req.headers.Authorization = `Bearer ${token}` 
            }
            return req
        })

        // ===== INTERCEPTOR RESPONSE DENGAN LOGIKA REFRESH TOKEN =====
        instance.interceptors.response.use(
            res => res,
            async (error) => {
                const originalRequest = error.config
                const errorMessage = error.response?.data?.message || '' // Nangkep pesan error dari BE
                
                //  1. HANDLE TOKEN REVOKED
                // Jika error 400 dengan pesan token dicabut, langsung paksa logout
                if (error.response?.status === 400 && errorMessage === "Access Token has been revoked") {
                    const { logout } = useAuth()
                    await logout()
                    return Promise.reject(error)
                }

                // 2. LOGIKA REFRESH TOKEN
                // Cek jika error adalah 401 (Unauthorized)
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true 
                    
                    const refreshToken = localStorage.getItem('RefreshToken') 
                    
                    if (refreshToken) {
                        try {
                            const { data } = await axios.post(`${config.public.apiBase}/refresh-token`, { 
                                RefreshToken: refreshToken 
                            })

                            localStorage.setItem('IdToken', data.IdToken)
                            localStorage.setItem('AccessToken', data.AccessToken)
                            
                            originalRequest.headers.Authorization = `Bearer ${data.IdToken}`
                            return instance(originalRequest)

                        } catch (refreshError) {
                            const { logout } = useAuth()
                            await logout()
                            return Promise.reject(refreshError)
                        }
                    } else {
                        const { logout } = useAuth()
                        await logout()
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