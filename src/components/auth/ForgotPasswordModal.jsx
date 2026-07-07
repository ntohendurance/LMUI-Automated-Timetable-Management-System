import { useState } from 'react'
import { Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input } from '../ui/Field.jsx'
import { authApi } from '../../api/endpoints.js'

export default function ForgotPasswordModal({ open, onClose }) {
  const [stage, setStage] = useState('email') // email | reset | done
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [account, setAccount] = useState(null)
  const [pwd, setPwd] = useState({ next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setStage('email')
    setEmail('')
    setToken('')
    setAccount(null)
    setPwd({ next: '', confirm: '' })
    setErrors({})
    setApiError('')
  }

  const close = () => {
    reset()
    onClose()
  }

  const requestReset = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Enter a valid email' })
      return
    }
    setErrors({})
    setBusy(true)
    try {
      const data = await authApi.forgotPassword(email)
      setToken(data.resetToken)
      setAccount({ name: data.name, email: data.email })
      setStage('reset')
    } catch (err) {
      setApiError(err.message || 'Could not verify that email')
    } finally {
      setBusy(false)
    }
  }

  const submitReset = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = {}
    if (!pwd.next) errs.next = 'Enter a new password'
    else if (pwd.next.length < 6) errs.next = 'At least 6 characters'
    if (pwd.confirm !== pwd.next) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      await authApi.resetPassword(token, pwd.next)
      setStage('done')
    } catch (err) {
      setApiError(err.message || 'Could not reset password')
    } finally {
      setBusy(false)
    }
  }

  const titles = {
    email: 'Reset your password',
    reset: 'Set a new password',
    done: 'Password updated',
  }
  const subtitles = {
    email: 'Enter your account email to begin.',
    reset: account ? `Verified as ${account.name}` : 'Choose a new password.',
    done: 'You can now sign in with your new password.',
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={titles[stage]}
      subtitle={subtitles[stage]}
      size="sm"
      footer={
        stage === 'done' ? (
          <Button variant="gold" onClick={close}>
            Back to Sign In
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button variant="gold" onClick={stage === 'email' ? requestReset : submitReset} disabled={busy}>
              {busy ? 'Please wait…' : stage === 'email' ? 'Continue' : 'Reset Password'}
              {!busy && <ArrowRight size={15} />}
            </Button>
          </>
        )
      }
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {apiError}
        </div>
      )}

      {stage === 'email' && (
        <form onSubmit={requestReset} className="space-y-4">
          <FormField label="Email Address" required error={errors.email}>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <Input
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lmui.edu"
                error={errors.email}
              />
            </div>
          </FormField>
          <p className="rounded-lg bg-navy-50 px-3 py-2 text-[11px] leading-relaxed text-navy-400">
            In production a secure reset link is emailed to you. For this build, verifying your
            email lets you set a new password right away.
          </p>
        </form>
      )}

      {stage === 'reset' && (
        <form onSubmit={submitReset} className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <ShieldCheck size={16} /> Account verified — {account?.email}
          </div>
          <FormField label="New Password" required error={errors.next}>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <Input
                className="pl-9"
                type="password"
                value={pwd.next}
                onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                placeholder="••••••••"
                error={errors.next}
              />
            </div>
          </FormField>
          <FormField label="Confirm Password" required error={errors.confirm}>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <Input
                className="pl-9"
                type="password"
                value={pwd.confirm}
                onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                error={errors.confirm}
              />
            </div>
          </FormField>
        </form>
      )}

      {stage === 'done' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={48} className="text-emerald-500" />
          <p className="text-sm text-navy-600">
            Your password has been reset successfully. Use it to sign in to your portal.
          </p>
        </div>
      )}
    </Modal>
  )
}
