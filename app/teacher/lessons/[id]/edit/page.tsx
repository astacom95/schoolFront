"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
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

type Subject = {
  id: number
  name: string
  level?: string | null
  class?: string | null
}

type LessonDetails = {
  id: number
  title: string
  summary?: string | null
  subject_id?: number | null
}

export default function TeacherLessonEditPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const params = useParams()
  const router = useRouter()
  const lessonId = Number(params?.id)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    subjectId: "",
  })

  useEffect(() => {
    const load = async () => {
      if (!lessonId) {
        setError("رقم الدرس غير صالح.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const [subjectsResponse, lessonResponse] = (await Promise.all([
          apiFetch("/teacher/subjects"),
          apiFetch(`/teacher/lessons/${lessonId}`),
        ])) as [{ data?: Subject[] }, { data?: LessonDetails }]

        const nextSubjects = Array.isArray(subjectsResponse?.data) ? subjectsResponse.data : []
        const lesson = lessonResponse?.data
        setSubjects(nextSubjects)

        if (!lesson) {
          throw new Error("لم يتم العثور على الدرس.")
        }

        setFormData({
          title: lesson.title ?? "",
          summary: lesson.summary ?? "",
          subjectId: lesson.subject_id ? String(lesson.subject_id) : "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الدرس.")
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [lessonId])

  const subjectOptions = useMemo(() => {
    return subjects.map((subject) => ({
      ...subject,
      label: `${subject.name}${subject.level ? ` - ${subject.level}` : ""}${subject.class ? ` / ${subject.class}` : ""}`,
    }))
  }, [subjects])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting || !lessonId) return

    if (!formData.title.trim() || !formData.summary.trim() || !formData.subjectId) {
      setError("من فضلك أكمل بيانات الدرس.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccessMessage(null)
      await apiFetch(`/teacher/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: formData.title.trim(),
          summary: formData.summary.trim(),
          subject_id: Number(formData.subjectId),
        }),
      })

      setSuccessMessage("تم تحديث الدرس بنجاح.")
      setTimeout(() => {
        router.push("/teacher/lessons")
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث الدرس.")
    } finally {
      setSubmitting(false)
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
            <h1 className="text-base font-medium">تعديل الدرس</h1>
            <div className="mr-auto">
              <Link
                href="/teacher/lessons"
                className="inline-flex h-9 items-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
              >
                العودة للدروس
              </Link>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="card">
                {loading ? (
                  <p>جارٍ تحميل بيانات الدرس...</p>
                ) : (
                  <form className="grid gap-4" onSubmit={handleSubmit}>
                    {error ? <p className="text-red-500">{error}</p> : null}
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold">عنوان الدرس</label>
                      <input
                        type="text"
                        name="title"
                        placeholder="اكتب عنوان الدرس"
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3"
                        value={formData.title}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, title: event.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold">وصف مختصر</label>
                      <textarea
                        name="summary"
                        placeholder="ملخص قصير عن محتوى الدرس"
                        className="min-h-[120px] rounded-lg border border-slate-200 bg-white px-3 py-2"
                        value={formData.summary}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, summary: event.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold">المادة / الصف</label>
                      <select
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3"
                        value={formData.subjectId}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, subjectId: event.target.value }))
                        }
                      >
                        <option value="" disabled>
                          اختر المادة
                        </option>
                        {subjectOptions.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {successMessage ? (
                      <p className="text-green-600 font-semibold">{successMessage}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="h-11 rounded-lg bg-[var(--color-sidebar-bg)] px-5 text-sm font-semibold text-white disabled:opacity-60"
                        disabled={submitting}
                      >
                        {submitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                      </button>
                      <button
                        type="button"
                        className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600"
                        onClick={() => router.push("/teacher/lessons")}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
