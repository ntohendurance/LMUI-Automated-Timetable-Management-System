import { createContext, useState, useCallback, useEffect } from 'react'
import { departmentApi, lecturerApi, roomApi, buildingApi, courseApi } from '../api/endpoints.js'
import { useAuth } from '../hooks/useAuth.js'

// Shared reference data used across forms (department/lecturer/room/course
// dropdowns) and the timetable editor. Loaded once after authentication.
const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [rooms, setRooms] = useState([])
  const [buildings, setBuildings] = useState([])
  const [courses, setCourses] = useState([])
  const [loaded, setLoaded] = useState(false)

  const isAdmin = user?.role === 'admin'

  const load = useCallback(async () => {
    // Departments / rooms / buildings / courses are readable by all roles.
    const [depts, rms, blds, courseRes, lecs] = await Promise.all([
      departmentApi.list().catch(() => []),
      roomApi.list().catch(() => []),
      buildingApi.list().catch(() => []),
      courseApi.list({ limit: 200 }).catch(() => ({ items: [] })),
      isAdmin ? lecturerApi.list().catch(() => []) : Promise.resolve([]),
    ])
    setDepartments(depts)
    setRooms(rms)
    setBuildings(blds)
    setCourses(courseRes.items || [])
    // Only approved lecturers are assignable to courses / timetable slots.
    setLecturers((lecs || []).filter((l) => l.isApproved !== false))
    setLoaded(true)
  }, [isAdmin])

  useEffect(() => {
    if (isAuthenticated) load().catch(() => {})
    else {
      setDepartments([])
      setLecturers([])
      setRooms([])
      setBuildings([])
      setCourses([])
      setLoaded(false)
    }
  }, [isAuthenticated, load])

  return (
    <CatalogContext.Provider
      value={{ departments, lecturers, rooms, buildings, courses, loaded, reload: load }}
    >
      {children}
    </CatalogContext.Provider>
  )
}

export { CatalogContext }
