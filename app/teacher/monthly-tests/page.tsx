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

type SubjectOption = {
  id: number
  name: string
  level_id?: number | null
  class_id?: number | null
  level?: string | null
  class?: string | null
}

type MonthlyTestItem = {
  id: number
  test_url: string
  test_url_display?: string | null
  subject_id: number
  subject_name?: string | null
  level_id: number
  level_name?: string | null
  class_id: number
  class_name?: string | null
  created_at?: string | null
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

export default function TeacherMonthlyTestsPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [tests, setTests] = useState<MonthlyTestItem[]>([])
  const [levelId, setLevelId] = useState<number | "">("")
  const [classId, setClassId] = useState<number | "">("")
  const [subjectId, setSubjectId] = useState<number | "">("")
  const [testFile, setTestFile] = useState<File | null>(null)
  const [testUrl, setTestUrl] = useState("")
  const [inputMethod, setInputMethod] = useState<"upload" | "url">("upload")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = (await apiFetch("/teacher/subjects")) as { data?: SubjectOption[] }
        setSubjects(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setSubjects([])
      }
    }
    void loadSubjects()
  }, [])

  const loadTests = async () => {
    try {
      const params = new URLSearchParams()
      if (levelId) params.set("level_id", String(levelId))
      if (classId) params.set("class_id", String(classId))
      if (subjectId) params.set("subject_id", String(subjectId))
      const response = (await apiFetch(`/teacher/monthly-tests?${params.toString()}`)) as {
        data?: MonthlyTestItem[]
      }
      setTests(Array.isArray(response?.data) ? response.data : [])
    } catch {
      setTests([])
    }
  }

  useEffect(() => {
    void loadTests()
  }, [levelId, classId, subjectId])

  const levels = useMemo(() => {
    const map = new Map<number, string>()
    subjects.forEach((subject) => {
      if (subject.level_id && subject.level) {
        map.set(subject.level_id, subject.level)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [subjects])

  const classes = useMemo(() => {
    const map = new Map<number, string>()
    subjects.forEach((subject) => {
      const matchesLevel = !levelId || subject.level_id === levelId
      if (matchesLevel && subject.class_id && subject.class) {
        map.set(subject.class_id, subject.class)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [subjects, levelId])

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      if (levelId && subject.level_id !== levelId) return false
      if (classId && subject.class_id !== classId) return false
      return true
    })
  }, [subjects, levelId, classId])

  const handleLevelChange = (value: number | "") => {
    setLevelId(value)
    setClassId("")
    setSubjectId("")
  }

  const handleClassChange = (value: number | "") => {
    setClassId(value)
    setSubjectId("")
  }

  const handleAddTest = async () => {
    const hasUpload = inputMethod === "upload" && !!testFile
    const hasUrl = inputMethod === "url" && !!testUrl.trim()

    if (!levelId || !classId || !subjectId || (!hasUpload && !hasUrl)) {
      setError("اختر المرحلة والصف والمادة ثم أضف الملف أو الرابط قبل الحفظ.")
      setSuccess(null)
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const formData = new FormData()
      if (testFile) formData.append("test_file", testFile)
      if (testUrl.trim()) formData.append("test_url", testUrl.trim())
      formData.append("level_id", String(levelId))
      formData.append("class_id", String(classId))
      formData.append("subject_id", String(subjectId))

      const token =
        typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null

      const response = await fetch(`${apiBaseUrl}/teacher/monthly-tests`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        let message = "تعذر حفظ الاختبار الشهري."
        try {
          const errorData = await response.json()
          if (errorData?.message) message = errorData.message
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      setTestFile(null)
      setTestUrl("")
      setSuccess("تمت إضافة الاختبار الشهري بنجاح.")
      await loadTests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ الاختبار الشهري.")
      setSuccess(null)
    } finally {
      setSaving(false)
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
            <h1 className="text-base font-medium">الاختبارات الشهرية</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-slate-500">المرحلة</span>
                        <select
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                          value={levelId}
                          onChange={(event) =>
                            handleLevelChange(event.target.value ? Number(event.target.value) : "")
                          }
                          aria-label="اختر المرحلة"
                        >
                          <option value="">اختر المرحلة</option>
                          {levels.map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-slate-500">الصف</span>
                        <select
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                          value={classId}
                          onChange={(event) =>
                            handleClassChange(event.target.value ? Number(event.target.value) : "")
                          }
                          aria-label="اختر الصف"
                        >
                          <option value="">اختر الصف</option>
                          {classes.map((schoolClass) => (
                            <option key={schoolClass.id} value={schoolClass.id}>
                              {schoolClass.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-slate-500">المادة</span>
                        <select
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                          value={subjectId}
                          onChange={(event) =>
                            setSubjectId(event.target.value ? Number(event.target.value) : "")
                          }
                          aria-label="اختر المادة"
                        >
                          <option value="">اختر المادة</option>
                          {filteredSubjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-[var(--color-surface-alt)] p-6 text-center">
                      <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs">
                        <button
                          type="button"
                          className={`px-4 py-1.5 rounded-full transition ${
                            inputMethod === "upload"
                              ? "bg-[var(--color-sidebar-bg)] text-white"
                              : "text-slate-600"
                          }`}
                          onClick={() => {
                            setInputMethod("upload")
                            setTestUrl("")
                          }}
                        >
                          رفع ملف
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-1.5 rounded-full transition ${
                            inputMethod === "url"
                              ? "bg-[var(--color-sidebar-bg)] text-white"
                              : "text-slate-600"
                          }`}
                          onClick={() => {
                            setInputMethod("url")
                            setTestFile(null)
                          }}
                        >
                          رابط خارجي
                        </button>
                      </div>
                      {inputMethod === "upload" ? (
                        <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-slate-600">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(event) => setTestFile(event.target.files?.[0] ?? null)}
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {testFile ? testFile.name : "اسحب الملف هنا أو اضغط للاختيار"}
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
                            value={testUrl}
                            onChange={(event) => setTestUrl(event.target.value)}
                          />
                          <span className="text-xs text-slate-500">
                            مثال: رابط PDF أو Google Sheet.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">سيتم حفظ الملف وربطه بالاختبار.</span>
                      <button
                        type="button"
                        className="h-10 rounded-xl bg-[var(--color-sidebar-bg)] px-6 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleAddTest}
                        disabled={saving}
                      >
                        {saving ? "جارٍ الحفظ..." : "إضافة الاختبار"}
                      </button>
                    </div>
                  </div>
                </div>
                {error ? <div className="mb-3 text-sm text-red-600">{error}</div> : null}
                {success ? <div className="mb-3 text-sm text-green-600">{success}</div> : null}
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#EAF6FC] text-black">
                          <th className="px-3 py-2 text-right font-semibold">المادة</th>
                          <th className="px-3 py-2 text-right font-semibold">المرحلة</th>
                          <th className="px-3 py-2 text-right font-semibold">الصف</th>
                          <th className="px-3 py-2 text-right font-semibold">الرابط</th>
                          <th className="px-3 py-2 text-right font-semibold">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.length === 0 ? (
                          <tr>
                            <td className="px-3 py-4 text-center text-slate-500" colSpan={5}>
                              لا توجد اختبارات شهرية مطابقة للفلاتر المختارة.
                            </td>
                          </tr>
                        ) : (
                          tests.map((test) => {
                            const rawUrl = test.test_url_display ?? test.test_url ?? ""
                            const fileUrl =
                              rawUrl && rawUrl.startsWith("/storage")
                                ? `${fileBaseUrl}${rawUrl}`
                                : rawUrl
                            return (
                              <tr key={test.id} className="border-b border-slate-200">
                                <td className="px-3 py-2">{test.subject_name ?? "-"}</td>
                                <td className="px-3 py-2">{test.level_name ?? "-"}</td>
                                <td className="px-3 py-2">{test.class_name ?? "-"}</td>
                                <td className="px-3 py-2">
                                  {fileUrl ? (
                                    <a
                                      href={fileUrl}
                                      className="text-blue-600 underline"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      فتح الاختبار
                                    </a>
                                  ) : (
                                    test.test_url ?? "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">{test.created_at ?? "-"}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
