# LMUI E-Timetable — Backend API

Express + Prisma + PostgreSQL REST API for the AI-Powered Automated E-Timetable
System. Pairs with the React frontend (default origin `http://localhost:5173`).

## Prerequisites
- Node.js 18+
- A running PostgreSQL instance

## Setup

```bash
cd server
npm install

# 1. Configure the database connection in .env (DATABASE_URL)
# 2. Create tables
npm run db:migrate      # or: npm run db:push
# 3. Seed realistic LMUI data
npm run db:seed
# 4. Start the API (http://localhost:5000)
npm run dev
```

## Seed login accounts

| Role     | Email                     | Password     |
| -------- | ------------------------- | ------------ |
| Admin    | admin@lmui.edu            | admin123     |
| Lecturer | nzo.desmond@lmui.edu      | lecturer123  |
| Lecturer | ndonwi.derrick@lmui.edu   | lecturer123  |
| Lecturer | mbah.jr@lmui.edu          | lecturer123  |
| Student  | endurance.ntoh@lmui.edu   | student123   |
| Student  | boris.nkeng@lmui.edu      | student123   |
| Student  | grace.ambe@lmui.edu       | student123   |
| Student  | fatima.bello@lmui.edu     | student123   |

## API surface (all under `/api`, JWT-protected unless noted)

| Resource       | Base path            | Notes                                         |
| -------------- | -------------------- | --------------------------------------------- |
| Auth           | `/api/auth`          | `login` (public, rate-limited), `register` (admin), `me`, `change-password` |
| Users          | `/api/users`         | Admin only                                    |
| Departments    | `/api/departments`   | Read: all roles · Write: admin                |
| Courses        | `/api/courses`       | `?department=&level=&search=&page=&limit=`    |
| Lecturers      | `/api/lecturers`     | Admin + self                                  |
| Students       | `/api/students`      | Admin + self                                  |
| Rooms          | `/api/rooms`         | Read: all roles · Write: admin                |
| Buildings      | `/api/buildings`     | Read: all roles · Write: admin                |
| Semesters      | `/api/semesters`     | `active`, `:id/publish`, `:id/archive`        |
| Timetable      | `/api/timetable`     | `generate`, `semester/:id` (role-filtered), slot CRUD |
| Modifications  | `/api/modifications` | Admin only — `semester/:id`, `slot/:id`       |

Health check: `GET /api/health` (public).

## Response envelope

```jsonc
// success
{ "success": true, "message": "...", "data": {}, "pagination": { "page": 1, "limit": 10, "total": 45 } }
// error
{ "success": false, "message": "...", "errors": [ ... ] }
```

## Scheduling

`src/modules/timetable/timetable.generator.js` implements a constraint-based
greedy scheduler. Hard constraints (lecturer/room/student-group clashes, lecturer
availability, room capacity) are never violated; soft constraints (avoid
back-to-back, balance workload, respect capacity, group by level+dept) steer a
scoring function. Conflict detection runs after generation and after every slot
edit, persisting `hasConflict` / `conflictReason`.

> Note: this folder sits under a path containing a space. The npm scripts call
> Prisma/node directly, which is unaffected, but if a tool ever fails to spawn an
> engine binary, run from a space-free path.
