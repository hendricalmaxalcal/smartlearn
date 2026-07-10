import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { updateDoc, doc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import toast from 'react-hot-toast'

const STREAMS = ['science', 'arts', 'business']
const FORMS = ['form1','form2','form3','form4','form5','form6']

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    stream: user?.stream || 'science',
    form_level: user?.form_level || 'form1',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile(auth.currentUser, { displayName: profileForm.full_name })
      await updateDoc(doc(db, 'users', user.id), {
        full_name: profileForm.full_name,
        stream: profileForm.stream,
        form_level: profileForm.form_level,
      })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSavingPassword(true)
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordForm.current_password
      )
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, passwordForm.new_password)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Password updated!')
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect')
      } else {
        toast.error('Failed to update password')
      }
    } finally {
      setSavingPassword(false)
    }
  }

  const isStudent = user?.role?.toLowerCase() === 'student'

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
          Profile & Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Update your personal information and password
        </p>
      </div>

      {/* Avatar */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-2xl font-medium flex-shrink-0">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{user?.full_name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
            <div className="text-xs text-gray-400 mt-0.5 capitalize">
              {user?.role} · {user?.stream} · {user?.form_level?.replace('form', 'Form ')}
            </div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card mb-6">
        <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
          Personal information
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full name
            </label>
            <input
              className="input"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              required
            />
          </div>

          {isStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stream
                </label>
                <select
                  className="input"
                  value={profileForm.stream}
                  onChange={(e) => setProfileForm({ ...profileForm, stream: e.target.value })}
                >
                  {STREAMS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Form level
                </label>
                <select
                  className="input"
                  value={profileForm.form_level}
                  onChange={(e) => setProfileForm({ ...profileForm, form_level: e.target.value })}
                >
                  {FORMS.map((f) => (
                    <option key={f} value={f}>{f.replace('form', 'Form ')}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              className="input opacity-60 cursor-not-allowed"
              value={user?.email}
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="card">
        <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
          Change password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              className="input"
              placeholder="Enter current password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              className="input"
              placeholder="Minimum 8 characters"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm new password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              className="input"
              placeholder="Repeat new password"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
            />
            Show passwords
          </label>
          <button type="submit" className="btn-primary" disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
