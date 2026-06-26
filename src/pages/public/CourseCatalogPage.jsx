import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getCourses, enrollInCourse } from '../../services/firestore'
import toast from 'react-hot-toast'

const STREAMS = ['all', 'science', 'arts', 'business']
const FORMS   = ['all', 'form1', 'form2', 'form3', 'form4', 'form5', 'form6']

export default function CourseCatalogPage() {
  const { user } = useSelector((s) => s.auth)
  const navigate = useNavigate()
  const [stream, setStream] = useState('all')
  const [form, setForm] = useState('all')
  const [search, setSearch] = useState('')

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses-catalog'],
    queryFn: () => getCourses({}),
    retry: false,
  })

  const filtered = (courses || []).filter((c) => {
    const matchStream = stream === 'all' || c.stream === stream
    const matchForm   = form === 'all'   || c.form_level === form
    const matchSearch = search
      ? c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      : true
    return matchStream && matchForm && matchSearch
  })

  const handleEnroll = async (course) => {
    if (!user) {
      navigate('/register')
      return
    }
    try {
      await enrollInCourse(user.id, course.id)
      toast.success(`Enrolled in ${course.title}!`)
      navigate('/app/my-courses')
    } catch {
      toast.error('Failed to enroll')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-12 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium text-gray-900 mb-3">
            Browse courses
          </h1>
          <p className="text-gray-500 mb-6">
            Quality content for Form 1–6 across Arts, Science and Business
          </p>
          <input
            className="input max-w-md mx-auto block"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="py-10 px-6 max-w-6xl mx-auto">

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-500 self-center">Stream:</span>
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setStream(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  stream === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200'
                }`}
              >
                {s === 'all' ? 'All streams' : s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-500 self-center">Form:</span>
            {FORMS.map((f) => (
              <button
                key={f}
                onClick={() => setForm(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200'
                }`}
              >
                {f === 'all' ? 'All forms' : f.replace('form', 'Form ')}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500 mb-4">
          {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
        </div>

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                user={user}
                onEnroll={() => handleEnroll(course)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or search term
            </p>
            <button
              onClick={() => { setStream('all'); setForm('all'); setSearch('') }}
              className="btn-outline text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

function CourseCard({ course, user, onEnroll }) {
  const streamConfig = {
    science:  { bg: '#EEEDFE', icon: '🔬', badge: 'badge-science' },
    arts:     { bg: '#E6F1FB', icon: '✏️',  badge: 'badge-arts' },
    business: { bg: '#FAEEDA', icon: '💼',  badge: 'badge-business' },
  }[course.stream] || { bg: '#f3f4f6', icon: '📚', badge: '' }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary-200 transition-colors">

      {/* Thumbnail */}
      <div
        className="h-32 flex items-center justify-center text-4xl"
        style={{ background: course.thumbnail_url ? 'none' : streamConfig.bg }}
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          streamConfig.icon
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex gap-1 mb-2 flex-wrap">
          <span className={streamConfig.badge}>{course.stream}</span>
          <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full">
            {course.form_level?.replace('form', 'Form ')}
          </span>
          {course.is_premium && (
            <span className="badge-premium">Premium</span>
          )}
        </div>

        <h3 className="font-medium text-gray-900 text-sm leading-snug mb-2">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
            {course.description}
          </p>
        )}

        <button
          onClick={onEnroll}
          className="btn-primary w-full text-sm py-2"
        >
          {user ? 'Enroll now' : 'Sign up to enroll'}
        </button>
      </div>
    </div>
  )
}