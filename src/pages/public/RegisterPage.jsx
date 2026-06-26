import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/authSlice'
import toast from 'react-hot-toast'

const STREAMS = [
  { value: 'science',  label: 'Science',  icon: '🔬', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { value: 'arts',     label: 'Arts',     icon: '✏️',  color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { value: 'business', label: 'Business', icon: '💼',  color: 'bg-amber-50 border-amber-200 text-amber-800' },
]

const FORMS = [
  { value: 'form1', label: 'Form 1' },
  { value: 'form2', label: 'Form 2' },
  { value: 'form3', label: 'Form 3' },
  { value: 'form4', label: 'Form 4' },
  { value: 'form5', label: 'Form 5' },
  { value: 'form6', label: 'Form 6' },
]

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((s) => s.auth)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    form_level: 'form1',
    stream: 'science',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to SmartLearn.')
      navigate('/app/dashboard')
    } else {
      toast.error(result.payload || 'Registration failed')
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/smartlearn.png"
            alt="SmartLearn"
            className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3"
          />
          <h1 className="text-2xl font-medium text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join thousands of students today — it's free
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name + Form level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  className="input"
                  placeholder="Amina Hassan"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form level
                </label>
                <select
                  className="input"
                  value={form.form_level}
                  onChange={(e) => setForm({ ...form, form_level: e.target.value })}
                >
                  {FORMS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
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
              {/* Password strength bar */}
              {form.password.length > 0 && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= i * 3
                          ? form.password.length >= 10
                            ? 'bg-green-400'
                            : 'bg-amber-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stream selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic stream
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STREAMS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, stream: s.value })}
                    className={`border-2 rounded-xl p-3 text-center transition-all ${
                      form.stream === s.value
                        ? `${s.color} border-current`
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-2xl mb-1">{s.icon}</span>
                    <span className="text-xs font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center">
              By signing up you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
            </p>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-base"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>

          {/* Switch to login */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}