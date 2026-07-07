import { useState } from 'react'
import { Save, Check, KeyRound } from 'lucide-react'
import PageWrapper from './layout/PageWrapper.jsx'
import Button from './ui/Button.jsx'
import { FormField, Input } from './ui/Field.jsx'
import { authApi } from '../api/endpoints.js'

/**
 * Shared profile page — displays read-only identity fields plus a working
 * change-password form (POST /auth/change-password). Used by Lecturer & Student.
 * fields: [{ label, value }]
 */
export default function ProfileView({ name, role, fields }) {
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const set = (k, v) => setPwd((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = {}
    if (!pwd.current) errs.current = 'Enter your current password'
    if (!pwd.next) errs.next = 'Enter a new password'
    else if (pwd.next.length < 6) errs.next = 'At least 6 characters'
    if (pwd.confirm !== pwd.next) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      await authApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.next })
      setSaved(true)
      setPwd({ current: '', next: '', confirm: '' })
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setApiError(err.message || 'Could not change password')
    } finally {
      setSaving(false)
    }
  }

  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <PageWrapper title="Profile" description="Your account details and security settings.">
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-4 text-left sm:flex-col sm:text-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 font-display text-2xl text-gold-300 sm:h-20 sm:w-20 sm:text-3xl">
              {initials}
            </span>
            <div className="min-w-0 sm:mt-4 sm:flex sm:flex-col sm:items-center">
              <p className="truncate font-display text-xl text-navy-900 sm:max-w-full">{name}</p>
              <span className="mt-1 inline-block rounded-full bg-gold-100 px-3 py-0.5 text-xs font-semibold capitalize text-gold-700">
                {role}
              </span>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-navy-50 pt-5 sm:mt-6 sm:grid-cols-1">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">
                  {f.label}
                </dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-navy-800">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Change password */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-lg bg-navy-100 p-2 text-navy-700">
                <KeyRound size={18} />
              </span>
              <h3 className="font-display text-lg text-navy-900">Change Password</h3>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <FormField label="Current Password" required error={errors.current}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={pwd.current}
                  onChange={(e) => set('current', e.target.value)}
                  placeholder="••••••••"
                  error={errors.current}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="New Password" required error={errors.next}>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={pwd.next}
                    onChange={(e) => set('next', e.target.value)}
                    placeholder="••••••••"
                    error={errors.next}
                  />
                </FormField>
                <FormField label="Confirm Password" required error={errors.confirm}>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={pwd.confirm}
                    onChange={(e) => set('confirm', e.target.value)}
                    placeholder="••••••••"
                    error={errors.confirm}
                  />
                </FormField>
              </div>
              {apiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {apiError}
                </div>
              )}
              <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center">
                <Button type="submit" variant="gold" disabled={saving} className="w-full justify-center sm:w-auto">
                  {saved ? <Check size={16} /> : <Save size={16} />}
                  {saving ? 'Updating…' : saved ? 'Updated' : 'Update Password'}
                </Button>
                {saved && (
                  <span className="text-center text-sm font-medium text-emerald-600 sm:text-left">
                    Password updated successfully.
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
