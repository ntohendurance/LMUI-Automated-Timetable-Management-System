const express = require('express')
const cors = require('cors')

const { authLimiter } = require('./middleware/rateLimiter')
const errorHandler = require('./middleware/errorHandler')
const { error } = require('./utils/response')

// Route modules
const authRoutes = require('./modules/auth/auth.routes')
const userRoutes = require('./modules/users/users.routes')
const departmentRoutes = require('./modules/departments/departments.routes')
const courseRoutes = require('./modules/courses/courses.routes')
const lecturerRoutes = require('./modules/lecturers/lecturers.routes')
const studentRoutes = require('./modules/students/students.routes')
const roomRoutes = require('./modules/rooms/rooms.routes')
const buildingRoutes = require('./modules/buildings/buildings.routes')
const semesterRoutes = require('./modules/semesters/semesters.routes')
const timetableRoutes = require('./modules/timetable/timetable.routes')
const modificationRoutes = require('./modules/modifications/modifications.routes')

const app = express()

// ---- CORS ----
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// ---- Body parsing ----
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ---- Health check ----
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'LMUI E-Timetable API is running', data: { uptime: process.uptime() } })
)

// ---- Routes ----
// Note: the limiter is applied per-route inside auth.routes (login/register/
// change-password) so that GET /auth/me — called on every app load — is not
// throttled and never logs users out on refresh.
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lecturers', lecturerRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/buildings', buildingRoutes)
app.use('/api/semesters', semesterRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/modifications', modificationRoutes)

// ---- 404 ----
app.use((req, res) => error(res, { status: 404, message: `Route not found: ${req.method} ${req.originalUrl}` }))

// ---- Global error handler ----
app.use(errorHandler)

module.exports = app
