const bcrypt = require('bcryptjs')
const prisma = require('../../config/db')
const { signToken, verifyToken } = require('../../config/jwt')
const ApiError = require('../../utils/ApiError')

const SALT_ROUNDS = 12

// Public-safe user shape (never includes password).
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

function normalizeRole(role) {
  return String(role || '').toUpperCase()
}

async function login({ email, password, role }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw ApiError.unauthorized('Invalid credentials')

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw ApiError.unauthorized('Invalid credentials')

  // Role guard — the selected portal must match the account role.
  if (role && normalizeRole(role) !== user.role) {
    throw ApiError.unauthorized('Invalid credentials for the selected role')
  }

  // Lecturers awaiting admin approval cannot sign in yet.
  if (user.role === 'LECTURER') {
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId: user.id },
      select: { isApproved: true },
    })
    if (lecturer && lecturer.isApproved === false) {
      throw ApiError.forbidden(
        'Your lecturer account is awaiting admin approval. Please check back later.'
      )
    }
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email, name: user.name })

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

async function register(payload) {
  const role = normalizeRole(payload.role)
  if (!['ADMIN', 'LECTURER', 'STUDENT'].includes(role)) {
    throw ApiError.badRequest('Invalid role')
  }

  const existing = await prisma.user.findUnique({ where: { email: payload.email } })
  if (existing) throw ApiError.conflict('A user with this email already exists')

  const hashed = await bcrypt.hash(payload.password, SALT_ROUNDS)

  // Create the user + role-specific profile inside one transaction.
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: payload.name, email: payload.email, password: hashed, role },
      select: userSelect,
    })

    if (role === 'LECTURER') {
      if (!payload.departmentId || !payload.staffId) {
        throw ApiError.badRequest('Lecturer requires departmentId and staffId')
      }
      await tx.lecturer.create({
        data: {
          userId: created.id,
          staffId: payload.staffId,
          departmentId: payload.departmentId,
          availableDays: payload.availableDays || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
          preferredTimeSlots: payload.preferredTimeSlots || ['MORNING', 'AFTERNOON'],
        },
      })
    }

    if (role === 'STUDENT') {
      if (!payload.departmentId || !payload.matricule || !payload.level) {
        throw ApiError.badRequest('Student requires departmentId, matricule and level')
      }
      await tx.student.create({
        data: {
          userId: created.id,
          matricule: payload.matricule,
          departmentId: payload.departmentId,
          level: payload.level,
        },
      })
    }

    return created
  })

  return user
}

// ---------------------------------------------------------------------------
// Public self-service sign-up.
//
// Unlike `register` (admin-only), this is reachable without authentication so
// prospective students and lecturers can create their own accounts. Admins can
// NEVER be created this way — admin accounts stay provisioned internally.
// On success it returns a token so the new user is logged straight in.
// ---------------------------------------------------------------------------
async function signupPublic(payload) {
  const role = normalizeRole(payload.role)
  if (!['STUDENT', 'LECTURER'].includes(role)) {
    throw ApiError.badRequest('You can only sign up as a student or a lecturer')
  }

  const existing = await prisma.user.findUnique({ where: { email: payload.email } })
  if (existing) throw ApiError.conflict('A user with this email already exists')

  const hashed = await bcrypt.hash(payload.password, SALT_ROUNDS)

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: payload.name, email: payload.email, password: hashed, role },
      select: userSelect,
    })

    if (role === 'LECTURER') {
      if (!payload.departmentId) throw ApiError.badRequest('Please select your department')
      // Staff ID is institution-issued; auto-generate one if not supplied.
      const staffId = (payload.staffId && payload.staffId.trim()) || `LMUI/STF/${Date.now().toString().slice(-4)}`
      await tx.lecturer.create({
        data: {
          userId: created.id,
          staffId,
          departmentId: payload.departmentId,
          availableDays: payload.availableDays || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
          preferredTimeSlots: payload.preferredTimeSlots || ['MORNING', 'AFTERNOON'],
          // Self-registered lecturers must be approved by an admin before use.
          isApproved: false,
        },
      })
    }

    if (role === 'STUDENT') {
      if (!payload.departmentId || !payload.matricule || !payload.level) {
        throw ApiError.badRequest('Student sign-up requires department, matricule and level')
      }
      await tx.student.create({
        data: {
          userId: created.id,
          matricule: payload.matricule,
          departmentId: payload.departmentId,
          level: payload.level,
        },
      })
    }

    return created
  })

  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role }

  // Lecturers are not logged in immediately — they wait for admin approval.
  if (role === 'LECTURER') {
    return { pending: true, user: publicUser }
  }

  // Students are active right away, so issue a token to log them straight in.
  const token = signToken({ id: user.id, role: user.role, email: user.email, name: user.name })
  return { token, user: publicUser }
}

// Minimal, unauthenticated department list so the sign-up form can offer a
// department dropdown before the user has an account/token.
async function listPublicDepartments() {
  return prisma.department.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  })
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...userSelect,
      lecturer: {
        include: {
          department: true,
          courses: { select: { id: true, code: true, title: true, level: true } },
        },
      },
      student: { include: { department: true } },
    },
  })
  if (!user) throw ApiError.notFound('User not found')
  return user
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw ApiError.notFound('User not found')

  const ok = await bcrypt.compare(currentPassword, user.password)
  if (!ok) throw ApiError.badRequest('Current password is incorrect')

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  return { id: user.id }
}

// ---------------------------------------------------------------------------
// Password reset (two-step)
//
// In production, requestPasswordReset would EMAIL the reset link/token to the
// user. This build has no mail service, so the short-lived token is returned in
// the response for the client to complete the reset immediately.
// ---------------------------------------------------------------------------
async function requestPasswordReset({ email }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw ApiError.notFound('No account found with that email address')

  const resetToken = signToken({ id: user.id, purpose: 'password_reset' }, '15m')
  return { resetToken, name: user.name, email: user.email }
}

async function resetPassword({ token, newPassword }) {
  let decoded
  try {
    decoded = verifyToken(token)
  } catch {
    throw ApiError.badRequest('This reset link is invalid or has expired. Please start again.')
  }
  if (decoded.purpose !== 'password_reset') {
    throw ApiError.badRequest('Invalid reset token.')
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } })
  if (!user) throw ApiError.notFound('User not found')

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  return { id: user.id }
}

module.exports = {
  login,
  register,
  signupPublic,
  listPublicDepartments,
  getMe,
  changePassword,
  requestPasswordReset,
  resetPassword,
  userSelect,
}
