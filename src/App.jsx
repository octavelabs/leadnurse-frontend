import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Employee pages
import DashboardPage from './pages/employee/DashboardPage';
import CourseListPage from './pages/employee/CourseListPage';
import CourseDetailPage from './pages/employee/CourseDetailPage';
import LessonViewerPage from './pages/employee/LessonViewerPage';
import AssessmentPage from './pages/employee/AssessmentPage';
import CertificatePage from './pages/employee/CertificatePage';
import MyCertificatesPage from './pages/employee/MyCertificatesPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CourseManagementPage from './pages/admin/CourseManagementPage';
import CreateEditCoursePage from './pages/admin/CreateEditCoursePage';
import LessonManagementPage from './pages/admin/LessonManagementPage';
import AssessmentManagementPage from './pages/admin/AssessmentManagementPage';

// Workforce — Admin
import WorkforceDashboard from './pages/admin/workforce/WorkforceDashboard';
import ShiftManagement from './pages/admin/workforce/ShiftManagement';
import ShiftApplications from './pages/admin/workforce/ShiftApplications';
import CreateEditShift from './pages/admin/workforce/CreateEditShift';
import WorkerRecords from './pages/admin/workforce/WorkerRecords';
import WorkerDetail from './pages/admin/workforce/WorkerDetail';
import AttendanceManagement from './pages/admin/workforce/AttendanceManagement';
import PayrollReports from './pages/admin/workforce/PayrollReports';
import ComplianceMonitor from './pages/admin/workforce/ComplianceMonitor';
import FacilityManagement from './pages/admin/workforce/FacilityManagement';
import ReferenceMonitor from './pages/admin/workforce/ReferenceMonitor';
import ReferencePage from './pages/ReferencePage';
import TimesheetSignoffPage from './pages/TimesheetSignoffPage';
import DocumentManagement from './pages/admin/workforce/DocumentManagement';
import MyDocuments from './pages/worker/MyDocuments';

// Workforce — Worker (Employee)
import ProfilePage from './pages/ProfilePage';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import MyShifts from './pages/worker/MyShifts';
import AvailableShifts from './pages/worker/AvailableShifts';
import MyAttendance from './pages/worker/MyAttendance';
import MyEarnings from './pages/worker/MyEarnings';
import MyCompliance from './pages/worker/MyCompliance';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/references/:token" element={<ReferencePage />} />
      <Route path="/timesheet-signoff/:token" element={<TimesheetSignoffPage />} />

      {/* Employee routes */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewerPage />} />
          <Route path="/courses/:courseId/assessment" element={<AssessmentPage />} />
          <Route path="/courses/:courseId/certificate" element={<CertificatePage />} />
          <Route path="/my-certificates" element={<MyCertificatesPage />} />
          {/* Workforce — Worker */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/workforce" element={<WorkerDashboard />} />
          <Route path="/available-shifts" element={<AvailableShifts />} />
          <Route path="/my-shifts" element={<MyShifts />} />
          <Route path="/my-attendance" element={<MyAttendance />} />
          <Route path="/my-earnings" element={<MyEarnings />} />
          <Route path="/my-compliance" element={<MyCompliance />} />
          <Route path="/my-documents" element={<MyDocuments />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/courses" element={<CourseManagementPage />} />
          <Route path="/admin/courses/new" element={<CreateEditCoursePage />} />
          <Route path="/admin/courses/:id/edit" element={<CreateEditCoursePage />} />
          <Route path="/admin/courses/:id/lessons" element={<LessonManagementPage />} />
          <Route path="/admin/courses/:id/assessment" element={<AssessmentManagementPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Workforce — Admin */}
          <Route path="/admin/workforce" element={<WorkforceDashboard />} />
          <Route path="/admin/workforce/shifts" element={<ShiftManagement />} />
          <Route path="/admin/workforce/applications" element={<ShiftApplications />} />
          <Route path="/admin/workforce/shifts/new" element={<CreateEditShift />} />
          <Route path="/admin/workforce/shifts/:id/edit" element={<CreateEditShift />} />
          <Route path="/admin/workforce/workers" element={<WorkerRecords />} />
          <Route path="/admin/workforce/workers/:id" element={<WorkerDetail />} />
          <Route path="/admin/workforce/attendance" element={<AttendanceManagement />} />
          <Route path="/admin/workforce/payroll" element={<PayrollReports />} />
          <Route path="/admin/workforce/compliance" element={<ComplianceMonitor />} />
          <Route path="/admin/workforce/facilities" element={<FacilityManagement />} />
          <Route path="/admin/workforce/references" element={<ReferenceMonitor />} />
          <Route path="/admin/workforce/documents" element={<DocumentManagement />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
