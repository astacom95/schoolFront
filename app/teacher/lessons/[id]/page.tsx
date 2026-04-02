"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TeacherSidebarFooter } from "@/components/teacher-sidebar-footer"

type LessonDetails = {
  id: number
  title: string
  summary?: string | null
  subject_name?: string | null
  level_name?: string | null
  class_name?: string | null
  created_at?: string | null
  meet_link?: string | null
  has_media?: boolean
}

const teacherNav = [
  { title: "لوحة التحكم", url: "/teacher/dashboard", icon: HomeIcon },
  { title: "الدروس", url: "/teacher/lessons", icon: BookOpenIcon },
  { title: "حضور الطلاب", url: "/teacher/attendance", icon: UsersIcon },
  { title: "الدرجات", url: "/teacher/marks", icon: ClipboardListIcon },
  { title: "الاختبارات الشهرية", url: "/teacher/monthly-tests", icon: FileTextIcon },
  { title: "أوراق العمل", url: "/teacher/paper-work", icon: FileTextIcon },
  { title: "المواد", url: "/teacher/subjects", icon: LayersIcon },
  { title: "التقارير", url: "/teacher/reports", icon: BarChartIcon },
]

export default function TeacherLessonDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = Number(params?.id)
  const [lesson, setLesson] = useState<LessonDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteLesson = async () => {
    if (!lessonId) return
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع بعد الحذف.")
    if (!confirmed) return

    try {
      setDeleting(true)
      setError(null)
      await apiFetch(`/teacher/lessons/${lessonId}`, { method: "DELETE" })
      router.push("/teacher/lessons")
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف الدرس.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar side="right" variant="inset" collapsible="offcanvas">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
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
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">{lesson.title}</h2>
                <p className="text-sm text-slate-500">{lesson.subject_name ?? "—"}</p>
                <p className="text-sm text-slate-600">{lesson.summary ?? "لا يوجد وصف لهذا الدرس."}</p>
                <p className="text-xs text-slate-400">{lesson.created_at ?? "—"}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/teacher/lessons/${lesson.id}/edit`}
                    className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    تعديل الدرس
                  </Link>
                  <button
                    type="button"
                    onClick={handleDeleteLesson}
                    disabled={deleting}
                    className="inline-flex h-10 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    {deleting ? "جارٍ الحذف..." : "حذف الدرس"}
                  </button>
                </div>

                {lesson.meet_link ? (
                  <a
                    href={lesson.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 w-fit items-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-semibold text-white"
                  >
                    فتح اجتماع Google Meet
                  </a>
                ) : (
                  <div className="text-sm text-slate-500">لم يتم حفظ رابط Meet لهذا الدرس بعد.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
