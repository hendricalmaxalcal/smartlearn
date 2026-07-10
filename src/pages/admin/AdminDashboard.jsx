import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase'
import { getAdminStats } from '../../services/firestore'

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth)
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    retry: false,
  })

  const quickActions = [
    {
      to: '/admin/upload',
      icon: '📤',
      label: 'Upload material',
      desc: 'Add new videos, PDFs and notes',
      color: 'bg-primary-50',
    },
    {
      to: '/admin/courses',
      icon: '📚',
      label: 'Manage courses',
      desc: 'Create, edit and publish',
      color: 'bg-green-50',
    },
    {
      to: '/admin/announcements',
      icon: '📢',
      label: 'Announcements',
      desc: 'Post to students',
      color: 'bg-amber-50',
    },
    {
      to: '/app/feed',
      icon: '💬',
      label: 'Social feed',
      desc: 'Monitor student activity',
      color: 'bg-red-50',
    },
    ...(isAdmin ? [
      {
        to: '/admin/users',
        icon: '👥',
        label: 'Manage users',
        desc: 'View and manage all users',
        color: 'bg-blue-50',
      },
      {
        to: '/admin/subscriptions',
        icon: '💳',
        label: 'Subscriptions',
        desc: 'Manage plans and pricing',
        color: 'bg-purple-50',
      },
    ] : []),
  ]

  return (
    <div className="p-4 md:p-6">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          {
            label: 'Total students',
            value: isLoading ? '...' : stats?.totalStudents || 0,
            icon: '🎓',
            color: 'bg-primary-50 text-primary-600',
            delta: 'Registered users',
          },
          {
            label: 'Total teachers',
            value: isLoading ? '...' : stats?.totalTeachers || 0,
            icon: '👨‍🏫',
            color: 'bg-blue-50 text-blue-600',
            delta: 'Active teachers',
          },
          {
            label: 'Published courses',
            value: isLoading ? '...' : stats?.totalCourses || 0,
            icon: '📚',
            color: 'bg-green-50 text-green-600',
            delta: 'Live courses',
          },
          {
            label: 'Total posts',
            value: isLoading ? '...' : stats?.totalPosts || 0,
            icon: '💬',
            color: 'bg-amber-50 text-amber-600',
            delta: 'Social activity',
          },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-medium text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Quick actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card hover:border-primary-200 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${item.color}`}>
                {item.icon}
              </div>
              <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                {item.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed hidden md:block">
                {item.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Recent users</h3>
            {isAdmin && (
              <Link to="/admin/users" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            )}
          </div>
          <RecentUsers />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Recent courses</h3>
            <Link to="/admin/courses" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <RecentCourses />
        </div>
      </div>
    </div>
  )
}

function RecentUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, 'users'), orderBy('created_at', 'desc'), limit(5))
      )
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    retry: false,
  })

  const getRoleColor = (role) => {
    const r = role?.toLowerCase()
    if (r === 'admin')   return 'bg-red-50 text-red-700'
    if (r === 'teacher') return 'bg-blue-50 text-blue-700'
    return 'bg-green-50 text-green-700'
  }

  if (isLoading) {
    return (
      <div className="card animate-pulse space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">User</th>
            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Role</th>
            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium hidden md:table-cell">Stream</th>
          </tr>
        </thead>
        <tbody>
          {(users || []).map((u) => (
            <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
                    {u.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-xs truncate max-w-24 md:max-w-none">
                      {u.full_name}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-24 md:max-w-none hidden md:block">
                      {u.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleColor(u.role)}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-2 hidden md:table-cell">
                {u.stream ? (
                  <span className={`badge-${u.stream?.toLowerCase()}`}>{u.stream}</span>
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
          {!users?.length && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-gray-400 text-xs">
                No users yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function RecentCourses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-recent-courses'],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, 'courses'), orderBy('created_at', 'desc'), limit(5))
      )
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="card animate-pulse space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Course</th>
            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium hidden md:table-cell">Stream</th>
            <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {(courses || []).map((c) => (
            <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-2">
                <div className="font-medium text-gray-900 text-xs truncate max-w-32 md:max-w-40">
                  {c.title}
                </div>
                <div className="text-xs text-gray-400">
                  {c.form_level?.replace('form', 'Form ')}
                </div>
              </td>
              <td className="px-4 py-2 hidden md:table-cell">
                {c.stream ? (
                  <span className={`badge-${c.stream}`}>{c.stream}</span>
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  c.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {c.is_published ? 'Live' : 'Draft'}
                </span>
              </td>
            </tr>
          ))}
          {!courses?.length && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-gray-400 text-xs">
                No courses yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}