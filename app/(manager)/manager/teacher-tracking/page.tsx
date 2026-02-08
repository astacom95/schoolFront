"use client"

import { useEffect, useMemo, useState } from "react"

type TeacherTrackingRow = {
  teacher_id: number
  teacher_name: string
  teacher_image_url?: string | null
  subject_id: number
  subject_name: string
  total_lessons: number
  recorded_lessons: number
  percent: number
}

const initialsFromName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?"
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export default function ManagerTeacherTrackingPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
  const [rows, setRows] = useState<TeacherTrackingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${apiBaseUrl}/api/manager/teacher-tracking`)
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : []
        setRows(list)
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [apiBaseUrl])

  const cards = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      initials: initialsFromName(row.teacher_name ?? ""),
      percent: Math.min(100, Math.max(0, Number(row.percent ?? 0))),
    }))
  }, [rows])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-base font-semibold">متابعة المعلمين</h1>
                  <p className="text-xs text-slate-500">
                    مقارنة الدروس المسجلة لكل معلم مقابل إجمالي الدروس لكل مادة.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs text-slate-500">
                  {rows.length} بطاقة
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            {loading ? (
              <div className="card">جارٍ تحميل بيانات المعلمين...</div>
            ) : cards.length === 0 ? (
              <div className="card">لا توجد بيانات متابعة حالياً.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <div
                    key={`${card.teacher_id}-${card.subject_id}`}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {card.teacher_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={card.teacher_image_url}
                          alt={card.teacher_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-sm font-semibold text-slate-700">
                          {card.initials}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">
                          {card.teacher_name}
                        </span>
                        <span className="text-xs text-slate-500">{card.subject_name}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>إجمالي الدروس</span>
                        <span className="font-semibold text-slate-700">{card.total_lessons}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>الدروس المسجلة</span>
                        <span className="font-semibold text-slate-700">{card.recorded_lessons}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>نسبة التسجيل</span>
                        <span className="font-semibold text-slate-700">{card.percent}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[#EAF1FF]">
                        <div
                          className="h-2 rounded-full bg-[var(--color-accent)]"
                          style={{ width: `${card.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
