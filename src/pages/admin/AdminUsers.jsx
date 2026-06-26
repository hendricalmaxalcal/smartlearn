import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getAdminUsers, updateUserRole, deleteUserDoc } from '../../services/firestore'

const ROLES = ['all', 'student', 'teacher', 'admin']

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [filterRole, setFilterRole] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsers('all'),
    retry: false,
  })

  const changeRole = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('Role updated!')
    },
    onError: () => toast.error('Failed to update role'),
  })

  const deleteUser = useMutation({
    mutationFn: (userId) => deleteUserDoc(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      setConfirmDelete(null)
      toast.success('User deleted')
    },
    onError: () => toast.error('Failed to delete user'),
  })

  const filtered = (users || []).filter((u) => {
    const matchesRole = filterRole === 'all'
      ? true
      : u.role?.toLowerCase() === filterRole.toLowerCase()
    const matchesSearch = search
      ? u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      : true
    return matchesRole && matchesSearch
  })

  const getRoleColor = (role) => {
    const r = role?.toLowerCase()
    if (r === 'admin')   return 'bg-red-50 text-red-700'
    if (r === 'teacher') return 'bg-blue-50 text-blue-700'
    return 'bg-green-50 text-green-700'
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium">User management</h2>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} users found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          className="input w-64 text-sm"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filterRole === r
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="card animate-pulse">
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ) : filtered.length ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Stream</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Form</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium flex-shrink-0">
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {u.full_name}
                        </div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.stream ? (
                      <span className={`badge-${u.stream?.toLowerCase()}`}>
                        {u.stream}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.form_level
                      ? u.form_level.replace('form', 'Form ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role?.toLowerCase() || 'student'}
                      onChange={(e) =>
                        changeRole.mutate({ userId: u.id, role: e.target.value })
                      }
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${getRoleColor(u.role)}`}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirmDelete(u)}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-gray-500 text-sm">
            {filterRole === 'all'
              ? 'No users found'
              : `No ${filterRole}s found`}
          </p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{ minHeight: '200px', background: 'rgba(0,0,0,0.45)' }}
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="card max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-medium text-gray-900 mb-2">Delete user</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete{' '}
              <strong>{confirmDelete.full_name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-outline text-sm px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser.mutate(confirmDelete.id)}
                disabled={deleteUser.isPending}
                className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {deleteUser.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}