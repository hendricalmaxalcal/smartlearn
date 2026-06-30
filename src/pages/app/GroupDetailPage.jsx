import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import {
  getGroup,
  getGroupMessages,
  sendGroupMessage as fbSendMessage,
  deleteGroup as fbDeleteGroup,
  deleteGroupMessage,
} from '../../services/firestore'

export default function GroupDetailPage() {
  const { id } = useParams()
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeMsgId, setActiveMsgId] = useState(null)
  const bottomRef = useRef(null)

  const handleDeleteGroup = async () => {
    setDeleting(true)
    try {
      await fbDeleteGroup(id)
      toast.success('Group deleted')
      navigate('/app/groups')
    } catch {
      toast.error('Failed to delete group')
    } finally {
      setDeleting(false)
    }
  }

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id),
  })

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['group-messages', id],
    queryFn: () => getGroupMessages(id),
    refetchInterval: 5000,
  })

  const sendMessage = useMutation({
    mutationFn: ({ content }) =>
      fbSendMessage(id, user.id, user.full_name, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['group-messages', id])
      setMessage('')
    },
    onError: () => toast.error('Failed to send message'),
  })

  const deleteMsg = useMutation({
    mutationFn: (messageId) => deleteGroupMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['group-messages', id])
      setActiveMsgId(null)
      toast.success('Message deleted')
    },
    onError: () => toast.error('Failed to delete message'),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMessage.mutate({ content: message })
  }

  const getTimestamp = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-gray-400">Loading group...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="text-lg font-medium mb-2">Group not found</h2>
        <Link to="/app/groups" className="btn-primary">
          Back to groups
        </Link>
      </div>
    )
  }

  const isMember = group.member_ids?.includes(user?.id)
  const isOwner = group.owner_id === user?.id
  const memberCount = group.member_ids?.length || 0

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/app/groups" className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0">
              ←
            </Link>
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">
              👥
            </div>
            <div className="min-w-0">
              <h1 className="font-medium text-gray-900 truncate">{group.name}</h1>
              <p className="text-xs text-gray-400 truncate">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
                {group.stream && ` · ${group.stream}`}
                {group.form_level && ` · ${group.form_level.replace('form', 'Form ')}`}
              </p>
            </div>
          </div>
          {(isOwner || user?.role === 'admin') && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-red-500 text-sm p-2 flex-shrink-0"
              title="Delete group"
            >
              🗑️
            </button>
          )}
        </div>

        {/* Delete group confirm */}
        {showDeleteConfirm && (
          <div
            style={{ minHeight: '200px', background: 'rgba(0,0,0,0.45)' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="card max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-medium text-gray-900 mb-2">Delete group</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete <strong>{group.name}</strong>?
                All messages and members will be removed. This cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-outline text-sm px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleting}
                  className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messagesLoading ? (
            <div className="text-center text-gray-400 text-sm py-8">
              Loading messages...
            </div>
          ) : messages?.length ? (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id
              const isActive = activeMsgId === msg.id
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
                    {msg.sender_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] md:max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <span className="text-xs text-gray-500 mb-1 px-1">
                        {msg.sender_name}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      {isMe && (
                        <button
                          onClick={() => setActiveMsgId(isActive ? null : msg.id)}
                          className="text-gray-300 hover:text-gray-500 text-xs p-1 flex-shrink-0"
                          title="Message options"
                        >
                          ⋮
                        </button>
                      )}
                      <div
                        onClick={() => isMe && setActiveMsgId(isActive ? null : msg.id)}
                        className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'cursor-pointer' : ''} ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-tr-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                    {isMe && isActive && (
                      <button
                        onClick={() => deleteMsg.mutate(msg.id)}
                        disabled={deleteMsg.isPending}
                        className="text-xs text-red-500 hover:text-red-700 mt-1 px-1"
                      >
                        {deleteMsg.isPending ? 'Deleting...' : 'Delete message'}
                      </button>
                    )}
                    <span className="text-xs text-gray-400 mt-1 px-1">
                      {getTimestamp(msg.sent_at)}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-500 text-sm">
                No messages yet — start the discussion!
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {isMember || isOwner ? (
          <div className="bg-white border-t border-gray-200 p-3 md:p-4">
            <form onSubmit={handleSend} className="flex gap-2 md:gap-3">
              <input
                className="input flex-1"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary px-4 md:px-6"
                disabled={!message.trim() || sendMessage.isPending}
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-center text-sm text-gray-500">
            Join this group to participate in the discussion
          </div>
        )}
      </div>

      {/* Members sidebar — hidden on mobile */}
      <aside className="hidden md:flex md:w-64 bg-white border-l border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 text-sm">
            Members ({memberCount})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center gap-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
              {group.owner_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {group.owner_name}
              </div>
              <div className="text-xs text-gray-400">Owner</div>
            </div>
            <span className="text-xs bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">
              Owner
            </span>
          </div>
          <div className="text-xs text-gray-400 px-2 mt-3 pt-3 border-t border-gray-100">
            {memberCount} total member{memberCount !== 1 ? 's' : ''}
          </div>
        </div>
        {group.description && (
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 mb-2">About</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {group.description}
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}