import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../services/firestore'

export default function AdminCourses() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    form_level: 'form1',
    stream: 'science',
    is_premium: false,
    is_published: false,
  })

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, 'courses'), orderBy('created_at', 'desc'))
      )
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    retry: false,
  })

  const create = useMutation({
    mutationFn: (data) => createCourse(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses'])
      setShowCreate(false)
      resetForm()
      toast.success('Course created!')
    },
    onError: () => toast.error('Failed to create course'),
  })

  const update = useMutation({
    mutationFn: ({ id, data }) => updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses'])
      setEditCourse(null)
      resetForm()
      toast.success('Course updated!')
    },
    onError: () => toast.error('Failed to update course'),
  })

  const remove = useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses'])
      toast.success('Course deleted')
    },
    onError: () => toast.error('Failed to delete course'),
  })

  const resetForm = () => setForm({
    title: '',
    description: '',
    form_level: 'form1',
    stream: 'science',
    is_premium: false,
    is_published: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editCourse) {
      update.mutate({ id: editCourse.id, data: form })
    } else {
      create.mutate(form)
    }
  }

  const startEdit = (course) => {
    setEditCourse(course)
    setForm({
      title: course.title,
      description: course.description || '',
      form_level: course.form_level,
      stream: course.stream,
      is_premium: course.is_premium || false,
      is_published: course.is_published || false,
    })
    setShowCreate(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Course management
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {courses?.length || 0} courses total
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setEditCourse(null); resetForm() }}
          className="btn-primary text-sm"
        >
          {showCreate ? 'Cancel' : '+ New course'}
        </button>
      </div>

      {/* Create / Edit form */}
      {showCreate && (
        <div className="card mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            {editCourse ? 'Edit course' : 'Create new course'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course title
              </label>
              <input
                className="input"
                placeholder="e.g. Biology Form 4 — Cell Division"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="What will students learn?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Form level
                </label>
                <select
                  className="input"
                  value={form.form_level}
                  onChange={(e) => setForm({ ...form, form_level: e.target.value })}
                >
                  {['form1','form2','form3','form4','form5','form6'].map((f) => (
                    <option key={f} value={f}>{f.replace('form', 'Form ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stream
                </label>
                <select
                  className="input"
                  value={form.stream}
                  onChange={(e) => setForm({ ...form, stream: e.target.value })}
                >
                  <option value="science">Science</option>
                  <option value="arts">Arts</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_premium}
                  onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                />
                Premium course
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                Publish immediately
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending
                ? 'Saving...'
                : editCourse ? 'Update course' : 'Create course'}
            </button>
          </form>
        </div>
      )}

      {/* Courses list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card animate-pulse h-16" />
          ))}
        </div>
      ) : courses?.length ? (
        <div className="card p-0 overflow-hidden">

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Course</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Stream</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Form</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{course.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-${course.stream}`}>{course.stream}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {course.form_level?.replace('form', 'Form ')}
                    </td>
                    <td className="px-4 py-3">
                      {course.is_premium ? (
                        <span className="badge-premium">Premium</span>
                      ) : (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        course.is_published
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(course)}
                          className="text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-2 py-1 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${course.title}"?`)) {
                              remove.mutate(course.id)
                            }
                          }}
                          className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {courses.map((course) => (
              <div key={course.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-snug flex-1">
                    {course.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    course.is_published
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {course.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{course.description}</p>
                )}

                <div className="flex gap-1 flex-wrap mb-3">
                  <span className={`badge-${course.stream}`}>{course.stream}</span>
                  <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                    {course.form_level?.replace('form', 'Form ')}
                  </span>
                  {course.is_premium ? (
                    <span className="badge-premium">Premium</span>
                  ) : (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(course)}
                    className="flex-1 text-xs text-primary-600 border border-primary-200 dark:border-primary-800 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${course.title}"?`)) {
                        remove.mutate(course.id)
                      }
                    }}
                    className="flex-1 text-xs text-red-600 border border-red-200 dark:border-red-800 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No courses yet</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create your first course
          </button>
        </div>
      )}
    </div>
  )
}