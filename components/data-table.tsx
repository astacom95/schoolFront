"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/components/ui/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type StudentRow = {
  id: number | string
  full_name: string
  user_name?: string | null
  email?: string | null
  phone_number?: string | null
  level?: string | null
  class?: string | null
  class_id?: number | null
  gender?: string | null
  guardian_name?: string | null
  date_of_birth?: string | null
  created_at?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  certificate_path?: string | null
  personal_image_path?: string | null
  paid_amount?: number
  total_fee?: number
  remaining_amount?: number
  cv_path?: string | null
}

type DataTableProps = {
  data: StudentRow[]
  paginate?: boolean
  pageSize?: number
  className?: string
  maxHeight?: string | number
  selectedId?: StudentRow["id"] | null
  onSelectRow?: (row: StudentRow) => void
  showFinanceColumns?: boolean
  showLevelClassColumns?: boolean
  title?: string
  printFriendly?: boolean
}

export function DataTable({
  data,
  paginate = false,
  pageSize = 10,
  className,
  maxHeight,
  selectedId = null,
  onSelectRow,
  showFinanceColumns = true,
  showLevelClassColumns = true,
  title = "قائمة الطلاب",
  printFriendly = false,
}: DataTableProps) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [isPrinting, setIsPrinting] = useState(false)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return data
    return data.filter((row) =>
      [
        row.full_name,
        row.email ?? "",
        row.phone_number ?? "",
        row.level ?? "",
        row.class ?? "",
        row.gender ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    )
  }, [data, query])

  const pageCount = paginate ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1

  useEffect(() => {
    if (!paginate) return
    setPage((prev) => Math.min(prev, pageCount))
  }, [pageCount, paginate])

  useEffect(() => {
    if (!paginate) return
    setPage(1)
  }, [query, paginate, pageSize])

  const paginatedRows = paginate
    ? filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
    : filtered
  const visibleRows = printFriendly && isPrinting ? filtered : paginatedRows
  const columnCount = (showLevelClassColumns ? 6 : 4) + (showFinanceColumns ? 4 : 0)

  useEffect(() => {
    if (!printFriendly || typeof window === "undefined") return

    const handleBeforePrint = () => setIsPrinting(true)
    const handleAfterPrint = () => setIsPrinting(false)

    window.addEventListener("beforeprint", handleBeforePrint)
    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint)
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [printFriendly])

  return (
    <Card className={cn("border border-slate-200 shadow-none", className)}>
      <div className="flex flex-col gap-4 p-4">
        {!(printFriendly && isPrinting) && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-lg font-serif font-semibold text-slate-900">{title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="ابحث بالاسم أو البريد أو الرقم"
                className="h-9 max-w-xs border-slate-200 bg-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <div
            className="overflow-y-auto"
            style={
              maxHeight
                ? { maxHeight, minHeight: "0.5rem" }
                : undefined
            }
          >
            <Table className="text-right">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-md">الاسم الكامل</TableHead>
                  <TableHead className="text-right text-md">البريد</TableHead>
                  <TableHead className="text-right text-md">رقم الهاتف</TableHead>
                  {showLevelClassColumns && (
                    <>
                      <TableHead className="text-right text-md">المستوى</TableHead>
                      <TableHead className="text-right text-md">الفصل</TableHead>
                    </>
                  )}
                  <TableHead className="text-right text-md">الجنس</TableHead>
                  {showFinanceColumns && (
                    <>
                      <TableHead className="text-right text-md">المبلغ المدفوع</TableHead>
                      <TableHead className="text-right text-md">المبلغ الكامل</TableHead>
                      <TableHead className="text-right text-md">المبلغ المتبقي</TableHead>
                      <TableHead className="text-right text-md">الحالة المالية</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="text-right  cursor-pointer transition-colors data-[selected=true]:bg-slate-100 hover:bg-slate-50"
                    data-selected={selectedId === row.id}
                    onClick={() => onSelectRow?.(row)}
                  >
                    <TableCell className="text-lg">{row.full_name}</TableCell>
                    <TableCell>{row.email || "—"}</TableCell>
                    <TableCell>{row.phone_number || "—"}</TableCell>
                    {showLevelClassColumns && (
                      <>
                        <TableCell>{row.level || "—"}</TableCell>
                        <TableCell>{row.class || "—"}</TableCell>
                      </>
                    )}
                    <TableCell>{row.gender || "—"}</TableCell>
                    {showFinanceColumns && (
                      <>
                        <TableCell>{row.paid_amount ?? 0}</TableCell>
                        <TableCell>{row.total_fee ?? 0}</TableCell>
                        <TableCell>{row.remaining_amount ?? 0}</TableCell>
                        <TableCell>
                          {row.remaining_amount !== undefined && row.total_fee !== undefined ? (
                            row.remaining_amount <= 0 ? (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                مكتمل
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                                غير مكتمل
                              </span>
                            )
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                {visibleRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="text-center text-sm text-muted-foreground">
                      لا توجد بيانات مطابقة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {paginate && !(printFriendly && isPrinting) && (
          <div className="flex items-center justify-between gap-3 flex-wrap border-t border-slate-200 pt-3">
            <span className="text-sm text-slate-500">
              صفحة {page} من {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                السابق
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
