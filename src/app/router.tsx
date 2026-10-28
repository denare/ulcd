import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AdminGuard } from '@/components/admin/AdminGuard'

// Public pages — lazy loaded
const HomePage = React.lazy(() => import('@/pages/HomePage'))
const LecturersPage = React.lazy(() => import('@/pages/LecturersPage'))
const LecturerProfilePage = React.lazy(() => import('@/pages/LecturerProfilePage'))
const DepartmentsPage = React.lazy(() => import('@/pages/DepartmentsPage'))
const DepartmentPage = React.lazy(() => import('@/pages/DepartmentPage'))
const CoursePage = React.lazy(() => import('@/pages/CoursePage'))
const AboutPage = React.lazy(() => import('@/pages/AboutPage'))
const PrivacyPage = React.lazy(() => import('@/pages/PrivacyPage'))
const ReportPage = React.lazy(() => import('@/pages/ReportPage'))
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'))

// Admin pages
const LoginPage = React.lazy(() => import('@/pages/admin/LoginPage'))
const DashboardPage = React.lazy(() => import('@/pages/admin/DashboardPage'))
const LecturersListPage = React.lazy(() => import('@/pages/admin/LecturersListPage'))
const LecturerFormPage = React.lazy(() => import('@/pages/admin/LecturerFormPage'))
const DepartmentsAdminPage = React.lazy(() => import('@/pages/admin/DepartmentsAdminPage'))
const CoursesAdminPage = React.lazy(() => import('@/pages/admin/CoursesAdminPage'))
const ReportsAdminPage = React.lazy(() => import('@/pages/admin/ReportsAdminPage'))
const ImportPage = React.lazy(() => import('@/pages/admin/ImportPage'))

function PageLoader() {
  return (
    <div
      className="flex items-center justify-center min-h-[40vh]"
      role="status"
      aria-label="Loading page…"
    >
      <div
        className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"
        aria-hidden="true"
      />
    </div>
  )
}

function Suspense({ children }: { children: React.ReactNode }) {
  return <React.Suspense fallback={<PageLoader />}>{children}</React.Suspense>
}

// Admin section wrapper — guard + layout
function AdminWrapper() {
  return (
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  )
}

export const router = createBrowserRouter([
  // ── Public routes ───────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense><HomePage /></Suspense> },
      { path: 'lecturers', element: <Suspense><LecturersPage /></Suspense> },
      { path: 'lecturers/:id', element: <Suspense><LecturerProfilePage /></Suspense> },
      { path: 'departments', element: <Suspense><DepartmentsPage /></Suspense> },
      { path: 'departments/:id', element: <Suspense><DepartmentPage /></Suspense> },
      { path: 'courses/:id', element: <Suspense><CoursePage /></Suspense> },
      { path: 'about', element: <Suspense><AboutPage /></Suspense> },
      { path: 'privacy', element: <Suspense><PrivacyPage /></Suspense> },
      { path: 'report-information', element: <Suspense><ReportPage /></Suspense> },
      { path: '*', element: <Suspense><NotFoundPage /></Suspense> },
    ],
  },

  // ── Admin login (no guard, standalone page) ─────────────────
  {
    path: 'admin/login',
    element: <Suspense><LoginPage /></Suspense>,
  },

  // ── Protected admin routes ──────────────────────────────────
  {
    path: 'admin',
    element: <AdminWrapper />,
    children: [
      { index: true, element: <Suspense><DashboardPage /></Suspense> },
      { path: 'lecturers', element: <Suspense><LecturersListPage /></Suspense> },
      { path: 'lecturers/new', element: <Suspense><LecturerFormPage /></Suspense> },
      { path: 'lecturers/:id/edit', element: <Suspense><LecturerFormPage /></Suspense> },
      { path: 'departments', element: <Suspense><DepartmentsAdminPage /></Suspense> },
      { path: 'courses', element: <Suspense><CoursesAdminPage /></Suspense> },
      { path: 'reports', element: <Suspense><ReportsAdminPage /></Suspense> },
      { path: 'import', element: <Suspense><ImportPage /></Suspense> },
    ],
  },
])
