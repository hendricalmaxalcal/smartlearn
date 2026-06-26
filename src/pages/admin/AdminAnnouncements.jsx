import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../../services/firestore'

const PRIORITIES = [
  { value: 'normal',    label: 'Normal',    color: 'bg-blue-50 text-blue-700' },
  { value: 'important', label: 'Important', color: 'bg-amber-50 text-amber-700' },
  { value: 'urgent',    label: 'Urgent',    color: 'bg-red-50 text-red-700' },
]

const TARGETS = [
  { value: 'all',      label: 'All students' },
  { value: 'science',  label: 'Science stream' },
  { value: 'arts',     label: 'Arts stream' },
  { value: 'business', label: 'Business stream' },
  { value: 'form1',    label: 'Form 1 only' },
  { value: 'form2',    label: 'Form 2 only' },
  { value: 'form3',    label: 'Form 3 only' },
  { value: 'form4',    label: 'Form 4 only' },
  { value: 'form5',    label: 'Form 5 only' },
  { value: 'form6',    label: 'Form 6 only' },
]

export default function AdminAnnouncements() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    body: '',
    priority: 'normal',
    target: 'all',
  })

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    retry: false,
  })

  const create = useMutation({
    mutationFn: (data) => createAnnouncement(user.id, user.full_name, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
      setForm({ title: '', body: '', priority: 'normal', target: 'all' })
      toast.success('Announcement published!')
    },
    onError: () => toast.error('Failed to publish announcement'),
  })

  const remove = useMutation({
    mutationFn: (id) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
      toast.success('Announcement deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    create.mutate(form)
  }

  const getTimestamp = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const getPriorityColor = (priority) => {
    return PRIORITIES.find((p) => p.value === priority)?.color ||
      'bg-blue-50 text-blue-700'
  }

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-medium">Announcements</h2>
        <p className="text-gray-500 text-sm mt-1">
          Post announcements to students
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Create form */}
        <div>
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-4">
              Post new announcement
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  className="input"
                  placeholder="e.g. End of term exam schedule"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  placeholder="Write your announcement here..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target audience
                  </label>
                  <select
                    className="input"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                  >
                    {TARGETS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="input"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview */}
              {(form.title || form.body) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Preview</p>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-gray-900 text-sm">
                      {form.title || 'Title...'}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getPriorityColor(form.priority)}`}>
                      {form.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {form.body || 'Message...'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    To: {TARGETS.find((t) => t.value === form.target)?.label}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full py-2.5"
                disabled={create.isPending}
              >
                {create.isPending ? 'Publishing...' : 'Publish announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* Announcements list */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Recent announcements
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : announcements?.length ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="card hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-gray-900 text-sm leading-snug flex-1">
                      {a.title}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(a.priority)}`}>
                        {a.priority}
                      </span>
                      <button
                        onClick={() => remove.mutate(a.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                    {a.body}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      To: {TARGETS.find((t) => t.value === a.target)?.label || a.target}
                    </span>
                    <span>·</span>
                    <span>{getTimestamp(a.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">📢</div>
              <p className="text-gray-400 text-sm">
                No announcements yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}