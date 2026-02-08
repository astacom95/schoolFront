"use client"

import { useEffect, useState } from "react"

type ReportRow = {
  id: number
  student_name: string
  teacher_name: string
  subject_name?: string
  level_name?: string
  class_name?: string
  student_subject_performance?: string
  homework_commitment?: string
  discipline_commitment?: string
  peer_relationship?: string
  self_confidence?: string
  special_skills?: string
  academic_progress?: string
  literacy_numeracy_skills?: string
  participation_interaction?: string
  follow_up_cases?: string
  responsibility_ability?: string
  absence_delay?: string
  support_needs?: string
  recommendations?: string
  created_at?: string
}

export default function ManagerReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    const loadReports = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        const res = await fetch(`${base}/api/manager/reports`)
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : []
        setRows(list)
      } catch (error) {
        console.error("فشل جلب التقارير", error)
        setRows([])
      }
    }
    void loadReports()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold">تقارير الطلاب</div>
              <div className="max-h-[640px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#E9F0FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">عرض</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الطالب</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المعلم</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المرحلة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الصف</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">تقييم المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">التقدم الدراسي</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">التوصيات</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length > 0 ? (
                      rows.map((row) => (
                        <>
                          <tr key={row.id} className="border-b border-slate-100">
                            <td className="px-4 py-3 text-slate-700">
                              <button
                                type="button"
                                aria-label="عرض التفاصيل"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-600 transition hover:bg-slate-100"
                                onClick={() =>
                                  setExpandedId((current) => (current === row.id ? null : row.id))
                                }
                              >
                                {expandedId === row.id ? "▲" : "▼"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{row.student_name}</td>
                            <td className="px-4 py-3 text-slate-600">{row.teacher_name}</td>
                            <td className="px-4 py-3 text-slate-600">{row.subject_name}</td>
                            <td className="px-4 py-3 text-slate-600">{row.level_name}</td>
                            <td className="px-4 py-3 text-slate-600">{row.class_name}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {row.student_subject_performance}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{row.academic_progress}</td>
                            <td className="px-4 py-3 text-slate-600">{row.recommendations}</td>
                            <td className="px-4 py-3 text-slate-600">{row.created_at}</td>
                          </tr>
                          {expandedId === row.id ? (
                            <tr className="border-b border-slate-100 bg-slate-50">
                              <td colSpan={10} className="px-4 py-4 text-sm text-slate-700">
                                <div className="grid gap-2 md:grid-cols-2">
                                  <div>الالتزام بالواجب: {row.homework_commitment ?? "-"}</div>
                                  <div>الانضباط: {row.discipline_commitment ?? "-"}</div>
                                  <div>العلاقة مع الزملاء: {row.peer_relationship ?? "-"}</div>
                                  <div>الثقة بالنفس: {row.self_confidence ?? "-"}</div>
                                  <div>المهارات الخاصة: {row.special_skills ?? "-"}</div>
                                  <div>المهارات القرائية/العددية: {row.literacy_numeracy_skills ?? "-"}</div>
                                  <div>المشاركة والتفاعل: {row.participation_interaction ?? "-"}</div>
                                  <div>المتابعات المطلوبة: {row.follow_up_cases ?? "-"}</div>
                                  <div>تحمل المسؤولية: {row.responsibility_ability ?? "-"}</div>
                                  <div>الغياب/التأخر: {row.absence_delay ?? "-"}</div>
                                  <div>احتياجات الدعم: {row.support_needs ?? "-"}</div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                          لا توجد تقارير بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                عرض للقراءة فقط.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
