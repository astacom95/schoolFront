"use client"

import { useEffect, useMemo, useState } from "react"

import { apiFetch } from "@/lib/api/client"

type MonthlyTestItem = {
  id: number
  test_url: string
  test_url_display?: string | null
  subject_id: number
  subject_name?: string | null
  level_id: number
  level_name?: string | null
  class_id: number
  class_name?: string | null
  created_at?: string | null
}

export default function StudentMonthlyTestsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [tests, setTests] = useState<MonthlyTestItem[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = (await apiFetch("/student/monthly-tests")) as {
          data?: MonthlyTestItem[]
        }
        setTests(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setTests([])
      }
    }
    void loadTests()
  }, [])

  const subjects = useMemo(() => {
    const map = new Map<number, string>()
    tests.forEach((test) => {
      if (test.subject_id && test.subject_name) {
        map.set(test.subject_id, test.subject_name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [tests])

  useEffect(() => {
    if (selectedSubjectId) return
    if (subjects.length > 0) setSelectedSubjectId(subjects[0].id)
  }, [subjects, selectedSubjectId])

  const rows = useMemo(() => {
    const filtered = selectedSubjectId
      ? tests.filter((test) => test.subject_id === selectedSubjectId)
      : tests
    const normalized = filtered.map((test) => {
      const rawUrl = test.test_url_display ?? test.test_url ?? ""
      const fullUrl = rawUrl && rawUrl.startsWith("/storage") ? `${fileBaseUrl}${rawUrl}` : rawUrl
      return {
        ...test,
        fullUrl,
      }
    })

    return normalized.sort((a, b) => {
      const dateA = a.created_at ?? ""
      const dateB = b.created_at ?? ""
      if (dateA === dateB) return (b.id ?? 0) - (a.id ?? 0)
      return dateB.localeCompare(dateA)
    })
  }, [tests, fileBaseUrl, selectedSubjectId])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg font-semibold">الاختبارات الشهرية</h1>
              <span className="text-xs text-slate-500">
                اختر مادة لعرض الاختبارات الخاصة بها.
              </span>
            </div>

            {subjects.length === 0 ? (
              <div className="card mt-4">لا توجد اختبارات شهرية متاحة حالياً.</div>
            ) : (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => {
                    const isActive = subject.id === selectedSubjectId
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-right transition ${
                          isActive
                            ? "border-[var(--color-accent)] bg-[var(--color-surface-alt)] text-[var(--color-text)]"
                            : "border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold">{subject.name}</span>
                          <span className="text-xs text-slate-500">اضغط لعرض الاختبارات</span>
                        </div>
                        <span className="text-xs text-slate-400">عرض</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  {rows.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      لا توجد اختبارات لهذه المادة بعد.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#EAF6FC] text-black">
                            <th className="px-3 py-2 text-right font-semibold">المادة</th>
                            <th className="px-3 py-2 text-right font-semibold">الاختبار</th>
                            <th className="px-3 py-2 text-right font-semibold">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((test) => (
                            <tr key={test.id} className="border-b border-slate-200">
                              <td className="px-3 py-2">{test.subject_name ?? "-"}</td>
                              <td className="px-3 py-2">
                                {test.fullUrl ? (
                                  <a
                                    href={test.fullUrl}
                                    className="text-blue-600 underline"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    فتح الاختبار
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-3 py-2">{test.created_at ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
