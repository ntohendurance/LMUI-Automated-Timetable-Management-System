import { useState, useMemo } from 'react'
import { Inbox } from 'lucide-react'
import Pagination from './Pagination.jsx'

const PAGE_SIZE = 10

/**
 * Reusable data table with pagination (10 rows / page).
 * columns: [{ key, header, render?(row), className? }]
 */
export default function Table({ columns, data, emptyMessage = 'No records found.', rowKey = 'id' }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(data.length / PAGE_SIZE) || 1

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return data.slice(start, start + PAGE_SIZE)
  }, [data, page])

  // Reset to page 1 if data shrinks below current page
  if (page > totalPages) setPage(1)

  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-navy-500 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-navy-400">
                    <Inbox size={32} strokeWidth={1.5} />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr key={row[rowKey]} className="group transition hover:bg-gold-50/40">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-4 py-3 text-navy-700 ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={data.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
