"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
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

type Subject = {
  id: number
  name: string
  level?: string | null
  class?: string | null
  level_id?: number
  class_id?: number
}

export default function TeacherLessonCreatePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [quizFile, setQuizFile] = useState<File | null>(null)
  const [quizUrl, setQuizUrl] = useState("")
  const [quizInputMethod, setQuizInputMethod] = useState<"upload" | "url">("upload")
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    subjectId: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = (await apiFetch("/teacher/subjects")) as { data?: Subject[] }
        setSubjects(Array.isArray(response?.data) ? response.data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل المواد.")
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const subjectOptions = useMemo(() => {
    return subjects.map((subject) => ({
      ...subject,
      label: `${subject.name}${subject.level ? ` - ${subject.level}` : ""}${subject.class ? ` / ${subject.class}` : ""}`,
    }))
  }, [subjects])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    if (!formData.title.trim() || !formData.summary.trim() || !formData.subjectId) {
      setError("من فضلك أكمل بيانات الدرس.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccessMessage(null)
      const payload = new FormData()
      payload.append("title", formData.title.trim())
      payload.append("summary", formData.summary.trim())
      payload.append("subject_id", String(Number(formData.subjectId)))
      if (quizInputMethod === "upload" && quizFile) {
        payload.append("quiz_file", quizFile)
      }
      if (quizInputMethod === "url" && quizUrl.trim()) {
        payload.append("quiz_url", quizUrl.trim())
      }

      const token =
        typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null

      const response = await fetch(`${apiBaseUrl}/teacher/lessons`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      })

      if (!response.ok) {
        let message = "تعذر حفظ الدرس."
        try {
          const errorData = await response.json()
          if (errorData?.message) message = errorData.message
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }
      setSuccessMessage("تم إنشاء الدرس بنجاح.")
      setFormData({ title: "", summary: "", subjectId: "" })
      setQuizFile(null)
      setQuizUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ الدرس.")
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
            <h1 className="text-base font-medium">إضافة درس جديد</h1>
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
                  <p>جارٍ تحميل بيانات المواد...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <form className="grid gap-4" onSubmit={handleSubmit}>
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
                        <option value="" disabled>اختر المادة</option>
                        {subjectOptions.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold">الاختبار (اختياري)</label>
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-[var(--color-surface-alt)] p-4 text-center">
                        <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs">
                          <button
                            type="button"
                            className={`px-4 py-1.5 rounded-full transition ${
                              quizInputMethod === "upload"
                                ? "bg-[var(--color-sidebar-bg)] text-white"
                                : "text-slate-600"
                            }`}
                            onClick={() => {
                              setQuizInputMethod("upload")
                              setQuizUrl("")
                            }}
                          >
                            رفع ملف
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-1.5 rounded-full transition ${
                              quizInputMethod === "url"
                                ? "bg-[var(--color-sidebar-bg)] text-white"
                                : "text-slate-600"
                            }`}
                            onClick={() => {
                              setQuizInputMethod("url")
                              setQuizFile(null)
                            }}
                          >
                            رابط خارجي
                          </button>
                        </div>
                        {quizInputMethod === "upload" ? (
                          <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-slate-600">
                            <input
                              type="file"
                              className="hidden"
                              onChange={(event) => setQuizFile(event.target.files?.[0] ?? null)}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {quizFile ? quizFile.name : "اسحب الملف هنا أو اضغط للاختيار"}
                            </span>
                            <span className="text-xs text-slate-500">
                              ملفات متعددة الصيغ، بحد أقصى 20MB
                            </span>
                          </label>
                        ) : (
                          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2">
                            <input
                              type="url"
                              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                              placeholder="أدخل رابط الاختبار"
                              value={quizUrl}
                              onChange={(event) => setQuizUrl(event.target.value)}
                            />
                            <span className="text-xs text-slate-500">
                              مثال: رابط PDF أو Google Sheet.
                            </span>
                          </div>
                        )}
                      </div>
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
                        {submitting ? "جارٍ الحفظ..." : "حفظ الدرس"}
                      </button>
                      <button
                        type="button"
                        className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600"
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
