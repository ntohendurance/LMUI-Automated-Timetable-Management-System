import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, GraduationCap, BookUser, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { INSTITUTION } from '../../data/mockData.js'
import Button from '../../components/ui/Button.jsx'
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal.jsx'

const ROLES = [
  { key: 'admin', label: 'Admin', icon: Shield },
  { key: 'lecturer', label: 'Lecturer', icon: BookUser },
  { key: 'student', label: 'Student', icon: GraduationCap },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const user = await login({ role, email, password })
      if (user) navigate(`/${user.role}`, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 bg-grid-lines bg-grid px-4 py-10">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-navy-700/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="relative grid w-full max-w-5xl animate-fade-up overflow-hidden rounded-2xl border border-navy-800 bg-navy-900/60 shadow-2xl backdrop-blur lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-navy-950/70 p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400 font-display text-2xl text-navy-900">
              L
            </div>
            <div>
              <p className="font-display text-2xl text-white">{INSTITUTION.shortName}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400">E-Timetable</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-4xl leading-tight text-white text-balance">
              Automated Timetable Management System
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
              Automated semester scheduling for {INSTITUTION.name}, {INSTITUTION.location}.
              Generate, manage and publish conflict-free timetables with confidence.
            </p>
          </div>

          <div className="border-t border-navy-800 pt-6">
            <p className="font-display text-lg text-gold-300">"{INSTITUTION.tagline}"</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-white p-8 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 font-display text-xl text-gold-400">
                L
              </div>
              <div>
                <p className="font-display text-xl text-navy-900">{INSTITUTION.shortName}</p>
                <p className="text-[10px] uppercase tracking-widest text-gold-600">{INSTITUTION.tagline}</p>
              </div>
            </div>
          </div>

          <h1 className="font-display text-2xl text-navy-900">Welcome back</h1>
          <p className="mt-1 text-sm text-navy-500">Sign in to access your portal.</p>

          {/* Role tabs */}
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-navy-50 p-1">
            {ROLES.map((r) => {
              const Icon = r.icon
              const active = role === r.key
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-navy-900 text-gold-300 shadow'
                      : 'text-navy-500 hover:bg-white'
                  }`}
                >
                  <Icon size={18} />
                  {r.label}
                </button>
              )
            })}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-500">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${role}@lmui.edu.cm`}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    errors.email ? 'border-red-400' : 'border-navy-200'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-medium text-gold-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    errors.password ? 'border-red-400' : 'border-navy-200'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {formError}
              </div>
            )}

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : `Sign In as ${ROLES.find((r) => r.key === role).label}`}
              {!submitting && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-gold-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  )
}
