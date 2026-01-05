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
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
            {loading ? (
              <div className="card">جارٍ تحميل تفاصيل الدرس...</div>
            ) : error ? (
              <div className="card text-red-500">{error}</div>
            ) : !lesson ? (
              <div className="card">لا توجد بيانات لهذا الدرس.</div>
            ) : (
              <>
                <div className="card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="text-right">
                      <h2 className="text-2xl font-semibold">{lesson.title}</h2>
                      <p className="text-sm text-slate-500">{lesson.subject_name ?? "—"}</p>
                      <p className="text-xs text-slate-500">{lesson.created_at ?? "—"}</p>
                    </div>
                    {lesson.watch_url ? (
                      <a
                        href={lesson.watch_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
                      >
                        فتح في يوتيوب
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">المرحلة</p>
                      <p>{lesson.level_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">الفصل</p>
                      <p>{lesson.class_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">نوع الوسائط</p>
                      <p>{lesson.media?.media_type ?? "—"}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{lesson.summary ?? "لا يوجد وصف لهذا الدرس."}</p>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">مشاهدة التسجيل</h3>
                    {lesson.media?.status ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {lesson.media.status}
                      </span>
                    ) : null}
                  </div>
                  {!hasVideo ? (
                    <div className="mt-3 text-sm text-slate-600">لا يتوفر فيديو لهذا الدرس بعد.</div>
                  ) : lesson.embed_url ? (
                    <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-slate-200">
                      <iframe
                        title={lesson.title}
                        src={lesson.embed_url}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <video
                        className="w-full rounded-lg border border-slate-200"
                        controls
                        src={lesson.video_url ?? undefined}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
