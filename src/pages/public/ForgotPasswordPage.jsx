import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
      toast.success('Reset email sent!')
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email')
      } else {
        toast.error('Failed to send reset email')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <img
            src="/smartlearn.png"
            alt="SmartLearn"
            className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3"
          />
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
            Reset your password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                We sent a password reset link to <strong>{email}</strong>.
                Click the link to reset your password.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="btn-primary w-full block py-2.5 text-center">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
