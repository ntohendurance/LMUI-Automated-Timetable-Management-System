import { createContext, useState, useCallback, useEffect } from 'react'
import { semesterApi } from '../api/endpoints.js'
import { useAuth } from '../hooks/useAuth.js'

const SemesterContext = createContext(null)

export function SemesterProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [semesters, setSemesters] = useState([])
  const [selectedSemesterId, setSelectedSemesterId] = useState(null)
  const [loading, setLoading] = useState(false)

  // Active = the published semester (falls back to the most recent).
  const activeSemester =
    semesters.find((s) => s.statusEnum === 'PUBLISHED') || semesters[0] || null
  const activeSemesterId = activeSemester?.id || null
  const selectedSemester =
    semesters.find((s) => s.id === selectedSemesterId) || activeSemester || null

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await semesterApi.list()
      setSemesters(list)
      setSelectedSemesterId((prev) => {
        if (prev && list.some((s) => s.id === prev)) return prev
        const published = list.find((s) => s.statusEnum === 'PUBLISHED')
        return published?.id || list[0]?.id || null
      })
      return list
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) load().catch(() => {})
    else {
      setSemesters([])
      setSelectedSemesterId(null)
    }
  }, [isAuthenticated, load])

  // Publish / archive via the API, then refresh.
  const publish = useCallback(
    async (id) => {
      await semesterApi.publish(id)
      await load()
    },
    [load]
  )
  const archive = useCallback(
    async (id) => {
      await semesterApi.archive(id)
      await load()
    },
    [load]
  )

  return (
    <SemesterContext.Provider
      value={{
        semesters,
        loading,
        activeSemester,
        activeSemesterId,
        selectedSemester,
        selectedSemesterId,
        setSelectedSemesterId,
        reload: load,
        publish,
        archive,
      }}
    >
      {children}
    </SemesterContext.Provider>
  )
}

export { SemesterContext }
