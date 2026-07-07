// ============================================================================
// LMUI E-Timetable — Mock / Static Data
// All data is static placeholder data for the frontend prototype.
// ============================================================================

export const INSTITUTION = {
  name: 'Landmark Metropolitan University Institute',
  shortName: 'LMUI',
  location: 'Buea, Cameroon',
  tagline: 'The Pride of Africa',
}

export const DEPARTMENTS = [
  'Computer Graphics and Web Design',
  'Software Engineering',
  'Information Technology',
]

export const LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const TIME_SLOTS = [
  { id: 'ts1', label: '8 – 10 AM', start: '08:00', end: '10:00' },
  { id: 'ts2', label: '10 – 12 PM', start: '10:00', end: '12:00' },
  { id: 'ts3', label: '12 – 2 PM', start: '12:00', end: '14:00' },
  { id: 'ts4', label: '2 – 4 PM', start: '14:00', end: '16:00' },
  { id: 'ts5', label: '4 – 6 PM', start: '16:00', end: '18:00' },
]

// ---------------------------------------------------------------------------
// Semesters / Academic Terms
// ---------------------------------------------------------------------------
export const SEMESTERS = [
  {
    id: 'sem-2024-2025-s2',
    academicYear: '2024/2025',
    semester: 'Semester 2',
    label: '2024/2025 — Semester 2',
    status: 'Archived',
    startDate: '2025-02-03',
    endDate: '2025-06-20',
    dateGenerated: '2025-01-20',
  },
  {
    id: 'sem-2025-2026-s1',
    academicYear: '2025/2026',
    semester: 'Semester 1',
    label: '2025/2026 — Semester 1',
    status: 'Published',
    startDate: '2025-09-15',
    endDate: '2026-01-30',
    dateGenerated: '2025-09-01',
  },
  {
    id: 'sem-2025-2026-s2',
    academicYear: '2025/2026',
    semester: 'Semester 2',
    label: '2025/2026 — Semester 2',
    status: 'Draft',
    startDate: '2026-02-09',
    endDate: '2026-06-26',
    dateGenerated: '2026-05-28',
  },
]

// The currently active semester (default everywhere)
export const ACTIVE_SEMESTER_ID = 'sem-2025-2026-s1'

// ---------------------------------------------------------------------------
// Lecturers
// ---------------------------------------------------------------------------
export const LECTURERS = [
  {
    id: 'lec-1',
    name: 'Mr. Nzo Desmond',
    email: 'nzo.desmond@lmui.edu.cm',
    department: 'Computer Graphics and Web Design',
    staffId: 'LMUI/STF/0142',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    preferredSlots: ['Morning', 'Afternoon'],
    availability: 'Available',
  },
  {
    id: 'lec-2',
    name: 'Mr. Ndonwi Derrick',
    email: 'ndonwi.derrick@lmui.edu.cm',
    department: 'Software Engineering',
    staffId: 'LMUI/STF/0156',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    preferredSlots: ['Morning'],
    availability: 'Available',
  },
  {
    id: 'lec-3',
    name: 'Dr. Ayuk Brenda',
    email: 'ayuk.brenda@lmui.edu.cm',
    department: 'Information Technology',
    staffId: 'LMUI/STF/0171',
    availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    preferredSlots: ['Afternoon', 'Evening'],
    availability: 'Available',
  },
  {
    id: 'lec-4',
    name: 'Mrs. Tabi Gladys',
    email: 'tabi.gladys@lmui.edu.cm',
    department: 'Computer Graphics and Web Design',
    staffId: 'LMUI/STF/0188',
    availableDays: ['Monday', 'Tuesday', 'Friday'],
    preferredSlots: ['Morning', 'Afternoon'],
    availability: 'Unavailable',
  },
  {
    id: 'lec-5',
    name: 'Mr. Forba Emmanuel',
    email: 'forba.emmanuel@lmui.edu.cm',
    department: 'Software Engineering',
    staffId: 'LMUI/STF/0193',
    availableDays: ['Wednesday', 'Thursday', 'Saturday'],
    preferredSlots: ['Afternoon'],
    availability: 'Available',
  },
  {
    id: 'lec-6',
    name: 'Dr. Mengang Sylvie',
    email: 'mengang.sylvie@lmui.edu.cm',
    department: 'Information Technology',
    staffId: 'LMUI/STF/0205',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    preferredSlots: ['Morning', 'Afternoon', 'Evening'],
    availability: 'Available',
  },
]

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
export const COURSES = [
  { id: 'c-1', code: 'CGD101', title: 'Introduction to Web Design', department: 'Computer Graphics and Web Design', creditUnits: 3, level: 'Year 1', lecturerId: 'lec-1', preferredSlot: 'ts1' },
  { id: 'c-2', code: 'CGD201', title: 'Typography & Layout', department: 'Computer Graphics and Web Design', creditUnits: 3, level: 'Year 2', lecturerId: 'lec-4', preferredSlot: 'ts2' },
  { id: 'c-3', code: 'CGD301', title: 'Advanced UI/UX Design', department: 'Computer Graphics and Web Design', creditUnits: 4, level: 'Year 3', lecturerId: 'lec-1', preferredSlot: 'ts2' },
  { id: 'c-4', code: 'CGD401', title: 'Motion Graphics & Animation', department: 'Computer Graphics and Web Design', creditUnits: 4, level: 'Year 4', lecturerId: 'lec-4', preferredSlot: 'ts3' },
  { id: 'c-5', code: 'SWE101', title: 'Introduction to Programming', department: 'Software Engineering', creditUnits: 4, level: 'Year 1', lecturerId: 'lec-2', preferredSlot: 'ts1' },
  { id: 'c-6', code: 'SWE201', title: 'Data Structures & Algorithms', department: 'Software Engineering', creditUnits: 4, level: 'Year 2', lecturerId: 'lec-2', preferredSlot: 'ts1' },
  { id: 'c-7', code: 'SWE301', title: 'Database Management Systems', department: 'Software Engineering', creditUnits: 3, level: 'Year 3', lecturerId: 'lec-5', preferredSlot: 'ts4' },
  { id: 'c-8', code: 'SWE401', title: 'Artificial Intelligence', department: 'Software Engineering', creditUnits: 4, level: 'Year 4', lecturerId: 'lec-5', preferredSlot: 'ts4' },
  { id: 'c-9', code: 'ITC101', title: 'Computer Fundamentals', department: 'Information Technology', creditUnits: 3, level: 'Year 1', lecturerId: 'lec-3', preferredSlot: 'ts3' },
  { id: 'c-10', code: 'ITC201', title: 'Networking Essentials', department: 'Information Technology', creditUnits: 3, level: 'Year 2', lecturerId: 'lec-6', preferredSlot: 'ts2' },
  { id: 'c-11', code: 'ITC301', title: 'Cyber Security Foundations', department: 'Information Technology', creditUnits: 4, level: 'Year 3', lecturerId: 'lec-3', preferredSlot: 'ts4' },
  { id: 'c-12', code: 'ITC401', title: 'Cloud Computing', department: 'Information Technology', creditUnits: 4, level: 'Year 4', lecturerId: 'lec-6', preferredSlot: 'ts5' },
]

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------
export const STUDENTS = [
  { id: 's-1', name: 'Ntoh Endurance', matricule: 'LMUI/CGD/22/001', email: 'ntoh.e@lmui.edu.cm', department: 'Computer Graphics and Web Design', level: 'Year 3' },
  { id: 's-2', name: 'Bih Clarisse', matricule: 'LMUI/CGD/22/014', email: 'bih.c@lmui.edu.cm', department: 'Computer Graphics and Web Design', level: 'Year 3' },
  { id: 's-3', name: 'Tandap Wilfred', matricule: 'LMUI/SWE/23/008', email: 'tandap.w@lmui.edu.cm', department: 'Software Engineering', level: 'Year 2' },
  { id: 's-4', name: 'Ngwa Solange', matricule: 'LMUI/ITC/21/022', email: 'ngwa.s@lmui.edu.cm', department: 'Information Technology', level: 'Year 4' },
  { id: 's-5', name: 'Fon Emmanuel', matricule: 'LMUI/SWE/24/003', email: 'fon.e@lmui.edu.cm', department: 'Software Engineering', level: 'Year 1' },
  { id: 's-6', name: 'Mbah Precious', matricule: 'LMUI/CGD/24/019', email: 'mbah.p@lmui.edu.cm', department: 'Computer Graphics and Web Design', level: 'Year 1' },
  { id: 's-7', name: 'Atud Raymond', matricule: 'LMUI/ITC/23/011', email: 'atud.r@lmui.edu.cm', department: 'Information Technology', level: 'Year 2' },
  { id: 's-8', name: 'Eyong Christabel', matricule: 'LMUI/SWE/22/027', email: 'eyong.c@lmui.edu.cm', department: 'Software Engineering', level: 'Year 3' },
  { id: 's-9', name: 'Njoya Aminatou', matricule: 'LMUI/CGD/21/005', email: 'njoya.a@lmui.edu.cm', department: 'Computer Graphics and Web Design', level: 'Year 4' },
  { id: 's-10', name: 'Tameh Gilbert', matricule: 'LMUI/ITC/24/016', email: 'tameh.g@lmui.edu.cm', department: 'Information Technology', level: 'Year 1' },
  { id: 's-11', name: 'Asong Beltus', matricule: 'LMUI/SWE/21/031', email: 'asong.b@lmui.edu.cm', department: 'Software Engineering', level: 'Year 4' },
  { id: 's-12', name: 'Limen Pascaline', matricule: 'LMUI/CGD/23/009', email: 'limen.p@lmui.edu.cm', department: 'Computer Graphics and Web Design', level: 'Year 2' },
]

// ---------------------------------------------------------------------------
// Rooms / Halls
// ---------------------------------------------------------------------------
export const ROOMS = [
  { id: 'r-1', roomId: 'HALL-A', name: 'Mandela Hall', capacity: 120, building: 'Main Block' },
  { id: 'r-2', roomId: 'HALL-B', name: 'Nkrumah Hall', capacity: 80, building: 'Main Block' },
  { id: 'r-3', roomId: 'LAB-1', name: 'Graphics Lab 1', capacity: 40, building: 'Design Wing' },
  { id: 'r-4', roomId: 'LAB-2', name: 'Software Lab 2', capacity: 45, building: 'Tech Wing' },
  { id: 'r-5', roomId: 'RM-201', name: 'Lecture Room 201', capacity: 60, building: 'Annex' },
  { id: 'r-6', roomId: 'RM-305', name: 'Lecture Room 305', capacity: 50, building: 'Annex' },
]

// ---------------------------------------------------------------------------
// Timetable Slots  (keyed by semester)
// Each slot: { id, semesterId, courseId, lecturerId, roomId, day, timeSlotId, conflict }
// ---------------------------------------------------------------------------
export const TIMETABLE_SLOTS = [
  // --- 2025/2026 Semester 1 (Published) ---
  { id: 'sl-1', semesterId: 'sem-2025-2026-s1', courseId: 'c-1', lecturerId: 'lec-1', roomId: 'r-3', day: 'Monday', timeSlotId: 'ts1' },
  { id: 'sl-2', semesterId: 'sem-2025-2026-s1', courseId: 'c-3', lecturerId: 'lec-1', roomId: 'r-3', day: 'Tuesday', timeSlotId: 'ts2', conflict: 'Lecturer Mr. Nzo Desmond also assigned to CGD401 at this time.' },
  { id: 'sl-3', semesterId: 'sem-2025-2026-s1', courseId: 'c-4', lecturerId: 'lec-1', roomId: 'r-1', day: 'Tuesday', timeSlotId: 'ts2', conflict: 'Lecturer Mr. Nzo Desmond also assigned to CGD301 at this time.' },
  { id: 'sl-4', semesterId: 'sem-2025-2026-s1', courseId: 'c-2', lecturerId: 'lec-4', roomId: 'r-5', day: 'Wednesday', timeSlotId: 'ts2' },
  { id: 'sl-5', semesterId: 'sem-2025-2026-s1', courseId: 'c-5', lecturerId: 'lec-2', roomId: 'r-4', day: 'Monday', timeSlotId: 'ts1' },
  { id: 'sl-6', semesterId: 'sem-2025-2026-s1', courseId: 'c-6', lecturerId: 'lec-2', roomId: 'r-4', day: 'Wednesday', timeSlotId: 'ts1' },
  { id: 'sl-7', semesterId: 'sem-2025-2026-s1', courseId: 'c-7', lecturerId: 'lec-5', roomId: 'r-2', day: 'Thursday', timeSlotId: 'ts4' },
  { id: 'sl-8', semesterId: 'sem-2025-2026-s1', courseId: 'c-8', lecturerId: 'lec-5', roomId: 'r-2', day: 'Wednesday', timeSlotId: 'ts4' },
  { id: 'sl-9', semesterId: 'sem-2025-2026-s1', courseId: 'c-9', lecturerId: 'lec-3', roomId: 'r-6', day: 'Tuesday', timeSlotId: 'ts3' },
  { id: 'sl-10', semesterId: 'sem-2025-2026-s1', courseId: 'c-10', lecturerId: 'lec-6', roomId: 'r-5', day: 'Friday', timeSlotId: 'ts2' },
  { id: 'sl-11', semesterId: 'sem-2025-2026-s1', courseId: 'c-11', lecturerId: 'lec-3', roomId: 'r-6', day: 'Thursday', timeSlotId: 'ts4' },
  { id: 'sl-12', semesterId: 'sem-2025-2026-s1', courseId: 'c-12', lecturerId: 'lec-6', roomId: 'r-1', day: 'Friday', timeSlotId: 'ts5' },
  { id: 'sl-13', semesterId: 'sem-2025-2026-s1', courseId: 'c-6', lecturerId: 'lec-2', roomId: 'r-4', day: 'Friday', timeSlotId: 'ts1' },
  { id: 'sl-14', semesterId: 'sem-2025-2026-s1', courseId: 'c-3', lecturerId: 'lec-1', roomId: 'r-3', day: 'Thursday', timeSlotId: 'ts2' },

  // --- 2025/2026 Semester 2 (Draft) ---
  { id: 'sl-20', semesterId: 'sem-2025-2026-s2', courseId: 'c-2', lecturerId: 'lec-4', roomId: 'r-3', day: 'Monday', timeSlotId: 'ts2' },
  { id: 'sl-21', semesterId: 'sem-2025-2026-s2', courseId: 'c-6', lecturerId: 'lec-2', roomId: 'r-4', day: 'Tuesday', timeSlotId: 'ts1' },
  { id: 'sl-22', semesterId: 'sem-2025-2026-s2', courseId: 'c-10', lecturerId: 'lec-6', roomId: 'r-5', day: 'Wednesday', timeSlotId: 'ts2' },
  { id: 'sl-23', semesterId: 'sem-2025-2026-s2', courseId: 'c-7', lecturerId: 'lec-5', roomId: 'r-2', day: 'Thursday', timeSlotId: 'ts4' },

  // --- 2024/2025 Semester 2 (Archived) ---
  { id: 'sl-30', semesterId: 'sem-2024-2025-s2', courseId: 'c-1', lecturerId: 'lec-1', roomId: 'r-3', day: 'Monday', timeSlotId: 'ts1' },
  { id: 'sl-31', semesterId: 'sem-2024-2025-s2', courseId: 'c-5', lecturerId: 'lec-2', roomId: 'r-4', day: 'Tuesday', timeSlotId: 'ts1' },
  { id: 'sl-32', semesterId: 'sem-2024-2025-s2', courseId: 'c-9', lecturerId: 'lec-3', roomId: 'r-6', day: 'Wednesday', timeSlotId: 'ts3' },
]

// ---------------------------------------------------------------------------
// Modification History  (keyed by semester)
// ---------------------------------------------------------------------------
export const MODIFICATION_LOGS = [
  { id: 'm-1', semesterId: 'sem-2025-2026-s1', action: 'Admin moved CGD301 from Mon 8 AM to Tue 10 AM', by: 'Admin', timestamp: '2026-06-01T09:24:00' },
  { id: 'm-2', semesterId: 'sem-2025-2026-s1', action: 'Admin reassigned Software Lab 2 to SWE201 (Wed 8 AM)', by: 'Admin', timestamp: '2026-05-29T14:10:00' },
  { id: 'm-3', semesterId: 'sem-2025-2026-s1', action: 'Timetable for 2025/2026 Semester 1 published', by: 'Admin', timestamp: '2025-09-02T08:00:00' },
  { id: 'm-4', semesterId: 'sem-2025-2026-s2', action: 'Timetable for 2025/2026 Semester 2 generated (Draft)', by: 'Admin', timestamp: '2026-05-28T11:45:00' },
  { id: 'm-5', semesterId: 'sem-2024-2025-s2', action: 'Timetable archived at end of semester', by: 'System', timestamp: '2025-06-21T00:00:00' },
]

// ---------------------------------------------------------------------------
// Recent Activity Feed (dashboard)
// ---------------------------------------------------------------------------
export const ACTIVITY_FEED = [
  { id: 'a-1', text: 'Slot CGD301 moved to Tuesday 10 AM by Admin', type: 'edit', timestamp: '2026-06-01T09:24:00' },
  { id: 'a-2', text: 'Timetable for 2025/2026 Semester 1 published', type: 'publish', timestamp: '2025-09-02T08:00:00' },
  { id: 'a-3', text: 'Lecturer Dr. Mengang Sylvie added', type: 'add', timestamp: '2025-08-28T15:30:00' },
  { id: 'a-4', text: 'Timetable for 2025/2026 Semester 2 generated (Draft)', type: 'generate', timestamp: '2026-05-28T11:45:00' },
  { id: 'a-5', text: 'Room Graphics Lab 1 capacity updated to 40', type: 'edit', timestamp: '2025-08-20T10:05:00' },
]

// ---------------------------------------------------------------------------
// Notifications  (per role — surfaced via the topbar bell)
// type drives the icon/colour: publish | edit | reminder | info | add
// ---------------------------------------------------------------------------
export const NOTIFICATIONS = {
  admin: [
    { id: 'na-1', title: 'Draft awaiting review', body: '2025/2026 — Semester 2 timetable is still a Draft and not yet published.', type: 'reminder', timestamp: '2026-05-28T11:46:00', read: false },
    { id: 'na-2', title: 'Conflict detected', body: 'CGD301 and CGD401 share Mr. Nzo Desmond on Tuesday 10–12 PM.', type: 'edit', timestamp: '2026-05-30T09:10:00', read: false },
    { id: 'na-3', title: 'Lecturer added', body: 'Dr. Mengang Sylvie was added to Information Technology.', type: 'add', timestamp: '2025-08-28T15:30:00', read: false },
    { id: 'na-4', title: 'Timetable published', body: '2025/2026 — Semester 1 is now live for lecturers and students.', type: 'publish', timestamp: '2025-09-02T08:00:00', read: true },
  ],
  lecturer: [
    { id: 'nl-1', title: 'Schedule updated', body: 'Your CGD301 class moved to Tuesday 10 AM (Graphics Lab 1).', type: 'edit', timestamp: '2026-06-01T09:24:00', read: false },
    { id: 'nl-2', title: 'Timetable published', body: 'The 2025/2026 — Semester 1 timetable has been published.', type: 'publish', timestamp: '2025-09-02T08:05:00', read: false },
    { id: 'nl-3', title: 'Availability reminder', body: 'Confirm your availability before Semester 2 generation begins.', type: 'reminder', timestamp: '2026-05-26T10:00:00', read: true },
  ],
  student: [
    { id: 'ns-1', title: 'Timetable updated', body: 'A class in your schedule was moved. Check My Timetable for details.', type: 'edit', timestamp: '2026-06-01T09:25:00', read: false },
    { id: 'ns-2', title: 'Timetable published', body: 'Your 2025/2026 — Semester 1 timetable is now available.', type: 'publish', timestamp: '2025-09-02T08:05:00', read: false },
    { id: 'ns-3', title: 'Welcome to LMUI E-Timetable', body: 'View your weekly classes and course details anytime.', type: 'info', timestamp: '2025-09-01T07:30:00', read: true },
  ],
}

// ---------------------------------------------------------------------------
// Demo login accounts (for role-based auth)
// ---------------------------------------------------------------------------
export const DEMO_ACCOUNTS = {
  admin: { id: 'admin-1', name: 'System Administrator', email: 'admin@lmui.edu.cm', role: 'admin' },
  lecturer: { ...LECTURERS[0], role: 'lecturer' },
  student: { ...STUDENTS[0], role: 'student' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const getCourse = (id) => COURSES.find((c) => c.id === id)
export const getLecturer = (id) => LECTURERS.find((l) => l.id === id)
export const getRoom = (id) => ROOMS.find((r) => r.id === id)
export const getSemester = (id) => SEMESTERS.find((s) => s.id === id)
export const getTimeSlot = (id) => TIME_SLOTS.find((t) => t.id === id)

export const slotsForSemester = (semesterId) =>
  TIMETABLE_SLOTS.filter((s) => s.semesterId === semesterId)

export const logsForSemester = (semesterId) =>
  MODIFICATION_LOGS.filter((m) => m.semesterId === semesterId).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
