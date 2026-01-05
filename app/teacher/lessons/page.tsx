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
import Broadcaster from "@/app/components/Broadcaster"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

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
  thumbnail_url?: string | null
  created_at?: string | null
}

type Lesson = {
  id: number
  title: string
  subject_name?: string | null
  created_at?: string | null
  has_media?: boolean
}

type TeacherInfo = {
  name?: string | null
  email?: string | null
  phone_number?: string | null
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
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [recordedLessons, setRecordedLessons] = useState<RecordedLesson[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lessonError, setLessonError] = useState<string | null>(null)
  const [startingLessonId, setStartingLessonId] = useState<number | null>(null)
  const [broadcastLessonId, setBroadcastLessonId] = useState<number | null>(null)
  const [whipUrl, setWhipUrl] = useState<string | null>(null)
  const [broadcastError, setBroadcastError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setLessonError(null)
        const [subjectsResponse, lessonsResponse, allLessonsResponse] = (await Promise.all([
          apiFetch("/teacher/subjects"),
          apiFetch("/teacher/lessons?recorded=1"),
          apiFetch("/teacher/lessons"),
        ])) as [
          { data?: Subject[] },
          { data?: RecordedLesson[]; teacher?: TeacherInfo },
          { data?: Lesson[] }
        ]
        setSubjects(Array.isArray(subjectsResponse?.data) ? subjectsResponse.data : [])
        setRecordedLessons(Array.isArray(lessonsResponse?.data) ? lessonsResponse.data : [])
        setTeacherInfo(lessonsResponse?.teacher ?? null)
        setLessons(Array.isArray(allLessonsResponse?.data) ? allLessonsResponse.data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل المواد.")
        setSubjects([])
        setRecordedLessons([])
        setTeacherInfo(null)
        setLessons([])
        setLessonError(err instanceof Error ? err.message : "تعذر تحميل الدروس المسجلة.")
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

  const handleStartBrowserLive = async (lessonId: number) => {
    try {
      setStartingLessonId(lessonId)
      setBroadcastError(null)
      setBroadcastLessonId(lessonId)
      await apiFetch(`/teacher/lessons/${lessonId}/start-live-youtube`, {
        method: "POST",
      })
      const response = (await apiFetch(`/teacher/lessons/${lessonId}/whip`)) as {
        whipUrl?: string
        whip_url?: string
      }
      const url = response?.whipUrl || response?.whip_url
      if (!url) {
        throw new Error("تعذر الحصول على رابط البث.")
      }
      setWhipUrl(url)
      const refresh = (await apiFetch("/teacher/lessons")) as { data?: Lesson[] }
      setLessons(Array.isArray(refresh?.data) ? refresh.data : [])
    } catch (err) {
      setBroadcastError(err instanceof Error ? err.message : "تعذر بدء البث المباشر.")
      setWhipUrl(null)
    } finally {
      setStartingLessonId(null)
    }
  }

  const handleCloseBroadcaster = () => {
    setBroadcastLessonId(null)
    setWhipUrl(null)
    setBroadcastError(null)
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
      </Sidebar>
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <h1 className="text-base font-medium">مواد المعلم</h1>
            <div className="mr-auto">
              <Link
                href="/teacher/lessons/create"
                className="inline-flex h-9 items-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
              >
                إنشاء درس جديد
              </Link>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {loading ? (
                <div className="card">جارٍ تحميل مواد المعلم...</div>
              ) : error ? (
                <div className="card text-red-500">{error}</div>
              ) : subjectCards.length > 0 ? (
                <SectionCards items={subjectCards} />
              ) : (
                <div className="card">لا توجد مواد مرتبطة بهذا المعلم حالياً.</div>
              )}
              <div className="px-4 lg:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="text-right text-sm text-black">
                    <p>الأستاذ : {teacherInfo?.name ?? "—"}</p>
                    <p>
                      {teacherInfo?.email ?? "—"} {teacherInfo?.phone_number ? `+ ${teacherInfo.phone_number}` : ""}
                    </p>
                  </div>
                  <h2 className="text-2xl font-semibold">الدروس المسجلة</h2>
                </div>
                {lessonError ? (
                  <div className="card text-red-500 mt-4">{lessonError}</div>
                ) : recordedLessons.length > 0 ? (
                  <div className="mt-4 flex gap-8 overflow-x-auto pb-2">
                    {recordedLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="relative h-[165px] w-[212px] shrink-0 overflow-hidden rounded-xl border-2 border-[#558E99] bg-[#EAF6FC]"
                      >
                        {lesson.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={lesson.thumbnail_url}
                            alt={lesson.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                            بدون صورة
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card mt-4">لا توجد دروس مسجلة متاحة حالياً.</div>
                )}
              </div>
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">كل الدروس</h2>
                </div>
                {lessonError ? (
                  <div className="card text-red-500 mt-4">{lessonError}</div>
                ) : lessons.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="card flex flex-col gap-3">
                        <div>
                          <h3 className="text-base font-semibold">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">{lesson.subject_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{lesson.created_at ?? "—"}</p>
                        </div>
                        <Link
                          href={`/teacher/lessons/${lesson.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-[var(--color-text)] hover:bg-slate-50"
                        >
                          عرض تفاصيل الدرس
                        </Link>
                        {broadcastError && broadcastLessonId === lesson.id ? (
                          <div className="text-sm text-red-600">{broadcastError}</div>
                        ) : null}
                        {!lesson.has_media && (
                          <button
                            type="button"
                            onClick={() => handleStartBrowserLive(lesson.id)}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                            disabled={startingLessonId === lesson.id}
                          >
                            {startingLessonId === lesson.id ? "جارٍ البدء..." : "بدء البث من المتصفح"}
                          </button>
                        )}
                        {broadcastLessonId === lesson.id && whipUrl ? (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="mb-2 text-xs text-slate-500 break-all">
                              WHIP: {whipUrl}
                            </div>
                            <div className="mb-3 text-xs text-slate-500">
                              يتم بث الفيديو من المتصفح ثم يُعاد بثه إلى يوتيوب تلقائياً.
                            </div>
                            <Broadcaster whipUrl={whipUrl} onStop={handleCloseBroadcaster} />
                          </div>
                        ) : null}
                      </div>
                    ))}
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
