import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getGroups,
  createGroup as fbCreateGroup,
  joinGroup as fbJoinGroup,
  leaveGroup as fbLeaveGroup,
} from '../../services/firestore'

export default function StudyGroupsPage() {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('discover')
  const [form, setForm] = useState({
    name: '',
    description: '',
    form_level: user?.form_level || 'form1',
    stream: user?.stream || 'science',
    is_private: false,
  })

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', activeTab],
    queryFn: () => getGroups(activeTab, user.id),
    retry: false,
  })

  const createGroup = useMutation({
    mutationFn: (data) => fbCreateGroup(user.id, user.full_name, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['groups'])
      setShowCreate(false)
      setForm({ name: '', description: '', form_level: 'form1', stream: 'science', is_private: false })
      toast.success('Study group created!')
    },
    onError: () => toast.error('Failed to create group'),
  })

  const joinGroup = useMutation({
    mutationFn: (groupId) => fbJoinGroup(groupId, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['groups'])
      toast.success('Joined group!')
    },
    onError: () => toast.error('Failed to join group'),
  })

  const leaveGroup = useMutation({
    mutationFn: (groupId) => fbLeaveGroup(groupId, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['groups'])
      toast.success('Left group')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    createGroup.mutate(form)
  }

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Study groups</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join or create groups to study together
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary text-sm"
        >
          {showCreate ? 'Cancel' : '+ Create group'}
        </button>
      </div>

      {/* Create group form */}
      {showCreate && (
        <div className="card mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Create a new study group
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Biology Form 4 Study Group"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form level
                </label>
                <select
                  className="input"
                  value={form.form_level}
                  onChange={(e) => setForm({ ...form, form_level: e.target.value })}
                >
                  {['form1','form2','form3','form4','form5','form6'].map((f) => (
                    <option key={f} value={f}>
                      {f.replace('form', 'Form ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  className="input"
                  placeholder="What will you study?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={form.is_private}
                onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
              />
              <label htmlFor="private" className="text-sm text-gray-700">
                Make this group private (invite only)
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={createGroup.isPending}
            >
              {createGroup.isPending ? 'Creating...' : 'Create group'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'discover', label: 'Discover' },
          { key: 'my-groups', label: 'My groups' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Groups grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : groups?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              currentUserId={user?.id}
              onJoin={() => joinGroup.mutate(group.id)}
              onLeave={() => leaveGroup.mutate(group.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'my-groups' ? 'No groups yet' : 'No groups found'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {activeTab === 'my-groups'
              ? 'Join or create a study group to get started'
              : 'Be the first to create a study group'}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary"
          >
            Create a group
          </button>
        </div>
      )}
    </div>
  )
}

function GroupCard({ group, currentUserId, onJoin, onLeave }) {
  const navigate = useNavigate()
  const isMember = group.member_ids?.includes(currentUserId)
  const isOwner = group.owner_id === currentUserId
  const memberCount = group.member_ids?.length || 0

  const streamColor = {
    science:  'badge-science',
    arts:     'badge-arts',
    business: 'badge-business',
  }[group.stream] || ''

  return (
    <div className="card hover:border-primary-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">
          👥
        </div>
        {group.is_private && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Private
          </span>
        )}
      </div>

      <h3 className="font-medium text-gray-900 text-sm mb-1 leading-snug">
        {group.name}
      </h3>
      {group.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
          {group.description}
        </p>
      )}

      <div className="flex gap-1 mb-3">
        {group.stream && (
          <span className={streamColor}>{group.stream}</span>
        )}
        {group.form_level && (
          <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full">
            {group.form_level.replace('form', 'Form ')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          {(isMember || isOwner) && (
            <button
              onClick={() => navigate(`/app/groups/${group.id}`)}
              className="text-xs btn-primary px-3 py-1"
            >
              View
            </button>
          )}
          {isOwner ? (
            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-lg font-medium">
              Owner
            </span>
          ) : isMember ? (
            <button
              onClick={onLeave}
              className="text-xs border border-gray-200 text-gray-600 px-3 py-1 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              Leave
            </button>
          ) : (
            <button
              onClick={onJoin}
              className="text-xs btn-primary px-3 py-1"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  )
}