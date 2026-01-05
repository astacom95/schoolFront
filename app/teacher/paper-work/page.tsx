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
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

type SubjectOption = {
  id: number
  name: string
  level_id?: number | null
  class_id?: number | null
  level?: string | null
  class?: string | null
}

type PaperWorkItem = {
  id: number
  paper_path: string
  paper_url?: string | null
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

export default function TeacherPaperWorkPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [papers, setPapers] = useState<PaperWorkItem[]>([])
  const [levelId, setLevelId] = useState<number | "">("")
  const [classId, setClassId] = useState<number | "">("")
  const [subjectId, setSubjectId] = useState<number | "">("")
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

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

  const loadPapers = async () => {
    try {
      const params = new URLSearchParams()
      if (levelId) params.set("level_id", String(levelId))
      if (classId) params.set("class_id", String(classId))
      if (subjectId) params.set("subject_id", String(subjectId))
      const response = (await apiFetch(`/teacher/papers-work?${params.toString()}`)) as {
        data?: PaperWorkItem[]
      }
      setPapers(Array.isArray(response?.data) ? response.data : [])
    } catch {
      setPapers([])
    }
  }

  useEffect(() => {
    void loadPapers()
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

  const handleUpload = async () => {
    if (!paperFile || !levelId || !classId || !subjectId) {
      setUploadError("اختر المرحلة والصف والمادة وحدد الملف قبل الرفع.")
      setUploadSuccess(null)
      return
    }

    try {
      setUploading(true)
      setUploadError(null)
      setUploadSuccess(null)
      const formData = new FormData()
      formData.append("paper_file", paperFile)
      formData.append("level_id", String(levelId))
      formData.append("class_id", String(classId))
      formData.append("subject_id", String(subjectId))

      const token =
        typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null

      const response = await fetch(`${apiBaseUrl}/teacher/papers-work`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        let message = "تعذر رفع ورقة العمل."
        try {
          const errorData = await response.json()
          if (errorData?.message) message = errorData.message
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      setPaperFile(null)
      setUploadSuccess("تمت إضافة ورقة العمل بنجاح.")
      await loadPapers()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "تعذر رفع ورقة العمل.")
      setUploadSuccess(null)
    } finally {
      setUploading(false)
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
      </Sidebar>
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <h1 className="text-base font-medium">أوراق العمل</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <select
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] text-white px-3 text-sm  outline-none"
                    value={levelId}
                    onChange={(event) => handleLevelChange(event.target.value ? Number(event.target.value) : "")}
                    aria-label="اختر المرحلة"
                  >
                    <option value="">المرحلة</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] px-3 text-sm text-white outline-none"
                    value={classId}
                    onChange={(event) => handleClassChange(event.target.value ? Number(event.target.value) : "")}
                    aria-label="اختر الصف"
                  >
                    <option value="">الصف</option>
                    {classes.map((schoolClass) => (
                      <option key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] px-3 text-sm text-white outline-none"
                    value={subjectId}
                    onChange={(event) => setSubjectId(event.target.value ? Number(event.target.value) : "")}
                    aria-label="اختر المادة"
                  >
                    <option value="">المادة</option>
                    {filteredSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <label className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(event) => setPaperFile(event.target.files?.[0] ?? null)}
                    />
                    {paperFile ? paperFile.name : "اختر ملف ورقة العمل"}
                  </label>
                  <button
                    type="button"
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? "جارٍ الرفع..." : "رفع"}
                  </button>
                </div>
                {uploadError ? <div className="mb-3 text-sm text-red-600">{uploadError}</div> : null}
                {uploadSuccess ? <div className="mb-3 text-sm text-green-600">{uploadSuccess}</div> : null}
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#EAF6FC] text-black">
                          <th className="px-3 py-2 text-right font-semibold">المادة</th>
                          <th className="px-3 py-2 text-right font-semibold">المرحلة</th>
                          <th className="px-3 py-2 text-right font-semibold">الصف</th>
                          <th className="px-3 py-2 text-right font-semibold">الملف</th>
                          <th className="px-3 py-2 text-right font-semibold">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {papers.length === 0 ? (
                          <tr>
                            <td className="px-3 py-4 text-center text-slate-500" colSpan={5}>
                              لا توجد أوراق عمل مطابقة للفلاتر المختارة.
                            </td>
                          </tr>
                        ) : (
                          papers.map((paper) => {
                            const rawUrl = paper.paper_url ?? ""
                            const fileUrl =
                              rawUrl && rawUrl.startsWith("/storage")
                                ? `${fileBaseUrl}${rawUrl}`
                                : rawUrl
                            return (
                              <tr key={paper.id} className="border-b border-slate-200">
                                <td className="px-3 py-2">{paper.subject_name ?? "-"}</td>
                                <td className="px-3 py-2">{paper.level_name ?? "-"}</td>
                                <td className="px-3 py-2">{paper.class_name ?? "-"}</td>
                                <td className="px-3 py-2">
                                  {fileUrl ? (
                                    <a
                                      href={fileUrl}
                                      className="text-blue-600 underline"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      فتح الملف
                                    </a>
                                  ) : (
                                    paper.paper_path ?? "-"
                                  )}
                                </td>
                                <td className="px-3 py-2">{paper.created_at ?? "-"}</td>
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
