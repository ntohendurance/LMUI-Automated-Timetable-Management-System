import { useContext } from 'react'
import { CatalogContext } from '../context/CatalogContext.jsx'

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider')
  return ctx
}
