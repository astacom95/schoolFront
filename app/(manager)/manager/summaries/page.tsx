"use client"

import { useEffect, useMemo, useState } from "react"

type LessonSummaryRow = {
  id: number
  title: string
  summary: string
  subject_id?: number
  subject_name?: string
  level_id?: number
  level_name?: string
  class_id?: number
  class_name?: string
  created_at?: string
}

export default function ManagerSummariesPage() {
  const [rows, setRows] = useState<LessonSummaryRow[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all")

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        const res = await fetch(`${base}/api/manager/lesson-summaries`)
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : []
        const normalized = list.map((item: any, idx: number) => ({
          id: item.id ?? idx,
          title: item.title ?? "",
          summary: item.summary ?? "",
          subject_id: item.subject_id ?? undefined,
          subject_name: item.subject_name ?? "",
          level_id: item.level_id ?? undefined,
          level_name: item.level_name ?? "",
          class_id: item.class_id ?? undefined,
          class_name: item.class_name ?? "",
          created_at: item.created_at ?? "",
        }))
        setRows(normalized)
      } catch (error) {
        console.error("فشل جلب ملخصات الدروس", error)
        setRows([])
      }
    }
    void loadSummaries()
  }, [])

  const classOptions = useMemo(() => {
    const map = new Map<number, string>()

    rows.forEach((row) => {
      if (typeof row.class_id === "number" && row.class_name) {
        map.set(row.class_id, row.class_name)
      }
    })

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
  }, [rows])

  const subjectOptions = useMemo(() => {
    const map = new Map<number, string>()

    rows.forEach((row) => {
      const matchesClass = selectedClassId === "all" || String(row.class_id ?? "") === selectedClassId
      if (matchesClass && typeof row.subject_id === "number" && row.subject_name) {
        map.set(row.subject_id, row.subject_name)
      }
    })

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
  }, [rows, selectedClassId])

  useEffect(() => {
    if (selectedSubjectId === "all") {
      return
    }

    const hasSubject = subjectOptions.some((option) => String(option.id) === selectedSubjectId)
    if (!hasSubject) {
      setSelectedSubjectId("all")
    }
  }, [selectedSubjectId, subjectOptions])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const classMatches = selectedClassId === "all" || String(row.class_id ?? "") === selectedClassId
      const subjectMatches = selectedSubjectId === "all" || String(row.subject_id ?? "") === selectedSubjectId

      return classMatches && subjectMatches
    })
  }, [rows, selectedClassId, selectedSubjectId])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-4">
                <div className="text-sm font-semibold">ملخصات الدروس</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">تصفية حسب الفصل</label>
                    <select
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                      value={selectedClassId}
                      onChange={(event) => setSelectedClassId(event.target.value)}
                    >
                      <option value="all">كل الفصول</option>
                      {classOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">تصفية حسب المادة</label>
                    <select
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                      value={selectedSubjectId}
                      onChange={(event) => setSelectedSubjectId(event.target.value)}
                    >
                      <option value="all">كل المواد</option>
                      {subjectOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="max-h-[640px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#E9F0FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الدرس</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المرحلة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الصف</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الملخص</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length > 0 ? (
                      filteredRows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-700">{row.title}</td>
                          <td className="px-4 py-3 text-slate-600">{row.subject_name}</td>
                          <td className="px-4 py-3 text-slate-600">{row.level_name}</td>
                          <td className="px-4 py-3 text-slate-600">{row.class_name}</td>
                          <td className="px-4 py-3 text-slate-600">{row.summary}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                          لا توجد ملخصات مطابقة للتصفية الحالية.
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
