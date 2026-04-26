"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
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

type SchoolSetting = {
  school_name?: string | null
  school_logo_url?: string | null
}

export default function ManagerStudentResultDetailsPage() {
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
    [],
  )

  const params = useParams<{ studentId: string }>()
  const studentId = params?.studentId ?? ""
  const [examPeriodId, setExamPeriodId] = useState("")
  const [classId, setClassId] = useState("")

  const [details, setDetails] = useState<StudentResultDetailsResponse | null>(null)
  const [setting, setSetting] = useState<SchoolSetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const query = new URLSearchParams(window.location.search)
    setExamPeriodId(query.get("exam_period_id") ?? "")
    setClassId(query.get("class_id") ?? "")
  }, [])

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const res = await fetch(`${apiBase}/api/manager/settings`, { cache: "no-store" })
        if (!res.ok) {
          setSetting(null)
          return
        }

        const json = (await res.json()) as { data?: SchoolSetting | null }
        setSetting((json?.data ?? null) as SchoolSetting | null)
      } catch {
        setSetting(null)
      }
    }

    void loadSetting()
  }, [apiBase])

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
  const schoolName = setting?.school_name?.trim() || "school_name:مدرسة"
  const schoolLogo = setting?.school_logo_url ?? null

  return (
    <div className="manager-result-page flex flex-1 flex-col">
      <div className="manager-result-screen @container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-base font-semibold">تفاصيل نتيجة الطالب</h1>
                  <p className="text-xs text-slate-500">عرض تفصيلي لدرجات المواد خلال الفترة المحددة.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center rounded-md bg-[var(--color-sidebar-bg)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    طباعة النتيجة
                  </button>
                  <Link
                    href={backHref}
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    العودة إلى النتائج
                  </Link>
                </div>
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

      <div className="manager-print-sheet" dir="rtl">
        <div className="sheet-inner">
          <div className="sheet-header">
            <div className="sheet-logo">
              {schoolLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={schoolLogo} alt={schoolName} />
              ) : (
                <span>LOGO</span>
              )}
            </div>
            <div className="sheet-title-wrap">
              <h2>{schoolName}</h2>
              <div className="sheet-exam-title">نتيجة {student?.exam_name ?? "exam_name"}</div>
            </div>
          </div>

          <div className="sheet-meta-row">
            <div>الاسم: {student?.full_name ?? "student_name"}</div>
            <div>الصف: {student?.class_name ?? "class_name"}</div>
          </div>

          <div className="sheet-table-wrap">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>المواد</th>
                  <th>الدرجة المتحصلة</th>
                  <th>الدرجة الكاملة</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={`subject-row-${subject.subject_id}`}>
                    <td>{subject.subject_name ?? "-"}</td>
                    <td>{subject.degree}</td>
                    <td>{subject.total_degree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="sheet-summary-row">
              <div>
                المجموع: {summary?.earned_total ?? "-"} / {summary?.max_total ?? "-"}
              </div>
              <div>النسبة: {summary ? `${summary.percentage}%` : "-"}</div>
            </div>
          </div>

          <div className="sheet-footer">
            <div className="sheet-signatures">
              <div>المدير: ............</div>
              <div>توقيع المدير: ............</div>
            </div>
            <div className="sheet-motto">عود ابنك/ابنتك الصلاة و الصدق و الحب الوطن</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .manager-print-sheet {
          display: none;
        }

        .sheet-inner {
          background: #f1f1f1;
          border: 10px solid #535353;
          color: #000;
          min-height: 664px;
          padding: 28px 44px 24px;
          box-sizing: border-box;
        }

        .sheet-header {
          display: flex;
          flex-direction: row-reverse;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .sheet-title-wrap {
          flex: 1;
          text-align: center;
          padding-top: 6px;
        }

        .sheet-title-wrap h2 {
          margin: 0;
          font-size: 50px;
          font-weight: 600;
          line-height: 1.2;
        }

        .sheet-exam-title {
          margin-top: 8px;
          font-size: 32px;
          font-weight: 600;
        }

        .sheet-logo {
          width: 137px;
          height: 137px;
          border-radius: 9999px;
          overflow: hidden;
          background: #d8d8d8;
          border: 2px solid #b9b9b9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #666;
          flex-shrink: 0;
        }

        .sheet-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sheet-meta-row {
          margin-top: 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          font-size: 32px;
          font-weight: 400;
        }

        .sheet-table-wrap {
          margin-top: 18px;
        }

        .sheet-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          direction: rtl;
          font-size: 20px;
        }

        .sheet-table thead th {
          background: #e8e8e8;
          font-weight: 700;
        }

        .sheet-table th,
        .sheet-table td {
          border: 1px solid #d8d8d8;
          background: #fbfbfb;
          padding: 14px 10px;
          text-align: center;
          vertical-align: middle;
        }

        .sheet-table th:first-child,
        .sheet-table td:first-child {
          width: 50%;
          font-size: 24px;
        }

        .sheet-summary-row {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-size: 24px;
          font-weight: 600;
          color: #222;
        }

        .sheet-footer {
          margin-top: 28px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          color: #4e4e4e;
        }

        .sheet-signatures {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 32px;
          font-weight: 400;
          white-space: nowrap;
        }

        .sheet-motto {
          font-size: 32px;
          font-weight: 400;
          text-align: right;
        }

        @media print {
          @page {
            margin: 0;
          }

          :global([data-sidebar="sidebar"]),
          :global([data-sidebar="header"]),
          :global([class*="group/sidebar-wrapper"]),
          :global(.peer),
          :global([data-slot="sidebar-inset"]),
          :global(header) {
            display: none !important;
            visibility: hidden !important;
          }

          :global(body),
          :global(main) {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          .manager-result-screen {
            display: none !important;
          }

          .manager-print-sheet {
            display: block !important;
            width: 100% !important;
            overflow: visible !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .sheet-inner {
            width: 100% !important;
            margin: 0 !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
