import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getMyCourses, getEvents } from '../../../services/firestore'

const statCards = (data) => [
  {
    label: 'Enrolled courses',
    value: data?.enrolled || 0,
    icon: '📚',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    label: 'Completed lessons',
    value: data?.completed || 0,
    icon: '✅',
    color: 'bg-green-50 text-green-600',
  },
  {
    label: 'Quiz average',
    value: data?.quizAvg ? `${data.quizAvg}%` : 'N/A',
    icon: '🎯',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Study streak',
    value: `${data?.streak || 0} days`,
    icon: '🔥',
    color: 'bg-red-50 text-red-600',
  },
]

export default function StudentDashboard() {
  const { user } = useSelector((s) => s.auth)

  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: () => getMyCourses(user.id),
    enabled: !!user?.id,
    retry: false,
  })

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    retry: false,
  })

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const dashData = {
    enrolled: courses?.length || 0,
    completed: 0,
    quizAvg: null,
    streak: 0,
    recentCourses: courses?.slice(0, 5) || [],
    upcomingEvents: events?.slice(0, 3) || [],
  }

  return (
    <div className="p-6 max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">
          {greeting()}, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.form_level?.replace('form', 'Form ')} ·{' '}
          <span className="capitalize">{user?.stream}</span> stream
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards(dashData).map((s) => (
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

        {/* Continue learning */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-gray-900">Continue learning</h2>
            <Link to="/app/my-courses" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : dashData.recentCourses.length ? (
            <div className="space-y-3">
              {dashData.recentCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/app/courses/${course.slug}`}
                  className="card flex items-center gap-4 hover:border-primary-200 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background:
                        course.stream === 'science' ? '#EEEDFE' :
                        course.stream === 'arts' ? '#E6F1FB' : '#FAEEDA'
                    }}
                  >
                    {course.stream === 'science' ? '🔬' :
                     course.stream === 'arts' ? '✏️' : '💼'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {course.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {course.progress || 0}% complete
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-primary-600 font-medium flex-shrink-0">
                    Continue →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-500 text-sm mb-4">
                You haven't enrolled in any courses yet
              </p>
              <Link to="/courses" className="btn-primary text-sm px-6">
                Browse courses
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Upcoming events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-gray-900">Upcoming events</h2>
              <Link to="/app/events" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            {dashData.upcomingEvents.length ? (
              <div className="space-y-2">
                {dashData.upcomingEvents.map((event) => (
                  <div key={event.id} className="card py-3">
                    <div className="font-medium text-gray-900 text-sm">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      📅 {event.event_date?.toDate
                        ? event.event_date.toDate().toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : new Date(event.event_date).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-6">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-xs text-gray-400">No upcoming events</p>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-4">Quick links</h2>
            <div className="space-y-2">
              {[
                { to: '/app/feed',     icon: '💬', label: 'Social feed' },
                { to: '/app/groups',   icon: '👥', label: 'Study groups' },
                { to: '/app/messages', icon: '✉️',  label: 'Messages' },
                { to: '/courses',      icon: '🔍', label: 'Browse courses' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-colors text-sm text-gray-700"
                >
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