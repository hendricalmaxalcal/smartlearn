import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { getAnnouncements } from '../../services/firestore'
import { formatDistanceToNow } from 'date-fns'

const STORAGE_KEY = 'smartlearn_read_announcements'

const getReadIds = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const markAllAsRead = (ids) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export default function AnnouncementsPage() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    retry: false,
  })

  // Mark all as read when page opens
  useEffect(() => {
    if (announcements?.length) {
      const ids = announcements.map((a) => a.id)
      markAllAsRead(ids)
      // Refresh the layout badge count
      queryClient.invalidateQueries(['announcements-unread'])
    }
  }, [announcements, queryClient])

  const getTimestamp = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <div className="p-6 max-w-3xl">

      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900">Announcements</h1>
        <p className="text-gray-500 text-sm mt-1">
          Important updates from your teachers and admin
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : announcements?.length ? (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl px-5 py-4 border ${
                a.priority === 'urgent'
                  ? 'bg-red-50 border-red-200'
                  : a.priority === 'important'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-medium text-gray-900">
                  {a.title}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize font-medium ${
                  a.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : a.priority === 'important'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {a.priority}
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {a.body}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>📢 {a.author_name}</span>
                <span>·</span>
                <span>{getTimestamp(a.created_at)}</span>
                {a.target && a.target !== 'all' && (
                  <>
                    <span>·</span>
                    <span className="capitalize">
                      For {a.target} only
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-500 text-sm">
            Check back later for updates from your teachers
          </p>
        </div>
      )}
    </div>
  )
}