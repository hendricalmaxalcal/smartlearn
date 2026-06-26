import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import {
  getConversations,
  getMessages,
  sendMessage as fbSendMessage,
  createConversation,
  getUsers,
} from '../../services/firestore'

export default function MessagingPage() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [activeConv, setActiveConv] = useState(null)
  const [message, setMessage] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchUser, setSearchUser] = useState('')
  const bottomRef = useRef(null)

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => getConversations(user.id),
    enabled: !!user?.id,
    retry: false,
  })

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', activeConv?.id],
    queryFn: () => getMessages(activeConv.id),
    enabled: !!activeConv?.id,
    refetchInterval: 3000,
  })

  const { data: allUsers } = useQuery({
    queryKey: ['users-search', searchUser],
    queryFn: () => getUsers(searchUser),
    enabled: showNewChat && searchUser.length > 1,
    retry: false,
  })

  const sendMsg = useMutation({
    mutationFn: ({ content }) =>
      fbSendMessage(activeConv.id, user.id, user.full_name, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', activeConv?.id])
      queryClient.invalidateQueries(['conversations', user?.id])
      setMessage('')
    },
    onError: () => toast.error('Failed to send message'),
  })

  const startConversation = useMutation({
    mutationFn: (otherUser) =>
      createConversation(user.id, user.full_name, otherUser.id, otherUser.full_name),
    onSuccess: (conv) => {
      queryClient.invalidateQueries(['conversations', user?.id])
      setActiveConv(conv)
      setShowNewChat(false)
      setSearchUser('')
    },
    onError: () => toast.error('Failed to start conversation'),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim() || !activeConv) return
    sendMsg.mutate({ content: message })
  }

  const getTimestamp = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const getOtherParticipant = (conv) => {
    if (!conv?.participant_names) return 'Unknown'
    return Object.entries(conv.participant_names)
      .find(([id]) => id !== user?.id)?.[1] || 'Unknown'
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Conversations sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="font-medium text-gray-900">Messages</h1>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="text-xs btn-primary px-3 py-1.5"
          >
            + New chat
          </button>
        </div>

        {/* New chat search */}
        {showNewChat && (
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <input
              className="input text-sm"
              placeholder="Search students by name..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              autoFocus
            />
            {allUsers?.length > 0 && (
              <div className="mt-2 space-y-1">
                {allUsers
                  .filter((u) => u.id !== user?.id)
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => startConversation.mutate(u)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.full_name}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {u.stream} · {u.form_level?.replace('form', 'Form ')}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
            {searchUser.length > 1 && allUsers?.length === 0 && (
              <p className="text-xs text-gray-400 mt-2 px-1">No users found</p>
            )}
          </div>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations?.length ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 ${
                  activeConv?.id === conv.id
                    ? 'bg-primary-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-medium flex-shrink-0">
                  {getOtherParticipant(conv)?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {getOtherParticipant(conv)}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {conv.last_message || 'No messages yet'}
                  </div>
                </div>
                {conv.last_message_at && (
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {getTimestamp(conv.last_message_at)}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-12 px-4">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm text-gray-500 mb-3">No conversations yet</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="btn-primary text-xs px-4"
              >
                Start a conversation
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-medium">
                {getOtherParticipant(activeConv)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-medium text-gray-900">
                  {getOtherParticipant(activeConv)}
                </h2>
                <p className="text-xs text-gray-400">Direct message</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  Loading messages...
                </div>
              ) : messages?.length ? (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
                        {msg.sender_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className={`max-w-xs lg:max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-tr-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">
                          {getTimestamp(msg.sent_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">👋</div>
                  <p className="text-gray-500 text-sm">
                    Say hello to {getOtherParticipant(activeConv)}!
                  </p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  className="input flex-1"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-primary px-6"
                  disabled={!message.trim() || sendMsg.isPending}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Your messages
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Select a conversation or start a new one
              </p>
              <button
                onClick={() => setShowNewChat(true)}
                className="btn-primary px-6"
              >
                Start a conversation
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}