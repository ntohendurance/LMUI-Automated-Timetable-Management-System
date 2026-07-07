import { useContext } from 'react'
import { SemesterContext } from '../context/SemesterContext.jsx'

export function useSemester() {
  const ctx = useContext(SemesterContext)
  if (!ctx) throw new Error('useSemester must be used within a SemesterProvider')
  return ctx
}
