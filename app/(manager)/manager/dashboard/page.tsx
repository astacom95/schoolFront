"use client"
import { useEffect, useMemo, useState } from "react"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { WeeklyLessonsBarChart } from "@/components/weekly-lessons-bar-chart"

type LessonSummary = {
  id: number
  title: string
  summary: string
  subject_name: string
  level_name: string
  class_name: string
  created_at?: string
  has_media?: boolean
}

export default function ManagerDashboard() {
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
    [],
  )
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [students, setStudents] = useState<any[]>([])
  const [teachersCount, setTeachersCount] = useState(0)
  const [subjectsCount, setSubjectsCount] = useState(0)
  const [levelsCount, setLevelsCount] = useState(0)
  const [paymentsTotal, setPaymentsTotal] = useState(0)
  const [lessonSummaries, setLessonSummaries] = useState<LessonSummary[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [papers, setPapers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null)

  const managerCards = useMemo(
    () => [
      {
        title: "الطلاب",
        value: String(students.length),
        footerTitle: "متابعة حضور الطلاب",
        footerNote: "اخر تحديث اليوم",
        trend: "none" as const,
        imageSrc: "/assets/graduation-cap-line.svg",
        imageAlt: "الطلاب",
      },
      {
        title: "المعلمين",
        value: String(teachersCount),
        footerTitle: "توزيع المعلمين على الفصول",
        footerNote: "جاهز للمراجعة",
        trend: "up" as const,
        imageSrc: "/assets/mdi_laptop-account.svg",
        imageAlt: "المعلمين",
      },
      {
        title: "المواد",
        value: String(subjectsCount),
        footerTitle: "المحتوى الأكاديمي",
        footerNote: "قيد المراجعة",
        trend: "none" as const,
        imageSrc: "/assets/Vector (1).svg",
        imageAlt: "المواد",
      },
      {
        title: "المستويات",
        value: String(levelsCount),
        footerTitle: "إدارة الهيكل الدراسي",
        footerNote: "محدث باستمرار",
        trend: "down" as const,
        imageSrc: "/assets/Vector (2).svg",
        imageAlt: "المستويات",
      },
      {
        title: "الرسوم",
        value: paymentsTotal.toLocaleString(),
        footerTitle: "متابعة الرسوم والمدفوعات",
        footerNote: "آخر مراجعة اليوم",
        trend: "down" as const,
        imageSrc: "/assets/Vector.svg",
        imageAlt: "الرسوم",
      },
    ],
    [students.length, teachersCount, subjectsCount, levelsCount, paymentsTotal],
  )

  useEffect(() => {
    const getList = async (path: string) => {
      const res = await fetch(`${apiRoot}${path}`, { cache: "no-store" })
      const json = await res.json()
      return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
    }

    const loadCardCounts = async () => {
      try {
        const [teachers, subjects, levels] = await Promise.all([
          getList("/manager/teachers/public"),
          getList("/manager/subjects"),
          getList("/manager/levels"),
        ])
        setTeachersCount(teachers.length)
        setSubjectsCount(subjects.length)
        setLevelsCount(levels.length)
      } catch (error) {
        console.error("فشل جلب إحصائيات بطاقات المدير", error)
        setTeachersCount(0)
        setSubjectsCount(0)
        setLevelsCount(0)
      }
    }
    void loadCardCounts()
  }, [apiRoot])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiRoot}/manager/students/public`, { cache: "no-store" })
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
        const normalized = list.map((item: any, idx: number) => ({
          paid_amount:
            typeof item.paid_amount === "number"
              ? item.paid_amount
              : Array.isArray(item.payments)
                ? item.payments.reduce(
                    (sum: number, payment: any) =>
                      sum + (typeof payment?.amount === "number" ? payment.amount : 0),
                    0,
                  )
                : Number(item.amount ?? 0),
          id: item.id ?? item.student_id ?? idx,
          full_name: item.full_name ?? item.name ?? item.user?.full_name ?? "",
          email: item.email ?? item.user?.email ?? "",
          phone_number: item.phone_number ?? item.user?.phone_number ?? "",
          level: item.level?.name ?? item.level_name ?? item.level ?? "",
          class: item.class?.name ?? item.class_name ?? item.class ?? "",
          gender: item.gender ?? "",
        }))
        setStudents(normalized)
        const nextPaymentsTotal = normalized.reduce(
          (sum: number, student: any) =>
            sum + (Number.isFinite(Number(student.paid_amount)) ? Number(student.paid_amount) : 0),
          0,
        )
        setPaymentsTotal(nextPaymentsTotal)
      } catch (error) {
        console.error("فشل جلب الطلاب", error)
        setStudents([])
        setPaymentsTotal(0)
      }
    }
    void load()
  }, [apiRoot])

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const res = await fetch(`${apiRoot}/manager/lesson-summaries`, { cache: "no-store" })
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
          has_media: Boolean(item.has_media),
        }))
        setLessonSummaries(normalized)
      } catch (error) {
        console.error("فشل جلب ملخصات الدروس", error)
        setLessonSummaries([])
      }
    }
    void loadSummaries()
  }, [apiRoot])

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const res = await fetch(`${apiRoot}/manager/quizzes`, { cache: "no-store" })
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
        setQuizzes(normalized)
      } catch (error) {
        console.error("فشل جلب التدريبات", error)
        setQuizzes([])
      }
    }
    void loadQuizzes()
  }, [apiRoot])

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const res = await fetch(`${apiRoot}/manager/papers-work`, { cache: "no-store" })
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : []
        const normalized = list.map((item: any, idx: number) => ({
          id: item.id ?? idx,
          paper_path: item.paper_path ?? "",
          paper_url: item.paper_url ?? "",
          subject_name: item.subject_name ?? "",
          created_at: item.created_at ?? "",
        }))
        setPapers(normalized)
      } catch (error) {
        console.error("فشل جلب أوراق العمل", error)
        setPapers([])
      }
    }
    void loadPapers()
  }, [apiRoot])

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch(`${apiRoot}/manager/reports`, { cache: "no-store" })
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : []
        const normalized = list.map((item: any, idx: number) => ({
          id: item.id ?? idx,
          student_name: item.student_name ?? "",
          teacher_name: item.teacher_name ?? "",
          subject_name: item.subject_name ?? "",
          level_name: item.level_name ?? "",
          class_name: item.class_name ?? "",
          created_at: item.created_at ?? "",
          student_subject_performance: item.student_subject_performance ?? "",
          academic_progress: item.academic_progress ?? "",
          recommendations: item.recommendations ?? "",
        }))
        setReports(normalized)
      } catch (error) {
        console.error("فشل جلب التقارير", error)
        setReports([])
      }
    }
    void loadReports()
  }, [apiRoot])

  const paperCards = useMemo(() => {
    const fileBaseUrl = apiBase.replace(/\/api\/?$/, "")
    return papers.map((paper: any) => {
      const rawUrl = paper.paper_url ?? paper.paper_path ?? ""
      const fullUrl = rawUrl && rawUrl.startsWith("/storage") ? `${fileBaseUrl}${rawUrl}` : rawUrl
      const cleanUrl = fullUrl.split("?")[0]
      const ext = cleanUrl.split(".").pop()?.toLowerCase() ?? ""
      const isPdf = ext === "pdf"
      const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext)
      return {
        ...paper,
        previewUrl: fullUrl,
        isPdf,
        isImage,
      }
    })
  }, [apiBase, papers])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards items={managerCards} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive lessons={lessonSummaries} />
          </div>
          <div className="px-4 lg:px-6">
            <WeeklyLessonsBarChart lessons={lessonSummaries} />
          </div>
          <div className="px-4 lg:px-6">
            <h2 className="text-sm font-semibold">أوراق العمل</h2>
            {paperCards.length === 0 ? (
              <div className="card mt-4">لا توجد أوراق عمل حالياً.</div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paperCards.map((paper: any) => (
                  <div
                    key={paper.id}
                    className="group rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    <div className="relative h-56 w-full overflow-hidden rounded-lg bg-slate-50">
                      {paper.previewUrl ? (
                        paper.isPdf ? (
                          <iframe
                            title={paper.subject_name ?? "paper"}
                            src={`${paper.previewUrl}#page=1&view=FitH`}
                            className="h-full w-full"
                          />
                        ) : paper.isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={paper.previewUrl}
                            alt={paper.subject_name ?? "paper"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-500">
                            ملف غير مدعوم للمعاينة
                          </div>
                        )
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          لا يوجد ملف
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {paper.subject_name ?? "ورقة عمل"}
                      </div>
                      <div className="text-xs text-slate-500">{paper.created_at ?? "—"}</div>
                      {paper.previewUrl ? (
                        <a
                          href={paper.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#E9F0FF] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-[#DDE7FF]"
                        >
                          فتح
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold">ملخصات الدروس</div>
              <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الدرس</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المرحلة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الصف</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الملخص</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessonSummaries.length > 0 ? (
                      lessonSummaries.map((row) => (
                        <tr key={row.id} className="border-b border-slate-200/80 hover:bg-slate-50">
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
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold">تدريبات الدروس</div>
              <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الدرس</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">المرحلة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الصف</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">رابط التدريب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.length > 0 ? (
                      quizzes.map((row) => (
                        <tr key={row.id} className="border-b border-slate-200/80 hover:bg-slate-50">
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
                                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
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
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold">تقارير الطلاب</div>
              <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
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
                    {reports.length > 0 ? (
                      reports.map((row) => (
                        <>
                          <tr key={row.id} className="border-b border-slate-200/80 hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-700">
                              <button
                                type="button"
                                aria-label="عرض التفاصيل"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-600 transition hover:bg-slate-50"
                                onClick={() =>
                                  setExpandedReportId((current) =>
                                    current === row.id ? null : row.id,
                                  )
                                }
                              >
                                {expandedReportId === row.id ? "▲" : "▼"}
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
                          {expandedReportId === row.id ? (
                            <tr className="border-b border-slate-200/80 bg-slate-50/80">
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
            </div>
          </div>
          <DataTable data={students} />
        </div>
      </div>
    </div>
  )
}
