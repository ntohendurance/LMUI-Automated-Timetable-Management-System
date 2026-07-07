import { createContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/endpoints.js'
import { tokenStore } from '../api/client.js'

const AuthContext = createContext(null)

const USER_KEY = 'lmui_auth_user'

// Normalize the backend user (role UPPERCASE) into the lowercase role the
// router/UI expects, and surface lecturer/student profile ids when present.
function normalizeUser(raw) {
  if (!raw) return null
  const role = String(raw.role || '').toLowerCase()
  const profile = raw.lecturer || raw.student || {}
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role,
    // Profile linkage used by lecturer/student scoped views.
    profileId: profile.id || null,
    department: profile.department?.name || raw.department || '',
    departmentId: profile.departmentId || null,
    level: profile.level || null,
    matricule: profile.matricule || null,
    staffId: profile.staffId || null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [bootstrapping, setBootstrapping] = useState(!!tokenStore.get())

  // On mount with a token, refresh the profile from the server.
  useEffect(() => {
    let active = true
    if (!tokenStore.get()) {
      setBootstrapping(false)
      return undefined
    }
    authApi
      .me()
      .then((me) => {
        if (!active) return
        const normalized = normalizeUser(me)
        setUser(normalized)
        localStorage.setItem(USER_KEY, JSON.stringify(normalized))
      })
      .catch((err) => {
        // Only force logout when the token is genuinely rejected (401).
        // Transient failures (network, rate-limit) keep the cached session.
        if (err?.status === 401) {
          tokenStore.clear()
          localStorage.removeItem(USER_KEY)
          if (active) setUser(null)
        }
      })
      .finally(() => active && setBootstrapping(false))
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async ({ email, password, role }) => {
    const { user: rawUser } = await authApi.login({ email, password, role })
    let full = rawUser
    try {
      full = await authApi.me()
    } catch {
      /* fall back to the basic login user */
    }
    const normalized = normalizeUser(full)
    setUser(normalized)
    localStorage.setItem(USER_KEY, JSON.stringify(normalized))
    return normalized
  }, [])

  const signup = useCallback(async (payload) => {
    const result = await authApi.signup(payload)
    // Lecturers are created in a pending state — no token, not logged in.
    if (result?.pending) {
      return { pending: true, user: result.user }
    }
    let full = result.user
    try {
      full = await authApi.me()
    } catch {
      /* fall back to the basic signup user */
    }
    const normalized = normalizeUser(full)
    setUser(normalized)
    localStorage.setItem(USER_KEY, JSON.stringify(normalized))
    return normalized
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, bootstrapping }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
