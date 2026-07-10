import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { getMyCourses } from '../../services/firestore'

const FILTERS = ['All', 'Science', 'Arts', 'Business']

export default function MyCoursesPage() {
  const { user } = useSelector((s) => s.auth)
  const [filter, setFilter] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: () => getMyCourses(user.id),
    enabled: !!user?.id,
    retry: false,
    staleTime: 0,
  })

  const filtered = (data || []).filter((c) =>
    filter === 'All' ? true : c.stream?.toLowerCase() === filter.toLowerCase()
  )

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">My courses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {data?.length || 0} courses enrolled
          </p>
        </div>
        <Link to="/courses" className="btn-primary text-sm">
          Browse more
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filter === 'All' ? 'No courses yet' : `No ${filter} courses`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Start learning by enrolling in your first course
          </p>
          <Link to="/courses" className="btn-primary px-8">
            Browse courses
          </Link>
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }) {
  const streamColor = {
    science:  { bg: '#EEEDFE', icon: '🔬', badge: 'badge-science' },
    arts:     { bg: '#E6F1FB', icon: '✏️',  badge: 'badge-arts' },
    business: { bg: '#FAEEDA', icon: '💼',  badge: 'badge-business' },
  }[course.stream] || { bg: '#f3f4f6', icon: '📚', badge: '' }

  return (
    <div className="card p-0 overflow-hidden hover:border-primary-200 transition-colors">
      <div
        className="h-32 flex items-center justify-center text-4xl"
        style={{ background: course.thumbnail_url ? 'none' : streamColor.bg }}
      >
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          streamColor.icon
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-1 mb-2 flex-wrap">
          <span className={streamColor.badge}>{course.stream}</span>
          <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full">
            {course.form_level?.replace('form', 'Form ')}
          </span>
          {course.is_premium && <span className="badge-premium">Premium</span>}
        </div>

        <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-snug mb-3">
          {course.title}
        </h3>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{course.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${course.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {course.total_resources || 0} lessons
          </span>
          <Link
            to={`/app/courses/${course.slug}`}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            {course.progress > 0 ? 'Continue →' : 'Start →'}
          </Link>
        </div>
      </div>
    </div>
  )
}
