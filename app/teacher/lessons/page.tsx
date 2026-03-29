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

import Broadcaster from "@/app/components/Broadcaster"
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
  media_id: number
  whip_url: string
  stream_name: string
  playback_flv_url: string
}

type ActiveLiveSession = {
  lessonId: number
  whipUrl: string
  streamName: string
  playbackFlvUrl: string
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
  const [endingLessonId, setEndingLessonId] = useState<number | null>(null)
  const [activeLive, setActiveLive] = useState<ActiveLiveSession | null>(null)
  const [liveError, setLiveError] = useState<string | null>(null)

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

    setSubjects(Array.isArray(subjectsResponse?.data) ? subjectsResponse.data : [])
    setRecordedLessons(Array.isArray(lessonsResponse?.data) ? lessonsResponse.data : [])
    setTeacherInfo(lessonsResponse?.teacher ?? null)
    setLessons(Array.isArray(allLessonsResponse?.data) ? allLessonsResponse.data : [])
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
      setLiveError(null)
      const response = (await apiFetch(`/teacher/lessons/${lessonId}/start-live`, {
        method: "POST",
      })) as LiveStartResponse

      if (!response?.whip_url || !response?.stream_name || !response?.playback_flv_url) {
        throw new Error("تعذر بدء البث المباشر.")
      }

      setActiveLive({
        lessonId,
        whipUrl: response.whip_url,
        streamName: response.stream_name,
        playbackFlvUrl: response.playback_flv_url,
      })

      await loadPageData()
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : "تعذر بدء البث المباشر.")
    } finally {
      setStartingLessonId(null)
    }
  }

  const handleEndLive = async (lessonId: number) => {
    try {
      setEndingLessonId(lessonId)
      setLiveError(null)
      await apiFetch(`/teacher/lessons/${lessonId}/end-live`, {
        method: "POST",
      })
      setActiveLive((current) => (current?.lessonId === lessonId ? null : current))
      await loadPageData()
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : "تعذر إنهاء البث.")
    } finally {
      setEndingLessonId(null)
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
                    <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
                      {recordedLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="relative h-[170px] w-[230px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-surface-alt)]"
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
                      <div className="mt-1 text-xs text-slate-500">التخصصات</div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {(teacherInfo?.specializations ?? []).length === 0 ? (
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                            لا توجد تخصصات مسجلة
                          </span>
                        ) : (
                          teacherInfo?.specializations?.map((spec) => (
                            <span
                              key={spec.id}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                            >
                              {spec.subject_name ?? "مادة"}{" "}
                              {spec.level_name ? `- ${spec.level_name}` : ""}{" "}
                              {spec.class_name ? `- ${spec.class_name}` : ""}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">كل الدروس</h2>
                  <span className="text-xs text-slate-500">عرض جميع الدروس المتاحة.</span>
                </div>
                {lessonError ? (
                  <div className="card text-red-500 mt-4">{lessonError}</div>
                ) : lessons.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lessons.map((lesson) => {
                      const liveForCard = activeLive?.lessonId === lesson.id
                      return (
                        <div key={lesson.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                          <div>
                            <h3 className="text-base font-semibold">{lesson.title}</h3>
                            <p className="text-sm text-slate-500">{lesson.subject_name ?? "—"}</p>
                            <p className="text-xs text-slate-400">{lesson.created_at ?? "—"}</p>
                          </div>

                          <Link
                            href={`/teacher/lessons/${lesson.id}`}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-[var(--color-text)] hover:bg-slate-50"
                          >
                            عرض تفاصيل الدرس
                          </Link>

                          {liveError && liveForCard ? <div className="text-sm text-red-600">{liveError}</div> : null}

                          {!lesson.has_media && !liveForCard ? (
                            <button
                              type="button"
                              onClick={() => handleStartLive(lesson.id)}
                              className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                              disabled={startingLessonId === lesson.id}
                            >
                              {startingLessonId === lesson.id ? "جارٍ التحضير..." : "تهيئة غرفة البث"}
                            </button>
                          ) : null}

                          {liveForCard && activeLive ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="mb-2 text-xs font-semibold text-slate-700">البث المباشر</div>
                              <div className="mb-3 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
                                رابط المشاهدة: {activeLive.playbackFlvUrl}
                              </div>
                              <Broadcaster whipUrl={activeLive.whipUrl} />
                              <button
                                type="button"
                                onClick={() => handleEndLive(lesson.id)}
                                className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                                disabled={endingLessonId === lesson.id}
                              >
                                {endingLessonId === lesson.id ? "جارٍ إنهاء البث..." : "إنهاء البث وحفظ التسجيل"}
                              </button>
                            </div>
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
