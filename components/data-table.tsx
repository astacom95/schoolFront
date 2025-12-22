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
  email?: string | null
  phone_number?: string | null
  level?: string | null
  class?: string | null
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
  title?: string
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
  title = "قائمة الطلاب",
}: DataTableProps) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

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

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="ابحث بالاسم أو البريد أو الرقم"
              className="max-w-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
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
                  <TableHead className="text-right">الاسم الكامل</TableHead>
                  <TableHead className="text-right">البريد</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">المستوى</TableHead>
                  <TableHead className="text-right">الفصل</TableHead>
                  <TableHead className="text-right">الجنس</TableHead>
                  {showFinanceColumns && (
                    <>
                      <TableHead className="text-right">المبلغ المدفوع</TableHead>
                      <TableHead className="text-right">المبلغ الكامل</TableHead>
                      <TableHead className="text-right">المبلغ المتبقي</TableHead>
                      <TableHead className="text-right">الحالة المالية</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="text-right cursor-pointer transition-colors data-[selected=true]:bg-muted/40 hover:bg-muted/30"
                    data-selected={selectedId === row.id}
                    onClick={() => onSelectRow?.(row)}
                  >
                    <TableCell className="font-medium">{row.full_name}</TableCell>
                    <TableCell>{row.email || "—"}</TableCell>
                    <TableCell>{row.phone_number || "—"}</TableCell>
                    <TableCell>{row.level || "—"}</TableCell>
                    <TableCell>{row.class || "—"}</TableCell>
                    <TableCell>{row.gender || "—"}</TableCell>
                    {showFinanceColumns && (
                      <>
                        <TableCell>{row.paid_amount ?? 0}</TableCell>
                        <TableCell>{row.total_fee ?? 0}</TableCell>
                        <TableCell>{row.remaining_amount ?? 0}</TableCell>
                        <TableCell>
                          {row.remaining_amount !== undefined && row.total_fee !== undefined ? (
                            row.remaining_amount <= 0 ? (
                              <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                مكتمل
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
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
                {paginatedRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      لا توجد بيانات مطابقة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {paginate && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">
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
