import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import ThemeToggle from '../common/ThemeToggle'

export default function AppLayout() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isTeacher = user?.role?.toLowerCase() === 'teacher'

  const nav = [
    { to: '/app/dashboard',      label: 'Dashboard',     icon: '🏠' },
    { to: '/app/my-courses',     label: 'My courses',    icon: '📚' },
    ...(isTeacher ? [
      { to: '/app/events',       label: 'Events',        icon: '📅' },
    ] : []),
    { to: '/app/feed',           label: 'Social feed',   icon: '💬' },
    { to: '/app/groups',         label: 'Study groups',  icon: '👥' },
    { to: '/app/messages',       label: 'Messages',      icon: '✉️' },
    { to: '/app/announcements',  label: 'Announcements', icon: '📢' },
    { to: '/app/profile',        label: 'Profile',       icon: '👤' },
  ]

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900">

      <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">
          <span className="text-primary-600">Smart</span>Learn
        </span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-600 dark:text-gray-300 text-xl p-1"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <aside className={`
        md:w-52 md:flex md:flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        ${menuOpen ? 'flex flex-col' : 'hidden'}
        md:relative absolute z-40 w-full md:h-auto h-[calc(100vh-57px)]
      `}>
        <div className="hidden md:block p-4 border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
          <span className="text-primary-600">Smart</span>Learn
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <ThemeToggle className="w-full justify-center" />
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 truncate">
            {user?.full_name}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  )
}
