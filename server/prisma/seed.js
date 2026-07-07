// ============================================================================
// LMUI E-Timetable — database seed
// Run with: npm run db:seed  (after db:migrate / db:push)
// ============================================================================
require('dotenv').config()

const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { generateTimetable } = require('../src/modules/timetable/timetable.generator')
const { detectConflicts, countConflicts } = require('../src/utils/conflicts')

const prisma = new PrismaClient()
const SALT_ROUNDS = 12

async function hash(pw) {
  return bcrypt.hash(pw, SALT_ROUNDS)
}

async function clean() {
  // Delete in dependency-safe order.
  await prisma.timetableModification.deleteMany()
  await prisma.timetableSlot.deleteMany()
  await prisma.course.deleteMany()
  await prisma.student.deleteMany()
  await prisma.lecturer.deleteMany()
  await prisma.room.deleteMany()
  await prisma.building.deleteMany()
  await prisma.semester.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()
}

async function main() {
  console.log('🌱 Seeding LMUI E-Timetable database...')
  await clean()

  // ---- Departments ----
  const cgd = await prisma.department.create({
    data: { name: 'Computer Graphics and Web Design', code: 'CGD' },
  })
  const csc = await prisma.department.create({
    data: { name: 'Software Engineering', code: 'SWE' },
  })
  const itc = await prisma.department.create({
    data: { name: 'Information Technology', code: 'ITC' },
  })
  console.log('  ✓ Departments')

  // ---- Buildings + Rooms ----
  const mainBlock = await prisma.building.create({ data: { name: 'Main Block' } })
  const scienceBlock = await prisma.building.create({ data: { name: 'Science Block' } })

  const rooms = await Promise.all([
    prisma.room.create({ data: { name: 'LAB1', capacity: 40, buildingId: mainBlock.id } }),
    prisma.room.create({ data: { name: 'LAB2', capacity: 40, buildingId: mainBlock.id } }),
    prisma.room.create({ data: { name: 'LH101', capacity: 80, buildingId: mainBlock.id } }),
    prisma.room.create({ data: { name: 'LH102', capacity: 80, buildingId: mainBlock.id } }),
    prisma.room.create({ data: { name: 'D101', capacity: 60, buildingId: scienceBlock.id } }),
    prisma.room.create({ data: { name: 'D102', capacity: 60, buildingId: scienceBlock.id } }),
  ])
  console.log('  ✓ Buildings & Rooms')

  // ---- Admin ----
  await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@lmui.edu',
      password: await hash('admin123'),
      role: 'ADMIN',
    },
  })

  // ---- Lecturers (User + Lecturer) ----
  const nzo = await prisma.user.create({
    data: {
      name: 'Nzo Desmond',
      email: 'nzo.desmond@lmui.edu',
      password: await hash('lecturer123'),
      role: 'LECTURER',
      lecturer: {
        create: {
          staffId: 'LMUI/STF/0142',
          departmentId: cgd.id,
          availableDays: ['MON', 'TUE', 'WED', 'THU'],
          preferredTimeSlots: ['MORNING', 'AFTERNOON'],
        },
      },
    },
    include: { lecturer: true },
  })

  const ndonwi = await prisma.user.create({
    data: {
      name: 'Ndonwi Derrick',
      email: 'ndonwi.derrick@lmui.edu',
      password: await hash('lecturer123'),
      role: 'LECTURER',
      lecturer: {
        create: {
          staffId: 'LMUI/STF/0156',
          departmentId: csc.id,
          availableDays: ['MON', 'TUE', 'WED', 'FRI'],
          preferredTimeSlots: ['MORNING'],
        },
      },
    },
    include: { lecturer: true },
  })

  const mbah = await prisma.user.create({
    data: {
      name: 'Mbah Jr',
      email: 'mbah.jr@lmui.edu',
      password: await hash('lecturer123'),
      role: 'LECTURER',
      lecturer: {
        create: {
          staffId: 'LMUI/STF/0171',
          departmentId: itc.id,
          availableDays: ['TUE', 'WED', 'THU', 'FRI', 'SAT'],
          preferredTimeSlots: ['AFTERNOON', 'EVENING'],
        },
      },
    },
    include: { lecturer: true },
  })
  console.log('  ✓ Lecturers')

  // ---- Students (User + Student) ----
  const studentSeed = [
    { name: 'Endurance Ntoh', email: 'endurance.ntoh@lmui.edu', matricule: 'LMUI/CGD/22/001', departmentId: cgd.id, level: 'YEAR_3' },
    { name: 'Boris Nkeng', email: 'boris.nkeng@lmui.edu', matricule: 'LMUI/CGD/22/014', departmentId: cgd.id, level: 'YEAR_3' },
    { name: 'Grace Ambe', email: 'grace.ambe@lmui.edu', matricule: 'LMUI/SWE/23/008', departmentId: csc.id, level: 'YEAR_2' },
    { name: 'Fatima Bello', email: 'fatima.bello@lmui.edu', matricule: 'LMUI/ITC/24/003', departmentId: itc.id, level: 'YEAR_1' },
  ]
  for (const s of studentSeed) {
    await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        password: await hash('student123'),
        role: 'STUDENT',
        student: {
          create: { matricule: s.matricule, departmentId: s.departmentId, level: s.level },
        },
      },
    })
  }
  console.log('  ✓ Students')

  // ---- Courses ----
  // helper to build course rows
  const buildCourses = (deptId, lecturerId, prefix, defs) =>
    defs.map((d) => ({
      code: `${prefix}${d.n}`,
      title: d.title,
      creditUnits: d.cu,
      departmentId: deptId,
      lecturerId,
      level: d.level,
      preferredTimeSlot: d.slot,
      preferredDay: d.day,
    }))

  const cgdCourses = buildCourses(cgd.id, nzo.lecturer.id, 'CGD', [
    { n: 101, title: 'Web Design I', cu: 3, level: 'YEAR_1', slot: 'MORNING', day: 'MON' },
    { n: 102, title: 'Digital Media', cu: 3, level: 'YEAR_1', slot: 'MORNING', day: 'TUE' },
    { n: 103, title: 'Typography', cu: 2, level: 'YEAR_1', slot: 'AFTERNOON', day: 'WED' },
    { n: 201, title: 'Web Design II', cu: 3, level: 'YEAR_2', slot: 'MORNING', day: 'MON' },
    { n: 202, title: 'UX Design', cu: 4, level: 'YEAR_2', slot: 'AFTERNOON', day: 'TUE' },
    { n: 203, title: 'Motion Graphics', cu: 3, level: 'YEAR_2', slot: 'AFTERNOON', day: 'WED' },
    { n: 301, title: 'Frontend Development', cu: 4, level: 'YEAR_3', slot: 'MORNING', day: 'MON' },
    { n: 302, title: 'UI Systems', cu: 3, level: 'YEAR_3', slot: 'MORNING', day: 'TUE' },
    { n: 303, title: 'Capstone Project', cu: 4, level: 'YEAR_3', slot: 'AFTERNOON', day: 'THU' },
  ])

  const cscCourses = buildCourses(csc.id, ndonwi.lecturer.id, 'SWE', [
    { n: 101, title: 'Intro to Programming', cu: 4, level: 'YEAR_1', slot: 'MORNING', day: 'MON' },
    { n: 102, title: 'Mathematics I', cu: 3, level: 'YEAR_1', slot: 'MORNING', day: 'TUE' },
    { n: 103, title: 'Computer Architecture', cu: 3, level: 'YEAR_1', slot: 'MORNING', day: 'WED' },
    { n: 201, title: 'Data Structures', cu: 4, level: 'YEAR_2', slot: 'MORNING', day: 'MON' },
    { n: 202, title: 'Algorithms', cu: 4, level: 'YEAR_2', slot: 'MORNING', day: 'TUE' },
    { n: 203, title: 'Database Systems', cu: 3, level: 'YEAR_2', slot: 'MORNING', day: 'WED' },
    { n: 301, title: 'Software Engineering', cu: 4, level: 'YEAR_3', slot: 'MORNING', day: 'MON' },
    { n: 302, title: 'Networks', cu: 3, level: 'YEAR_3', slot: 'MORNING', day: 'FRI' },
    { n: 303, title: 'AI Fundamentals', cu: 4, level: 'YEAR_3', slot: 'MORNING', day: 'WED' },
  ])

  const itcCourses = buildCourses(itc.id, mbah.lecturer.id, 'ITC', [
    { n: 101, title: 'Computer Fundamentals', cu: 3, level: 'YEAR_1', slot: 'AFTERNOON', day: 'TUE' },
    { n: 102, title: 'Office Productivity', cu: 2, level: 'YEAR_1', slot: 'AFTERNOON', day: 'WED' },
    { n: 103, title: 'Intro to Networking', cu: 3, level: 'YEAR_1', slot: 'EVENING', day: 'THU' },
    { n: 201, title: 'Operating Systems', cu: 3, level: 'YEAR_2', slot: 'AFTERNOON', day: 'TUE' },
    { n: 202, title: 'Web Technologies', cu: 3, level: 'YEAR_2', slot: 'AFTERNOON', day: 'WED' },
    { n: 203, title: 'System Administration', cu: 3, level: 'YEAR_2', slot: 'EVENING', day: 'THU' },
    { n: 301, title: 'Cyber Security', cu: 4, level: 'YEAR_3', slot: 'AFTERNOON', day: 'FRI' },
    { n: 302, title: 'Cloud Computing', cu: 4, level: 'YEAR_3', slot: 'AFTERNOON', day: 'SAT' },
    { n: 303, title: 'IT Project Management', cu: 3, level: 'YEAR_3', slot: 'EVENING', day: 'FRI' },
  ])

  await prisma.course.createMany({ data: [...cgdCourses, ...cscCourses, ...itcCourses] })
  console.log('  ✓ Courses')

  // ---- Semesters ----
  const archived = await prisma.semester.create({
    data: {
      academicYear: '2024/2025',
      semester: 'SEMESTER_2',
      startDate: new Date('2025-02-03'),
      endDate: new Date('2025-06-20'),
      status: 'DRAFT', // upgraded below after generating slots
    },
  })

  const published = await prisma.semester.create({
    data: {
      academicYear: '2025/2026',
      semester: 'SEMESTER_1',
      startDate: new Date('2025-09-15'),
      endDate: new Date('2026-01-30'),
      status: 'DRAFT', // upgraded to PUBLISHED after generating slots
    },
  })

  const draft = await prisma.semester.create({
    data: {
      academicYear: '2025/2026',
      semester: 'SEMESTER_2',
      startDate: new Date('2026-02-09'),
      endDate: new Date('2026-06-26'),
      status: 'DRAFT',
    },
  })
  console.log('  ✓ Semesters')

  // ---- Generate timetable slots for archived + published ----
  const [allCourses, allLecturers, allRooms] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, departmentId: true, lecturerId: true, level: true, preferredDay: true, preferredTimeSlot: true },
    }),
    prisma.lecturer.findMany({ select: { id: true, availableDays: true, preferredTimeSlots: true } }),
    prisma.room.findMany({ select: { id: true, capacity: true } }),
  ])

  async function seedSlots(semesterId, constraints) {
    const { slots, unscheduled } = generateTimetable({
      semesterId,
      courses: allCourses,
      lecturers: allLecturers,
      rooms: allRooms,
      constraints,
    })
    const annotated = detectConflicts(slots)
    if (annotated.length) {
      await prisma.timetableSlot.createMany({
        data: annotated.map((s) => ({
          semesterId,
          courseId: s.courseId,
          lecturerId: s.lecturerId,
          roomId: s.roomId,
          day: s.day,
          timeSlot: s.timeSlot,
          level: s.level,
          departmentId: s.departmentId,
          hasConflict: s.hasConflict,
          conflictReason: s.conflictReason,
        })),
      })
    }
    return { count: annotated.length, conflicts: countConflicts(annotated), unscheduled: unscheduled.length }
  }

  const constraints = {
    avoidBackToBack: true,
    balanceWorkload: true,
    respectCapacity: true,
    groupByLevelAndDept: true,
  }

  const archivedResult = await seedSlots(archived.id, constraints)
  await prisma.semester.update({
    where: { id: archived.id },
    data: {
      status: 'ARCHIVED',
      generatedAt: new Date('2025-01-20'),
      publishedAt: new Date('2025-01-22'),
      archivedAt: new Date('2025-06-21'),
    },
  })

  const publishedResult = await seedSlots(published.id, constraints)
  await prisma.semester.update({
    where: { id: published.id },
    data: { status: 'PUBLISHED', generatedAt: new Date('2025-09-01'), publishedAt: new Date('2025-09-02') },
  })

  console.log(
    `  ✓ Timetable slots — archived: ${archivedResult.count} (conflicts ${archivedResult.conflicts}, unscheduled ${archivedResult.unscheduled}), published: ${publishedResult.count} (conflicts ${publishedResult.conflicts}, unscheduled ${publishedResult.unscheduled})`
  )

  // ---- Seed a few modification log entries on the published semester ----
  const admin = await prisma.user.findUnique({ where: { email: 'admin@lmui.edu' } })
  const sampleSlot = await prisma.timetableSlot.findFirst({
    where: { semesterId: published.id },
    include: { course: true },
  })

  await prisma.timetableModification.createMany({
    data: [
      {
        semesterId: published.id,
        slotId: sampleSlot ? sampleSlot.id : null,
        action: 'UPDATED',
        changedBy: admin.id,
        description: sampleSlot
          ? `Moved ${sampleSlot.course.code} to a new time slot`
          : 'Adjusted a published slot',
        previousData: sampleSlot ? { day: 'MON', timeSlot: 'SLOT_8_10' } : null,
        newData: sampleSlot ? { day: sampleSlot.day, timeSlot: sampleSlot.timeSlot } : null,
      },
      {
        semesterId: published.id,
        slotId: null,
        action: 'CREATED',
        changedBy: admin.id,
        description: 'Timetable for 2025/2026 Semester 1 published',
      },
    ],
  })
  console.log('  ✓ Modification logs')

  // draft semester intentionally left without slots (demonstrates Generate flow)
  void draft

  console.log('✅ Seed complete.')
  console.log('\nLogin accounts:')
  console.log('  admin@lmui.edu / admin123        (ADMIN)')
  console.log('  nzo.desmond@lmui.edu / lecturer123  (LECTURER)')
  console.log('  endurance.ntoh@lmui.edu / student123 (STUDENT)')
}

main()
  .catch((e) => {
    console.error('✗ Seed failed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
