import axios from 'axios'

// Base URL of the Express backend. Override with VITE_API_URL if needed.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TOKEN_KEY = 'lmui_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize errors and auto-logout on 401.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const data = err.response?.data
    if (status === 401 && tokenStore.get()) {
      // Token invalid/expired — clear and bounce to login.
      tokenStore.clear()
      localStorage.removeItem('lmui_auth_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    const normalized = new Error(data?.message || err.message || 'Request failed')
    normalized.status = status
    normalized.errors = data?.errors || null
    return Promise.reject(normalized)
  }
)

export default api
