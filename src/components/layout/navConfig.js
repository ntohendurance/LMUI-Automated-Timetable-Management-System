import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  Building,
  CalendarCog,
  Settings,
  CalendarDays,
  Library,
  Clock,
  UserCircle,
  Sparkles,
  Table2,
  History,
} from 'lucide-react'

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/lecturers', label: 'Lecturers', icon: Users },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/rooms', label: 'Rooms / Halls', icon: Building2 },
  { to: '/admin/buildings', label: 'Buildings', icon: Building },
  {
    label: 'Timetable Management',
    icon: CalendarCog,
    children: [
      { to: '/admin/timetable/generate', label: 'Generate Timetable', icon: Sparkles },
      { to: '/admin/timetable/view', label: 'View / Edit Timetable', icon: Table2 },
      { to: '/admin/timetable/history', label: 'Semester History', icon: History },
    ],
  },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export const LECTURER_NAV = [
  { to: '/lecturer', label: 'My Dashboard', icon: LayoutDashboard, end: true },
  { to: '/lecturer/schedule', label: 'My Schedule', icon: CalendarDays },
  { to: '/lecturer/courses', label: 'My Courses', icon: Library },
  { to: '/lecturer/availability', label: 'Availability', icon: Clock },
  { to: '/lecturer/profile', label: 'Profile', icon: UserCircle },
]

export const STUDENT_NAV = [
  { to: '/student', label: 'My Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/timetable', label: 'My Timetable', icon: CalendarDays },
  { to: '/student/courses', label: 'Courses', icon: Library },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
]
