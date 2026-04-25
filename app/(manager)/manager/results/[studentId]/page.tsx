"use client"

import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type StudentInfo = {
  id: number
  full_name: string
  class_id: number
  class_name: string
  exam_period_id: number
  exam_name?: string | null
  exam_year?: number | null
}

type SummaryInfo = {
  earned_total: number
  max_total: number
  percentage: number
  subjects_count: number
}

type SubjectRow = {
  subject_id: number
  subject_name?: string | null
  degree: number
  total_degree: number
  percentage: number
}

type StudentResultDetailsResponse = {
  student?: StudentInfo | null
  summary?: SummaryInfo | null
  subjects?: SubjectRow[]
}

export default function ManagerStudentResultDetailsPage() {
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
    [],
  )

  const params = useParams<{ studentId: string }>()
  const searchParams = useSearchParams()
  const studentId = params?.studentId ?? ""
  const examPeriodId = searchParams.get("exam_period_id") ?? ""
  const classId = searchParams.get("class_id") ?? ""

  const [details, setDetails] = useState<StudentResultDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDetails = async () => {
      if (!studentId || !examPeriodId || !classId) {
        setLoading(false)
        setDetails(null)
        setError("الرجاء اختيار فترة الامتحان والصف من صفحة النتائج أولاً.")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const query = new URLSearchParams({
          exam_period_id: examPeriodId,
          class_id: classId,
        })
        const res = await fetch(`${apiBase}/api/manager/results/${studentId}?${query.toString()}`, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("تعذر تحميل تفاصيل نتيجة الطالب.")
        }

        const json = (await res.json()) as StudentResultDetailsResponse
        setDetails({
          student: json?.student ?? null,
          summary: json?.summary ?? null,
          subjects: Array.isArray(json?.subjects) ? json.subjects : [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل تفاصيل نتيجة الطالب.")
        setDetails(null)
      } finally {
        setLoading(false)
      }
    }

    void loadDetails()
  }, [apiBase, classId, examPeriodId, studentId])

  const backHref = useMemo(() => {
    const query = new URLSearchParams()
    if (examPeriodId) query.set("exam_period_id", examPeriodId)
    if (classId) query.set("class_id", classId)
    const queryString = query.toString()
    return queryString ? `/manager/results?${queryString}` : "/manager/results"
  }, [classId, examPeriodId])

  const subjects = details?.subjects ?? []
  const student = details?.student ?? null
  const summary = details?.summary ?? null

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-base font-semibold">تفاصيل نتيجة الطالب</h1>
                  <p className="text-xs text-slate-500">عرض تفصيلي لدرجات المواد خلال الفترة المحددة.</p>
                </div>
                <Link
                  href={backHref}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  العودة إلى النتائج
                </Link>
              </div>

              {loading ? <div className="text-sm text-slate-500">جارٍ تحميل التفاصيل...</div> : null}
              {error ? <div className="text-sm text-red-600">{error}</div> : null}

              {!loading && !error && (!student || !summary || subjects.length === 0) ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  لا توجد تفاصيل نتائج لهذا الطالب في الصف والفترة المحددين.
                </div>
              ) : null}

              {!loading && !error && student && summary && subjects.length > 0 ? (
                <>
                  <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                      <div className="text-[11px]">الطالب</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{student.full_name}</div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                      <div className="text-[11px]">الفترة</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">
                        {student.exam_name ?? "—"}
                        {student.exam_year ? ` - ${student.exam_year}` : ""}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                      <div className="text-[11px]">الصف</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{student.class_name}</div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                      <div className="text-[11px]">النسبة النهائية</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{summary.percentage}%</div>
                    </div>
                  </div>

                  <div className="mb-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                      <div className="text-[11px]">المجموع</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">
                        {summary.earned_total} / {summary.max_total}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                      <div className="text-[11px]">عدد المواد</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{summary.subjects_count}</div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                      <div className="text-[11px]">رقم الطالب</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{student.id}</div>
                    </div>
                  </div>

                  <div className="max-h-[640px] overflow-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">الدرجة</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">الدرجة الكاملة</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">نسبة المادة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((row) => (
                          <tr key={row.subject_id} className="border-b border-slate-200/80 hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-700">{row.subject_name ?? "-"}</td>
                            <td className="px-4 py-3 text-slate-600">{row.degree}</td>
                            <td className="px-4 py-3 text-slate-600">{row.total_degree}</td>
                            <td className="px-4 py-3 text-slate-700">{row.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
