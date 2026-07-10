import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getAllEvents, createEvent, deleteEvent } from '../../services/firestore'

export default function AdminEvents() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '09:00',
    location: '',
    is_online: false,
  })

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: getAllEvents,
    retry: false,
  })

  const create = useMutation({
    mutationFn: (data) => createEvent(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
      queryClient.invalidateQueries(['events'])
      queryClient.invalidateQueries(['events-all'])
      setShowCreate(false)
      setForm({ title: '', description: '', event_date: '', event_time: '09:00', location: '', is_online: false })
      toast.success('Event created!')
    },
    onError: () => toast.error('Failed to create event'),
  })

  const remove = useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
      queryClient.invalidateQueries(['events'])
      queryClient.invalidateQueries(['events-all'])
      toast.success('Event deleted')
    },
    onError: () => toast.error('Failed to delete event'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.event_date) return
    const eventDate = new Date(`${form.event_date}T${form.event_time}`)
    create.mutate({
      title: form.title,
      description: form.description,
      event_date: eventDate,
      location: form.location,
      is_online: form.is_online,
    })
  }

  const isPast = (ts) => {
    const date = ts?.toDate ? ts.toDate() : new Date(ts)
    return date < new Date()
  }

  const getTimestamp = (ts) => {
    if (!ts) return ''
    const date = ts?.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">Events</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Create and manage school events
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
          {showCreate ? 'Cancel' : '+ New event'}
        </button>
      </div>

      {showCreate && (
        <div className="card mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Create new event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event title
              </label>
              <input
                className="input"
                placeholder="e.g. End of Term Exam"
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
                placeholder="What is this event about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  className="input"
                  value={form.event_time}
                  onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                className="input"
                placeholder="e.g. Main Hall or Google Meet"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_online}
                onChange={(e) => setForm({ ...form, is_online: e.target.checked })}
              />
              Online event
            </label>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create event'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="card animate-pulse h-20" />)}
        </div>
      ) : events?.length ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`card flex items-start gap-4 ${isPast(event.event_date) ? 'opacity-60' : ''}`}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex flex-col items-center justify-center">
                <div className="text-lg font-medium text-primary-600">
                  {(event.event_date?.toDate ? event.event_date.toDate() : new Date(event.event_date)).getDate()}
                </div>
                <div className="text-xs text-primary-400 uppercase">
                  {(event.event_date?.toDate ? event.event_date.toDate() : new Date(event.event_date))
                    .toLocaleDateString('en-GB', { month: 'short' })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {event.is_online && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        Online
                      </span>
                    )}
                    {isPast(event.event_date) && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                        Past
                      </span>
                    )}
                    <button
                      onClick={() => { if (window.confirm(`Delete "${event.title}"?`)) remove.mutate(event.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {event.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>🕐 {getTimestamp(event.event_date)}</span>
                  {event.location && <span>📍 {event.location}</span>}
                  <span>👥 {event.attendee_ids?.length || 0} attending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No events yet</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create your first event
          </button>
        </div>
      )}
    </div>
  )
}
