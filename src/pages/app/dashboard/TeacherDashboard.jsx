import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getTeacherCourses } from '../../../services/firestore'

export default function TeacherDashboard() {
  const { user } = useSelector((s) => s.auth)

  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-courses', user?.id],
    queryFn: () => getTeacherCourses(user.id),
    enabled: !!user?.id,
    retry: false,
  })

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const totalStudents = courses?.reduce((acc, c) => acc + (c.enrollment_count || 0), 0) || 0
  const publishedCourses = courses?.filter((c) => c.is_published)?.length || 0
  const draftCourses = courses?.filter((c) => !c.is_published)?.length || 0

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">
          {greeting()}, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Teacher · <span className="capitalize">{user?.stream}</span> stream
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My courses',        value: courses?.length || 0, icon: '📚', color: 'bg-primary-50 text-primary-600' },
          { label: 'Total students',    value: totalStudents,         icon: '🎓', color: 'bg-green-50 text-green-600' },
          { label: 'Published courses', value: publishedCourses,      icon: '✅', color: 'bg-blue-50 text-blue-600' },
          { label: 'Draft courses',     value: draftCourses,          icon: '📝', color: 'bg-amber-50 text-amber-600' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-gray-900">My courses</h2>
            <Link to="/app/my-courses" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : courses?.length ? (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="card flex items-center gap-4 hover:border-primary-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: course.stream === 'science' ? '#EEEDFE' : course.stream === 'arts' ? '#E6F1FB' : '#FAEEDA' }}>
                    {course.stream === 'science' ? '🔬' : course.stream === 'arts' ? '✏️' : '💼'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{course.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span className={`badge-${course.stream}`}>{course.stream}</span>
                      <span>{course.form_level?.replace('form', 'Form ')}</span>
                      <span>·</span>
                      <span>{course.enrollment_count || 0} students</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-500 text-sm mb-4">You haven't created any courses yet</p>
              <Link to="/admin/upload" className="btn-primary text-sm px-6">Create your first course</Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-4">Quick actions</h2>
            <div className="space-y-2">
              {[
                { to: '/admin/upload',       icon: '📤', label: 'Upload material' },
                { to: '/admin/courses',      icon: '📚', label: 'Manage courses' },
                { to: '/admin/announcements',icon: '📢', label: 'Post announcement' },
                { to: '/app/feed',           icon: '💬', label: 'Social feed' },
                { to: '/app/messages',       icon: '✉️',  label: 'Messages' },
              ].map((item) => (
                <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-colors text-sm text-gray-700">
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
