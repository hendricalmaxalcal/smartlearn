import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../../store/authSlice'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!')
      const user = result.payload
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard')
    } else {
      toast.error(result.payload || 'Login failed')
    }
  }

  const resendVerification = async () => {
    if (!form.email) {
      toast.error('Please enter your email address first')
      return
    }
    try {
      await api.post('/auth/resend-verification', { email: form.email })
      toast.success('Verification email sent! Check your inbox.')
    } catch {
      toast.error('Could not resend email. Try again.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/smartlearn.png"
            alt="SmartLearn"
            className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3"
          />
          <h1 className="text-2xl font-medium text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue learning</p>
        </div>

        <div className="card">

          {/* Error banner */}
          {error && (
            <div className={`text-sm rounded-lg px-3 py-2 mb-4 border ${
              error.includes('verify')
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
              {error.includes('verify') && (
                <div className="mt-2">
                  <button
                    onClick={resendVerification}
                    className="text-amber-700 underline text-xs font-medium hover:text-amber-900"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-base"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>


          {/* Switch to register */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">
              Sign up free
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}