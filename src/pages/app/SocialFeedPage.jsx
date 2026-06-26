import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import {
  getPosts,
  createPost as fbCreatePost,
  likePost as fbLikePost,
  addComment as fbAddComment,
  getComments,
} from '../../services/firestore'

export default function SocialFeedPage() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    retry: false,
  })

  const createPost = useMutation({
    mutationFn: ({ content }) =>
      fbCreatePost(user.id, user.full_name, user.stream, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
      setContent('')
      toast.success('Post shared!')
    },
    onError: () => toast.error('Failed to post'),
  })

  const likePost = useMutation({
    mutationFn: (postId) => fbLikePost(postId, user.id),
    onSuccess: () => queryClient.invalidateQueries(['posts']),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    createPost.mutate({ content })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900">Social feed</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share thoughts and connect with fellow students
        </p>
      </div>

      {/* Create post */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm flex-shrink-0">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              className="input resize-none mb-3"
              rows={3}
              placeholder="Share something with your classmates..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {content.length}/500 characters
              </span>
              <button
                type="submit"
                className="btn-primary text-sm px-6"
                disabled={!content.trim() || createPost.isPending}
              >
                {createPost.isPending ? 'Posting...' : 'Share post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : posts?.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onLike={() => likePost.mutate(post.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500 text-sm">
            Be the first to share something with your classmates!
          </p>
        </div>
      )}
    </div>
  )
}

function PostCard({ post, currentUser, onLike }) {
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const { data: comments } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => getComments(post.id),
    enabled: showComments,
  })

  const addComment = useMutation({
    mutationFn: ({ content }) =>
      fbAddComment(post.id, currentUser.id, currentUser.full_name, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', post.id])
      queryClient.invalidateQueries(['posts'])
      setComment('')
      toast.success('Comment added!')
    },
    onError: () => toast.error('Failed to add comment'),
  })

  const getTimestamp = (createdAt) => {
    if (!createdAt) return ''
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const isLikedByMe = post.liked_by?.includes(currentUser?.id)

  return (
    <div className="card">

      {/* Post header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm flex-shrink-0">
          {post.author_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm">
            {post.author_name}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>{getTimestamp(post.created_at)}</span>
            {post.author_stream && (
              <span className={`badge-${post.author_stream}`}>
                {post.author_stream}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Post content */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLikedByMe
              ? 'text-red-500'
              : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <span>{isLikedByMe ? '❤️' : '🤍'}</span>
          <span>{post.likes_count || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-600 transition-colors"
        >
          <span>💬</span>
          <span>{post.comments_count || 0} comments</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">

          {/* Comments list */}
          {comments?.length ? (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium flex-shrink-0">
                  {c.author_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-xs font-medium text-gray-700 mb-0.5">
                    {c.author_name}
                  </div>
                  <div className="text-xs text-gray-600">{c.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {getTimestamp(c.created_at)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 mb-3">
              No comments yet — be the first!
            </p>
          )}

          {/* Add comment */}
          <div className="flex gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
              {currentUser?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                className="input text-sm py-1.5 flex-1"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && comment.trim()) {
                    addComment.mutate({ content: comment })
                  }
                }}
              />
              <button
                onClick={() =>
                  comment.trim() && addComment.mutate({ content: comment })
                }
                disabled={!comment.trim() || addComment.isPending}
                className="btn-primary text-xs px-3"
              >
                {addComment.isPending ? '...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}