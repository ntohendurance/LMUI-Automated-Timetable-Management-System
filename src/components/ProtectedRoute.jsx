import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function ProtectedRoute({ role, children }) {
  const { user, isAuthenticated, bootstrapping } = useAuth()
  const location = useLocation()

  // While we re-validate a stored token against /auth/me, show a loader so we
  // don't bounce the user to /login on a hard refresh.
  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900">
        <div className="flex flex-col items-center gap-3 text-navy-200">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-navy-700 border-t-gold-400" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />
  }
  return children
}
