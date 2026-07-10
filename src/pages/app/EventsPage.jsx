import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getAllEvents, rsvpEvent } from '../../services/firestore'

export default function EventsPage() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('upcoming')

  const { data: events, isLoading } = useQuery({
    queryKey: ['events-all'],
    queryFn: getAllEvents,
    retry: false,
  })

  const rsvp = useMutation({
    mutationFn: (eventId) => rsvpEvent(eventId, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['events-all'])
      toast.success('RSVP confirmed!')
    },
    onError: () => toast.error('Failed to RSVP'),
  })

  const now = new Date()
  const upcoming = (events || []).filter((e) => {
    const date = e.event_date?.toDate ? e.event_date.toDate() : new Date(e.event_date)
    return date >= now
  })
  const past = (events || []).filter((e) => {
    const date = e.event_date?.toDate ? e.event_date.toDate() : new Date(e.event_date)
    return date < now
  })
  const displayed = activeTab === 'upcoming' ? upcoming : past

  const getTime = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Events</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Upcoming school events and activities
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past',     label: `Past (${past.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : displayed.length ? (
        <div className="space-y-4">
          {displayed.map((event) => {
            const isAttending = event.attendee_ids?.includes(user?.id)
            const isPast = activeTab === 'past'
            return (
              <div key={event.id} className={`card hover:border-primary-200 transition-colors ${isPast ? 'opacity-70' : ''}`}>
                <div className="flex items-start gap-4">
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
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {event.is_online && (
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            Online
                          </span>
                        )}
                        {!isPast && (
                          <button
                            onClick={() => rsvp.mutate(event.id)}
                            disabled={isAttending || rsvp.isPending}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              isAttending
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : 'btn-primary'
                            }`}
                          >
                            {isAttending ? 'Going' : 'RSVP'}
                          </button>
                        )}
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>🕐 {getTime(event.event_date)}</span>
                      {event.location && <span>📍 {event.location}</span>}
                      <span>👥 {event.attendee_ids?.length || 0} attending</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {activeTab === 'upcoming' ? 'Check back later for upcoming events' : 'Past events will appear here'}
          </p>
        </div>
      )}
    </div>
  )
}
