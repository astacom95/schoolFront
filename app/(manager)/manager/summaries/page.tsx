"use client"

import { useEffect, useState } from "react"

type LessonSummaryRow = {
  id: number
  title: string
  summary: string
  subject_name?: string
  level_name?: string
  class_name?: string
  created_at?: string
}

export default function ManagerSummariesPage() {
  const [rows, setRows] = useState<LessonSummaryRow[]>([])

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
          subject_name: item.subject_name ?? "",
          level_name: item.level_name ?? "",
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold">ملخصات الدروس</div>
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
                    {rows.length > 0 ? (
                      rows.map((row) => (
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
                          لا توجد ملخصات دروس بعد.
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
