import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleLayout from './components/layout/RoleLayout.jsx'
import { ADMIN_NAV, LECTURER_NAV, STUDENT_NAV } from './components/layout/navConfig.js'
import { useAuth } from './hooks/useAuth.js'

// Auth
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'

// Admin
import AdminDashboard from './pages/admin/Dashboard.jsx'
import Courses from './pages/admin/Courses.jsx'
import Lecturers from './pages/admin/Lecturers.jsx'
import Students from './pages/admin/Students.jsx'
import Rooms from './pages/admin/Rooms.jsx'
import Buildings from './pages/admin/Buildings.jsx'
import GenerateTimetable from './pages/admin/GenerateTimetable.jsx'
import ViewEditTimetable from './pages/admin/ViewEditTimetable.jsx'
import SemesterHistory from './pages/admin/SemesterHistory.jsx'
import Settings from './pages/admin/Settings.jsx'

// Lecturer
import LecturerDashboard from './pages/lecturer/LecturerDashboard.jsx'
import MySchedule from './pages/lecturer/MySchedule.jsx'
import MyCourses from './pages/lecturer/MyCourses.jsx'
import Availability from './pages/lecturer/Availability.jsx'
import LecturerProfile from './pages/lecturer/Profile.jsx'

// Student
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import MyTimetable from './pages/student/MyTimetable.jsx'
import StudentCourses from './pages/student/Courses.jsx'
import StudentProfile from './pages/student/Profile.jsx'

function RootRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ADMIN */}
      <Route
        element={
          <ProtectedRoute role="admin">
            <RoleLayout nav={ADMIN_NAV} roleLabel="Admin" />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<Courses />} />
        <Route path="/admin/lecturers" element={<Lecturers />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/rooms" element={<Rooms />} />
        <Route path="/admin/buildings" element={<Buildings />} />
        <Route path="/admin/timetable/generate" element={<GenerateTimetable />} />
        <Route path="/admin/timetable/view" element={<ViewEditTimetable />} />
        <Route path="/admin/timetable/history" element={<SemesterHistory />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* LECTURER */}
      <Route
        element={
          <ProtectedRoute role="lecturer">
            <RoleLayout nav={LECTURER_NAV} roleLabel="Lecturer" />
          </ProtectedRoute>
        }
      >
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/lecturer/schedule" element={<MySchedule />} />
        <Route path="/lecturer/courses" element={<MyCourses />} />
        <Route path="/lecturer/availability" element={<Availability />} />
        <Route path="/lecturer/profile" element={<LecturerProfile />} />
      </Route>

      {/* STUDENT */}
      <Route
        element={
          <ProtectedRoute role="student">
            <RoleLayout nav={STUDENT_NAV} roleLabel="Student" />
          </ProtectedRoute>
        }
      >
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/timetable" element={<MyTimetable />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
