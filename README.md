# LMUI E-Timetable — Frontend

AI-Powered Automated E-Timetable System for **Landmark Metropolitan University Institute (LMUI), Buea**.
Final-year project frontend — React 18 + Vite + TailwindCSS + React Router v6.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into /dist
npm run preview  # preview the production build
```

> **Note on the project path.** This project folder sits under a path that contains a
> space (`BTECH DEFENSE`). On Windows, Node fails to spawn `esbuild.exe` from a spaced
> path (`spawn UNKNOWN`). The `npm` scripts run through `scripts/run-vite.mjs`, which
> transparently stages a copy of esbuild in a space-free folder (`~/.lmui-esbuild`) and
> sets `ESBUILD_BINARY_PATH` before Vite loads — so the standard commands above just work.

## Roles & demo login

The login screen has **Admin / Lecturer / Student** tabs. This is a mock build —
enter **any** email and password, pick a role, and you'll be routed to that role's portal.

| Role     | Lands on            | Can do                                                        |
| -------- | ------------------- | ------------------------------------------------------------ |
| Admin    | `/admin`            | Manage courses/lecturers/students/rooms, generate, edit, publish & archive timetables |
| Lecturer | `/lecturer`         | View published schedule, courses, set availability (read-only timetable) |
| Student  | `/student`          | View published timetable & courses (read-only)               |

## Core timetable model

- Timetables are generated **per semester** (Academic Year + Semester).
- Status lifecycle: **Draft → Published → Archived**.
- Lecturers & students only ever see **Published** (and archived) timetables.
- Only the **Admin** can modify a timetable; every change is written to a per-semester
  **modification history**.
- Sample data: `2024/2025 — Semester 2` (Archived), `2025/2026 — Semester 1` (Published,
  the active one), `2025/2026 — Semester 2` (Draft).

## Project structure

```
src/
  api/         Axios client + placeholder endpoints (backend not wired yet)
  components/
    layout/    Sidebar, Topbar, PageWrapper, RoleLayout, nav config
    ui/        Button, Modal, Table, StatCard, Badge, Pagination,
               SemesterSelector, ModificationDrawer, Field, etc.
    forms/     CourseForm, LecturerForm, StudentForm, RoomForm, EditSlotModal
    timetable/ TimetableGrid (shared weekly grid)
    ProfileView, ProtectedRoute
  context/     AuthContext, SemesterContext
  hooks/       useAuth, useSemester
  data/        mockData.js (semesters, timetables, logs, courses, lecturers, …)
  pages/       admin/ · lecturer/ · student/ · auth/
```

All data is static mock data — replace the `api/client.js` stubs with real calls to
the Express backend when it's ready.
```
