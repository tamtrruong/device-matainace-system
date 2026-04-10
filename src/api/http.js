import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return Promise.reject(error)
      originalRequest._retry = true
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          params: { refreshToken }
        })
        const authData = refreshResponse?.data?.data
        if (authData?.accessToken) {
          localStorage.setItem('access_token', authData.accessToken)
          if (authData.refreshToken) localStorage.setItem('refresh_token', authData.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`
          return http(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const unwrap = (response) => response?.data?.data
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Có lỗi xảy ra.'
