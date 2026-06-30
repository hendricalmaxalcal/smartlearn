import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function PublicLayout() {
  const { user } = useSelector((s) => s.auth)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="text-lg font-medium">
          <span className="text-primary-600">Smart</span>Learn
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/courses" className="hover:text-gray-900">Courses</Link>
          <Link to="/pricing" className="hover:text-gray-900">Pricing</Link>
          <Link to="/about" className="hover:text-gray-900">About</Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
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

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-xl text-gray-600"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-3 text-sm">
          <Link to="/courses" onClick={() => setMenuOpen(false)} className="text-gray-600">Courses</Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)} className="text-gray-600">Pricing</Link>
          <Link to="/about"   onClick={() => setMenuOpen(false)} className="text-gray-600">About</Link>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {user ? (
              <button
                onClick={() => { setMenuOpen(false); navigate(user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard') }}
                className="btn-primary flex-1"
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline flex-1 text-center">Log in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 px-4 md:px-6 py-4 text-sm text-gray-500 flex flex-col md:flex-row gap-2 justify-between text-center md:text-left">
        <span>© 2026 SmartLearn. All rights reserved.</span>
        <div className="flex gap-4 justify-center">
          <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-700">Terms</Link>
        </div>
      </footer>
    </div>
  )
}