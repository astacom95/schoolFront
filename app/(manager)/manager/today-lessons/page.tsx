"use client"

import { useEffect, useMemo, useState } from "react"

type TodayLessonRow = {
  id: number
  lesson_name: string
  subject_name?: string | null
  teacher_name?: string | null
  summary?: string | null
  created_at?: string | null
  meet_link?: string | null
  can_join_meet?: boolean
  quiz_url?: string | null
  has_quiz?: boolean
}

type TodayLessonsResponse = {
  date?: string
  data?: TodayLessonRow[]
}

export default function ManagerTodayLessonsPage() {
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
    [],
  )

  const [rows, setRows] = useState<TodayLessonRow[]>([])
  const [dateLabel, setDateLabel] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTodayLessons = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${apiBase}/api/manager/today-lessons`, { cache: "no-store" })
        if (!res.ok) {
          throw new Error("تعذر تحميل دروس اليوم.")
        }

        const json = (await res.json()) as TodayLessonsResponse
        setRows(Array.isArray(json?.data) ? json.data : [])
        setDateLabel(json?.date ?? "")
      } catch (err) {
        setRows([])
        setError(err instanceof Error ? err.message : "تعذر تحميل دروس اليوم.")
      } finally {
        setLoading(false)
      }
    }

    void loadTodayLessons()
  }, [apiBase])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">دروس اليوم</div>
                  <div className="text-xs text-slate-500">
                    التاريخ: {dateLabel || "—"}
                  </div>
                </div>
              </div>

              {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}

              <div className="max-h-[640px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الدرس</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المعلم</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الملخص</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الاختبار</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">Google Meet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                          جارٍ تحميل دروس اليوم...
                        </td>
                      </tr>
                    ) : rows.length > 0 ? (
                      rows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-200/80 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-700">{row.subject_name ?? "-"}</td>
                          <td className="px-4 py-3 text-slate-700">{row.lesson_name}</td>
                          <td className="px-4 py-3 text-slate-600">{row.teacher_name ?? "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{row.summary ?? "-"}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.has_quiz && row.quiz_url ? (
                              <a
                                href={row.quiz_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                فتح الاختبار
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.can_join_meet && row.meet_link ? (
                              <a
                                href={row.meet_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-md bg-[var(--color-sidebar-bg)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                              >
                                انضمام
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                          لا توجد دروس تم إنشاؤها اليوم.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
