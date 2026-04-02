"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChartIcon,
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  HomeIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

import { apiFetch } from "@/lib/api/client"
import { NavMain } from "@/components/nav-main"
import { SectionCards } from "@/components/section-cards"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TeacherSidebarFooter } from "@/components/teacher-sidebar-footer"

type Subject = {
  id: number
  name: string
  total_lessons?: number
  level?: string | null
  class?: string | null
}

type RecordedLesson = {
  id: number
  title: string
  subject_name?: string | null
  created_at?: string | null
  meet_link?: string | null
}

type Lesson = {
  id: number
  title: string
  subject_name?: string | null
  created_at?: string | null
  has_media?: boolean
  meet_link?: string | null
}

type TeacherInfo = {
  name?: string | null
  email?: string | null
  phone_number?: string | null
  personal_image_url?: string | null
  specializations?: {
    id: number
    subject_name?: string | null
    level_name?: string | null
    class_name?: string | null
  }[]
}

type LiveStartResponse = {
  lesson_id: number
  meet_link: string
  has_media: boolean
  is_recorded: boolean
}

const teacherNav = [
  {
    title: "لوحة التحكم",
    url: "/teacher/dashboard",
    icon: HomeIcon,
  },
  {
    title: "الدروس",
    url: "/teacher/lessons",
    icon: BookOpenIcon,
  },
  {
    title: "حضور الطلاب",
    url: "/teacher/attendance",
    icon: UsersIcon,
  },
  {
    title: "الدرجات",
    url: "/teacher/marks",
    icon: ClipboardListIcon,
  },
  {
    title: "الاختبارات الشهرية",
    url: "/teacher/monthly-tests",
    icon: FileTextIcon,
  },
  {
    title: "أوراق العمل",
    url: "/teacher/paper-work",
    icon: FileTextIcon,
  },
  {
    title: "المواد",
    url: "/teacher/subjects",
    icon: LayersIcon,
  },
  {
    title: "التقارير",
    url: "/teacher/reports",
    icon: BarChartIcon,
  },
]

export default function TeacherLessonsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [recordedLessons, setRecordedLessons] = useState<RecordedLesson[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lessonError, setLessonError] = useState<string | null>(null)
  const [startingLessonId, setStartingLessonId] = useState<number | null>(null)
  const [liveErrorByLesson, setLiveErrorByLesson] = useState<Record<number, string>>({})
  const [deleteErrorByLesson, setDeleteErrorByLesson] = useState<Record<number, string>>({})
  const [meetLinkByLesson, setMeetLinkByLesson] = useState<Record<number, string>>({})

  const loadPageData = async () => {
    const [subjectsResponse, lessonsResponse, allLessonsResponse] = (await Promise.all([
      apiFetch("/teacher/subjects"),
      apiFetch("/teacher/lessons?recorded=1"),
      apiFetch("/teacher/lessons"),
    ])) as [
      { data?: Subject[] },
      { data?: RecordedLesson[]; teacher?: TeacherInfo },
      { data?: Lesson[] }
    ]

    const all = Array.isArray(allLessonsResponse?.data) ? allLessonsResponse.data : []
    setSubjects(Array.isArray(subjectsResponse?.data) ? subjectsResponse.data : [])
    setRecordedLessons(Array.isArray(lessonsResponse?.data) ? lessonsResponse.data : [])
    setTeacherInfo(lessonsResponse?.teacher ?? null)
    setLessons(all)
    setMeetLinkByLesson((current) => {
      const next = { ...current }
      all.forEach((lesson) => {
        if (!next[lesson.id] && lesson.meet_link) {
          next[lesson.id] = lesson.meet_link
        }
      })
      return next
    })
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setLessonError(null)
        await loadPageData()
      } catch (err) {
        const message = err instanceof Error ? err.message : "تعذر تحميل البيانات."
        setError(message)
        setLessonError(message)
        setSubjects([])
        setRecordedLessons([])
        setTeacherInfo(null)
        setLessons([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const subjectCards = useMemo(() => {
    return subjects.map((subject) => ({
      title: subject.name,
      value: String(subject.total_lessons ?? 0),
      footerTitle: subject.level ? `المرحلة: ${subject.level}` : "مرحلة غير محددة",
      footerNote: subject.class ? `الفصل: ${subject.class}` : "فصل غير محدد",
      trend: "none" as const,
      imageSrc: "/assets/Vector (1).svg",
      imageAlt: subject.name,
    }))
  }, [subjects])

  const handleStartLive = async (lessonId: number) => {
    try {
      setStartingLessonId(lessonId)
      setLiveErrorByLesson((current) => ({ ...current, [lessonId]: "" }))

      const meetLink = (meetLinkByLesson[lessonId] ?? "").trim()
      if (!meetLink) {
        setLiveErrorByLesson((current) => ({
          ...current,
          [lessonId]: "ضع رابط Google Meet أولاً.",
        }))
        return
      }

      const response = (await apiFetch(`/teacher/lessons/${lessonId}/start-live`, {
        method: "POST",
        body: JSON.stringify({ meet_link: meetLink }),
      })) as LiveStartResponse

      if (!response?.meet_link) {
        throw new Error("تعذر حفظ رابط الاجتماع.")
      }

      setMeetLinkByLesson((current) => ({
        ...current,
        [lessonId]: response.meet_link,
      }))

      await loadPageData()
    } catch (err) {
      setLiveErrorByLesson((current) => ({
        ...current,
        [lessonId]: err instanceof Error ? err.message : "تعذر بدء الجلسة.",
      }))
    } finally {
      setStartingLessonId(null)
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع بعد الحذف.")
    if (!confirmed) return

    try {
      setDeletingLessonId(lessonId)
      setDeleteErrorByLesson((current) => ({ ...current, [lessonId]: "" }))
      await apiFetch(`/teacher/lessons/${lessonId}`, { method: "DELETE" })
      await loadPageData()
    } catch (err) {
      setDeleteErrorByLesson((current) => ({
        ...current,
        [lessonId]: err instanceof Error ? err.message : "تعذر حذف الدرس.",
      }))
    } finally {
      setDeletingLessonId(null)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar side="right" variant="inset" collapsible="offcanvas">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="/teacher/dashboard">
                  <HomeIcon className="h-5 w-5" />
                  <span className="text-base font-semibold">منصة المعلم</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={teacherNav} />
        </SidebarContent>
        <SidebarFooter>
          <TeacherSidebarFooter />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-base font-medium">مواد المعلم</h1>
            <div className="mr-auto">
              <Link
                href="/teacher/lessons/create"
                className="inline-flex h-9 items-center rounded-xl bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                إنشاء درس جديد
              </Link>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-8">
              {loading ? (
                <div className="card">جارٍ تحميل مواد المعلم...</div>
              ) : error ? (
                <div className="card text-red-500">{error}</div>
              ) : subjectCards.length > 0 ? (
                <div className="px-4 lg:px-6">
                  <SectionCards items={subjectCards} />
                </div>
              ) : (
                <div className="px-4 lg:px-6">
                  <div className="card">لا توجد مواد مرتبطة بهذا المعلم حالياً.</div>
                </div>
              )}

              <div className="px-4 lg:px-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="text-right text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">الأستاذ : {teacherInfo?.name ?? "—"}</p>
                      <p className="text-xs text-slate-500">
                        {teacherInfo?.email ?? "—"} {teacherInfo?.phone_number ? `+ ${teacherInfo.phone_number}` : ""}
                      </p>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">الدروس المسجلة</h2>
                  </div>
                  {lessonError ? (
                    <div className="card text-red-500 mt-4">{lessonError}</div>
                  ) : recordedLessons.length > 0 ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {recordedLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="rounded-xl border border-slate-200 bg-[var(--color-surface-alt)] p-4"
                        >
                          <div className="text-sm font-semibold text-slate-900">{lesson.title}</div>
                          <div className="mt-1 text-xs text-slate-500">{lesson.subject_name ?? "—"}</div>
                          <a
                            href={lesson.meet_link ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex text-xs font-semibold text-[var(--color-sidebar-bg)]"
                          >
                            فتح رابط الاجتماع
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-alt)] text-lg font-semibold text-slate-600">
                        {teacherInfo?.personal_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              teacherInfo.personal_image_url.startsWith("/storage")
                                ? `${fileBaseUrl}${teacherInfo.personal_image_url}`
                                : teacherInfo.personal_image_url
                            }
                            alt={teacherInfo?.name ?? "teacher"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (teacherInfo?.name ?? "—").toString().slice(0, 1)
                        )}
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-900">
                        {teacherInfo?.name ?? "—"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">كل الدروس</h2>
                  <span className="text-xs text-slate-500">GO ثم الصق رابط Meet ثم Start Now.</span>
                </div>
                {lessonError ? (
                  <div className="card text-red-500 mt-4">{lessonError}</div>
                ) : lessons.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lessons.map((lesson) => {
                      const inputValue = meetLinkByLesson[lesson.id] ?? ""
                      const lessonErrorText = liveErrorByLesson[lesson.id]
                      const lessonDeleteErrorText = deleteErrorByLesson[lesson.id]
                      return (
                        <div key={lesson.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                          <div>
                            <h3 className="text-base font-semibold">{lesson.title}</h3>
                            <p className="text-sm text-slate-500">{lesson.subject_name ?? "—"}</p>
                            <p className="text-xs text-slate-400">{lesson.created_at ?? "—"}</p>
                          </div>

                          <div>
                            <Link
                              href={`/teacher/lessons/${lesson.id}`}
                              className="inline-flex w-full h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-[var(--color-text)] hover:bg-slate-50"
                            >
                              عرض التفاصيل
                            </Link>
                         
                          </div>

                          <a
                            href="https://mail.google.com/mail/u/0/#calls"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white transition hover:opacity-90"
                          >
                            GO
                          </a>

                          <input
                            type="url"
                            value={inputValue}
                            placeholder="https://meet.google.com/ayc-obyo-ojq"
                            onChange={(event) =>
                              setMeetLinkByLesson((current) => ({
                                ...current,
                                [lesson.id]: event.target.value,
                              }))
                            }
                            className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                          />

                          <button
                            type="button"
                            onClick={() => handleStartLive(lesson.id)}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                            disabled={startingLessonId === lesson.id}
                          >
                            {startingLessonId === lesson.id ? "جارٍ الحفظ..." : "Start Now"}
                          </button>

                     

                          {lessonErrorText ? (
                            <div className="text-sm text-red-600">{lessonErrorText}</div>
                          ) : null}
                          {lessonDeleteErrorText ? (
                            <div className="text-sm text-red-600">{lessonDeleteErrorText}</div>
                          ) : null}

                          {lesson.has_media && lesson.meet_link ? (
                            <a
                              href={lesson.meet_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold bg-green-100  rounded-lg  text-center p-3 text-emerald-700"
                            >
                              الرابط محفوظ - فتح الاجتماع
                            </a>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="card mt-4">لا توجد دروس حتى الآن.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
