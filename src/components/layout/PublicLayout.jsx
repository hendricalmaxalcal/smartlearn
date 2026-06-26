import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function PublicLayout() {
  const { user } = useSelector((s) => s.auth)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="text-lg font-medium">
          <span className="text-primary-600">Smart</span>Learn
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/courses" className="hover:text-gray-900">Courses</Link>
          <Link to="/pricing" className="hover:text-gray-900">Pricing</Link>
          <Link to="/about" className="hover:text-gray-900">About</Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard')}
              className="btn-primary"
            >
              Go to {user.role === 'admin' ? 'Admin' : 'Dashboard'}
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 px-6 py-4 text-sm text-gray-500 flex justify-between">
        <span>© 2026 SmartLearn. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-700">Terms</Link>
        </div>
      </footer>
    </div>
  )
}