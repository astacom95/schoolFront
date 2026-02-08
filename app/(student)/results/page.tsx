"use client"

import { useEffect, useState } from "react"

import { apiFetch } from "@/lib/api/client"

type ResultSubjectRow = {
  subject_id: number
  subject_name?: string | null
  degree: number
  total_degree: number
}

type ExamPeriodGroup = {
  exam_period: {
    id: number
    exam_name?: string | null
    exam_year?: number | null
    exam_start_date?: string | null
    exam_end_date?: string | null
  }
  subjects: ResultSubjectRow[]
}

export default function StudentResultsPage() {
  const [groups, setGroups] = useState<ExamPeriodGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = (await apiFetch("/student/results")) as { data?: ExamPeriodGroup[] }
        setGroups(Array.isArray(res?.data) ? res.data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل النتائج.")
        setGroups([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold">الدرجات و النتائج</h2>
        <p className="text-sm text-slate-600">
          تظهر النتائج فقط عندما تكتمل درجات جميع المواد لهذا الصف.
        </p>
      </div>

      {loading ? (
        <div className="card">جارٍ تحميل النتائج...</div>
      ) : error ? (
        <div className="card text-red-500">{error}</div>
      ) : groups.length === 0 ? (
        <div className="card">لا توجد نتائج مكتملة حتى الآن.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.exam_period.id} className="card">
              {(() => {
                const total = group.subjects.reduce((sum, row) => sum + row.total_degree, 0)
                const earned = group.subjects.reduce((sum, row) => sum + row.degree, 0)
                const percent = total > 0 ? Math.round((earned / total) * 100) : 0
                return (
                  <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">
                    {group.exam_period.exam_name ?? "امتحان"}{" "}
                    {group.exam_period.exam_year ? `- ${group.exam_period.exam_year}` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    {group.exam_period.exam_start_date ?? "—"} حتى{" "}
                    {group.exam_period.exam_end_date ?? "—"}
                  </div>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                  {group.subjects.length} مادة
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                  <div className="text-[11px]">المجموع</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">
                    {earned} / {total}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                  <div className="text-[11px]">النسبة</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{percent}%</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                  <div className="text-[11px]">عدد المواد</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">
                    {group.subjects.length}
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-[#E9F0FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الدرجة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الدرجة الكاملة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.subjects.map((row) => (
                      <tr key={row.subject_id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-slate-700">
                          {row.subject_name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.degree}</td>
                        <td className="px-4 py-3 text-slate-600">{row.total_degree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                  </>
                )
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
