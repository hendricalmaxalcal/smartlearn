import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAdminStats } from '../../services/firestore'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    retry: false,
  })

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Dashboard</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total students',  value: isLoading ? '...' : stats?.totalStudents || 0,  icon: '🎓', color: 'bg-primary-50 text-primary-600' },
          { label: 'Total teachers',  value: isLoading ? '...' : stats?.totalTeachers || 0,  icon: '👨‍🏫', color: 'bg-blue-50 text-blue-600' },
          { label: 'Active courses',  value: isLoading ? '...' : stats?.totalCourses || 0,   icon: '📚', color: 'bg-green-50 text-green-600' },
          { label: 'Total posts',     value: isLoading ? '...' : stats?.totalPosts || 0,     icon: '💬', color: 'bg-amber-50 text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-medium text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/admin/upload',        icon: '📤', label: 'Upload material',    desc: 'Add new videos, PDFs and notes' },
          { to: '/admin/courses',       icon: '📚', label: 'Manage courses',     desc: 'Create and edit courses' },
          { to: '/admin/users',         icon: '👥', label: 'Manage users',       desc: 'View and manage all users' },
          { to: '/admin/announcements', icon: '📢', label: 'Announcements',      desc: 'Post announcements to students' },
          { to: '/admin/subscriptions', icon: '💳', label: 'Subscriptions',      desc: 'Manage subscription plans' },
          { to: '/app/feed',            icon: '💬', label: 'Social feed',        desc: 'View student social activity' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card hover:border-primary-200 transition-colors"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-medium text-gray-900 text-sm mb-1">{item.label}</div>
            <div className="text-xs text-gray-500">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}