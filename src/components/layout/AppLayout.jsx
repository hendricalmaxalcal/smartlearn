import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { logout } from '../../store/authSlice'
import { getAnnouncements } from '../../services/firestore'

const nav = [
  { to: '/app/dashboard',     label: 'Dashboard',     icon: '▣' },
  { to: '/app/my-courses',    label: 'My courses',    icon: '📚' },
  { to: '/app/feed',          label: 'Social feed',   icon: '💬' },
  { to: '/app/groups',        label: 'Study groups',  icon: '👥' },
  { to: '/app/messages',      label: 'Messages',      icon: '✉️' },
  { to: '/app/events',        label: 'Events',        icon: '📅' },
  { to: '/app/announcements', label: 'Announcements', icon: '📢' },
]

export default function AppLayout() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    refetchInterval: 30000,
    retry: false,
  })

  const getUnreadCount = () => {
    if (!announcements?.length) return 0
    try {
      const readIds = JSON.parse(
        localStorage.getItem('smartlearn_read_announcements') || '[]'
      )
      return announcements.filter((a) => !readIds.includes(a.id)).length
    } catch {
      return 0
    }
  }

  const unreadCount = getUnreadCount()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col">

        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <span className="font-medium text-gray-900">
            <span className="text-primary-600">Smart</span>Learn
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                {item.label}
              </div>
              {item.to === '/app/announcements' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">
                {user?.full_name}
              </div>
              <div className="text-xs text-gray-400 capitalize truncate">
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}