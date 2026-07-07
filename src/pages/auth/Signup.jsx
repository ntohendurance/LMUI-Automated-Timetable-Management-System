import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap, BookUser, Mail, Lock, User, Hash, IdCard, Building2, ArrowRight, Clock3,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { authApi } from '../../api/endpoints.js'
import { INSTITUTION } from '../../data/mockData.js'
import { LABEL_TO_LEVEL } from '../../api/adapters.js'
import Button from '../../components/ui/Button.jsx'
import { FormField, Input, Select } from '../../components/ui/Field.jsx'

const ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap },
  { key: 'lecturer', label: 'Lecturer', icon: BookUser },
]
const LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    departmentId: '',
    matricule: '',
    level: 'Year 1',
    staffId: '',
  })
  const [departments, setDepartments] = useState([])
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pending, setPending] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Departments are needed before the user has an account, so use the public endpoint.
  useEffect(() => {
    authApi
      .publicDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    if (!form.departmentId) e.departmentId = 'Select your department'
    if (role === 'student' && !form.matricule.trim()) e.matricule = 'Matricule is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setFormError('')
    if (!validate()) return

    const payload = {
      role,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      departmentId: form.departmentId,
    }
    if (role === 'student') {
      payload.matricule = form.matricule.trim()
      payload.level = LABEL_TO_LEVEL[form.level] || form.level
    } else {
      if (form.staffId.trim()) payload.staffId = form.staffId.trim()
    }

    setSubmitting(true)
    try {
      const result = await signup(payload)
      // Lecturers land in a pending state — show the awaiting-approval screen.
      if (result?.pending) {
        setPending(true)
        return
      }
      if (result) navigate(`/${result.role}`, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Could not create your account. Please try again.')
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
              Create your account
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
              Join the {INSTITUTION.name} E-Timetable portal. Register as a student or lecturer to
              view your personalised weekly schedule and course information.
            </p>
          </div>

          <div className="border-t border-navy-800 pt-6">
            <p className="font-display text-lg text-gold-300">"{INSTITUTION.tagline}"</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-white p-8 sm:p-10">
          <div className="mb-6 lg:hidden">
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

          {pending ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center animate-fade-up">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                <Clock3 size={30} />
              </span>
              <h1 className="font-display text-2xl text-navy-900">Account awaiting approval</h1>
              <p className="max-w-sm text-sm text-navy-500">
                Thanks for registering, <span className="font-semibold text-navy-700">{form.name}</span>.
                Lecturer accounts must be approved by an administrator before you can sign in. You'll
                be able to log in once your account is approved.
              </p>
              <Button variant="gold" onClick={() => navigate('/login')}>
                Back to Sign In <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
          <>
          <h1 className="font-display text-2xl text-navy-900">Sign up</h1>
          <p className="mt-1 text-sm text-navy-500">Create an account to access your portal.</p>

          {/* Role tabs */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-navy-50 p-1">
            {ROLES.map((r) => {
              const Icon = r.icon
              const active = role === r.key
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition ${
                    active ? 'bg-navy-900 text-gold-300 shadow' : 'text-navy-500 hover:bg-white'
                  }`}
                >
                  <Icon size={16} />
                  {r.label}
                </button>
              )
            })}
          </div>

          <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" required error={errors.name} className="sm:col-span-2">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <Input
                  className="pl-9"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Achiri Marvellous"
                  error={errors.name}
                />
              </div>
            </FormField>

            <FormField label="Email Address" required error={errors.email} className="sm:col-span-2">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <Input
                  className="pl-9"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder={`${role}@lmui.edu.cm`}
                  error={errors.email}
                />
              </div>
            </FormField>

            <FormField label="Department" required error={errors.departmentId} className="sm:col-span-2">
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-navy-400" />
                <Select
                  className="pl-9"
                  value={form.departmentId}
                  onChange={(e) => set('departmentId', e.target.value)}
                  error={errors.departmentId}
                >
                  <option value="">Select department…</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
            </FormField>

            {role === 'student' ? (
              <>
                <FormField label="Matricule" required error={errors.matricule}>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <Input
                      className="pl-9"
                      value={form.matricule}
                      onChange={(e) => set('matricule', e.target.value)}
                      placeholder="LMUI/CGD/22/001"
                      error={errors.matricule}
                    />
                  </div>
                </FormField>
                <FormField label="Level" required>
                  <Select value={form.level} onChange={(e) => set('level', e.target.value)}>
                    {LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </Select>
                </FormField>
              </>
            ) : (
              <FormField label="Staff ID" className="sm:col-span-2">
                <div className="relative">
                  <IdCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <Input
                    className="pl-9"
                    value={form.staffId}
                    onChange={(e) => set('staffId', e.target.value)}
                    placeholder="LMUI/STF/0142 (optional — auto-assigned if blank)"
                  />
                </div>
              </FormField>
            )}

            <FormField label="Password" required error={errors.password}>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <Input
                  className="pl-9"
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                />
              </div>
            </FormField>
            <FormField label="Confirm Password" required error={errors.confirm}>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <Input
                  className="pl-9"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                  placeholder="••••••••"
                  error={errors.confirm}
                />
              </div>
            </FormField>

            {formError && (
              <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {formError}
              </div>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create Account'}
                {!submitting && <ArrowRight size={16} />}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gold-600 hover:underline">
              Sign in
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
