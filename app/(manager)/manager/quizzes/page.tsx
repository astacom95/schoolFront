"use client"

import { useEffect, useState } from "react"

type QuizRow = {
  id: number
  lesson_title: string
  subject_name?: string
  level_name?: string
  class_name?: string
  quiz_url_display?: string
}

export default function ManagerQuizzesPage() {
  const [rows, setRows] = useState<QuizRow[]>([])

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        const res = await fetch(`${base}/api/manager/quizzes`)
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : []
        const normalized = list.map((item: any, idx: number) => ({
          id: item.id ?? idx,
          lesson_title: item.lesson_title ?? "",
          subject_name: item.subject_name ?? "",
          level_name: item.level_name ?? "",
          class_name: item.class_name ?? "",
          quiz_url_display: item.quiz_url_display ?? item.quiz_url ?? "",
        }))
        setRows(normalized)
      } catch (error) {
        console.error("فشل جلب التدريبات", error)
        setRows([])
      }
    }
    void loadQuizzes()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold">تدريبات الدروس</div>
              <div className="max-h-[640px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#E9F0FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الدرس</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المرحلة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الصف</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">رابط التدريب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length > 0 ? (
                      rows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-700">{row.lesson_title}</td>
                          <td className="px-4 py-3 text-slate-600">{row.subject_name}</td>
                          <td className="px-4 py-3 text-slate-600">{row.level_name}</td>
                          <td className="px-4 py-3 text-slate-600">{row.class_name}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.quiz_url_display ? (
                              <a
                                href={row.quiz_url_display}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-lg bg-[#E9F0FF] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-[#DDE7FF]"
                              >
                                فتح
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                          لا توجد تدريبات بعد.
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
