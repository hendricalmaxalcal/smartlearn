import { useSelector } from 'react-redux'
import StudentDashboard from './dashboard/StudentDashboard'
import TeacherDashboard from './dashboard/TeacherDashboard'

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth)

  if (user?.role === 'teacher') {
    return <TeacherDashboard />
  }

  return <StudentDashboard />
}