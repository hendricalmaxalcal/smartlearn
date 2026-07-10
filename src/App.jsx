import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { PrivateRoute, AdminRoute, AdminOnlyRoute, TeacherRoute } from './components/guards/PrivateRoute'
import InstallPWA from './components/common/InstallPWA'

import PublicLayout   from './components/layout/PublicLayout'
import AppLayout      from './components/layout/AppLayout'
import AdminLayout    from './components/layout/AdminLayout'

import HomePage            from './pages/public/HomePage'
import LoginPage           from './pages/public/LoginPage'
import RegisterPage        from './pages/public/RegisterPage'
import PricingPage         from './pages/public/PricingPage'
import CourseCatalogPage   from './pages/public/CourseCatalogPage'
import AboutPage           from './pages/public/AboutPage'
import VerifyEmailPage     from './pages/public/VerifyEmailPage'
import VerifyEmailSentPage from './pages/public/VerifyEmailSentPage'
import ForgotPasswordPage  from './pages/public/ForgotPasswordPage'

import DashboardPage     from './pages/app/DashboardPage'
import MyCoursesPage     from './pages/app/MyCoursesPage'
import CourseViewerPage  from './pages/app/CourseViewerPage'
import SocialFeedPage    from './pages/app/SocialFeedPage'
import StudyGroupsPage   from './pages/app/StudyGroupsPage'
import GroupDetailPage   from './pages/app/GroupDetailPage'
import MessagingPage     from './pages/app/MessagingPage'
import EventsPage        from './pages/app/EventsPage'
import AnnouncementsPage from './pages/app/AnnouncementsPage'
import ProfilePage       from './pages/app/ProfilePage'

import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminUsers         from './pages/admin/AdminUsers'
import AdminCourses       from './pages/admin/AdminCourses'
import AdminUpload        from './pages/admin/AdminUpload'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminEvents        from './pages/admin/AdminEvents'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <InstallPWA />

      <Routes>

        {/* Public pages */}
        <Route element={<PublicLayout />}>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/register"            element={<RegisterPage />} />
          <Route path="/pricing"             element={<PricingPage />} />
          <Route path="/courses"             element={<CourseCatalogPage />} />
          <Route path="/about"               element={<AboutPage />} />
          <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/verify-email-sent"   element={<VerifyEmailSentPage />} />
        </Route>

        {/* Student app */}
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="my-courses"    element={<MyCoursesPage />} />
          <Route path="courses/:slug" element={<CourseViewerPage />} />
          <Route path="feed"          element={<SocialFeedPage />} />
          <Route path="groups"        element={<StudyGroupsPage />} />
          <Route path="groups/:id"    element={<GroupDetailPage />} />
          <Route path="messages"      element={<MessagingPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="profile"       element={<ProfilePage />} />
          <Route path="events"        element={<TeacherRoute><EventsPage /></TeacherRoute>} />
        </Route>

        {/* Admin panel */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="courses"       element={<AdminCourses />} />
          <Route path="upload"        element={<AdminUpload />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="events"        element={<AdminEvents />} />
          <Route path="users"         element={<AdminOnlyRoute><AdminUsers /></AdminOnlyRoute>} />
          <Route path="subscriptions" element={<AdminOnlyRoute><AdminSubscriptions /></AdminOnlyRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
