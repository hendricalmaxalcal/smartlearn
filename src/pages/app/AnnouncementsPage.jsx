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

  useEffect(() => {
    if (announcements?.length) {
      const ids = announcements.map((a) => a.id)
      markAllAsRead(ids)
      queryClient.invalidateQueries(['announcements-unread'])
    }
  }, [announcements, queryClient])

  const getTimestamp = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          card: 'bg-white dark:bg-gray-800 border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 dark:border-gray-700',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          icon: '🚨',
        }
      case 'important':
        return {
          card: 'bg-white dark:bg-gray-800 border-l-4 border-l-amber-500 border-t border-r border-b border-gray-200 dark:border-gray-700',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          icon: '⚠️',
        }
      default:
        return {
          card: 'bg-white dark:bg-gray-800 border-l-4 border-l-primary-500 border-t border-r border-b border-gray-200 dark:border-gray-700',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          icon: '📢',
        }
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">

      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
          Announcements
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Important updates from your teachers and admin
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : announcements?.length ? (
        <div className="space-y-4">
          {announcements.map((a) => {
            const styles = getPriorityStyles(a.priority)
            return (
              <div
                key={a.id}
                className={`rounded-xl px-5 py-4 shadow-sm ${styles.card}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">{styles.icon}</span>
                    <h3 className="font-medium text-gray-900 dark:text-white leading-snug">
                      {a.title}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize font-medium ${styles.badge}`}>
                    {a.priority}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3 ml-7">
                  {a.body}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 ml-7">
                  <span>👤 {a.author_name}</span>
                  <span>·</span>
                  <span>{getTimestamp(a.created_at)}</span>
                  {a.target && a.target !== 'all' && (
                    <>
                      <span>·</span>
                      <span className="capitalize">For {a.target} only</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Check back later for updates from your teachers
          </p>
        </div>
      )}
    </div>
  )
}