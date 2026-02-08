"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  BarChartIcon,
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  HomeIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react"

import { apiFetch } from "@/lib/api/client"
import { NavMain } from "@/components/nav-main"
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

type LessonMedia = {
  id: number
  provider?: string | null
  media_type?: string | null
  status?: string | null
  thumbnail_url?: string | null
  duration_seconds?: number | null
  source_url?: string | null
  cf_vod_playback_id?: string | null
  yt_video_id?: string | null
}

type LessonDetails = {
  id: number
  title: string
  summary?: string | null
  subject_name?: string | null
  level_name?: string | null
  class_name?: string | null
  created_at?: string | null
  watch_url?: string | null
  embed_url?: string | null
  video_url?: string | null
  media?: LessonMedia | null
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

export default function TeacherLessonDetailsPage() {
  const params = useParams()
  const lessonId = Number(params?.id)
  const [lesson, setLesson] = useState<LessonDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!lessonId) {
        setLesson(null)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const response = (await apiFetch(`/teacher/lessons/${lessonId}`)) as {
          data?: LessonDetails
        }
        setLesson(response?.data ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل تفاصيل الدرس.")
        setLesson(null)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [lessonId])

  const hasVideo = Boolean(lesson?.embed_url || lesson?.video_url)
  const isLive = lesson?.media?.status === "live"

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
            <h1 className="text-base font-medium">تفاصيل الدرس</h1>
            <div className="mr-auto">
              <Link
                href="/teacher/lessons"
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-[var(--color-text)] hover:bg-slate-50"
              >
                العودة للدروس
              </Link>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col bg-[#F5F7FA]" dir="rtl">
          <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10">
            {loading ? (
              <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
                جارٍ تحميل تفاصيل الدرس...
              </div>
            ) : error ? (
              <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-6 text-sm text-red-600 shadow-sm">
                {error}
              </div>
            ) : !lesson ? (
              <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
                لا توجد بيانات لهذا الدرس.
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_320px]">
                  <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
                    {hasVideo ? (
                      lesson.embed_url ? (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                          <iframe
                            title={lesson.title}
                            src={lesson.embed_url}
                            className="absolute inset-0 h-full w-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                          <video
                            className="absolute inset-0 h-full w-full"
                            controls
                            src={lesson.video_url ?? undefined}
                          />
                        </div>
                      )
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-slate-500">
                        لا يتوفر فيديو لهذا الدرس بعد.
                      </div>
                    )}
                    {isLive ? (
                      <div className="absolute left-8 top-1/2 -translate-y-1/2">
                        <div className="flex items-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-white shadow-lg">
                          <span className="h-5 w-5 rounded-full bg-white" />
                          <span className="text-3xl font-semibold tracking-wide">LIVE</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-700">اسم الدرس</div>
                      <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                        {lesson.title}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-700">المادة</div>
                      <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                        {lesson.subject_name ?? "—"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-700">التاريخ</div>
                      <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                        {lesson.created_at ?? "—"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-700">تدريبات</div>
                      <div className="flex h-52 flex-col items-center justify-center gap-4 rounded-lg border border-transparent bg-emerald-100 text-center text-sm font-semibold text-slate-900 shadow-sm opacity-70">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-500">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 64 64"
                            className="h-14 w-14 text-white"
                            fill="currentColor"
                          >
                            <path d="M40 6H18c-2.2 0-4 1.8-4 4v44c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V20L40 6zm0 4.5L49.5 20H40v-9.5zM22 28h20v6H22v-6zm0 12h20v6H22v-6z" />
                          </svg>
                        </div>
                        لا يوجد تدريب متاح
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center text-lg font-semibold text-slate-800">ملخص الدرس</div>
                  <div className="rounded-lg bg-white px-6 py-5 text-sm leading-7 text-slate-700 shadow-sm">
                    {lesson.summary ?? "لا يوجد وصف لهذا الدرس."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
