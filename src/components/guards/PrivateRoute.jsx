import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export const PrivateRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth)

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading...
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export const AdminRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth)

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!['admin', 'teacher'].includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}

export const TeacherRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth)

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!['admin', 'teacher'].includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}