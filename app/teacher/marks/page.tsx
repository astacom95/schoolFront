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

type SubjectOption = {
  id: number
  name: string
  total_degree?: number | null
  level_id?: number | null
  class_id?: number | null
  level?: string | null
  class?: string | null
}

type StudentOption = {
  id: number
  full_name: string
}

type MarkRow = {
  id?: number
  name: string
  full: string | number
  participation: string
  score: string
  placeholder?: boolean
}

const markHeaders = [
  "اسم الطالب",
  "الدرجة الكاملة",
  "المشاركة والواجبات",
  "الدرجة",
]

export default function TeacherMarksPage() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [levelId, setLevelId] = useState<number | "">("")
  const [classId, setClassId] = useState<number | "">("")
  const [subjectId, setSubjectId] = useState<number | "">("")
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null)
  const [marksByStudent, setMarksByStudent] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = (await apiFetch("/teacher/subjects")) as { data?: SubjectOption[] }
        setSubjects(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setSubjects([])
      }
    }
    void load()
  }, [])

  useEffect(() => {
    const loadStudents = async () => {
      if (!classId) {
        setStudents([])
        setEditingStudentId(null)
        setMarksByStudent({})
        return
      }
      try {
        const response = (await apiFetch(`/teacher/students?class_id=${classId}`)) as {
          data?: StudentOption[]
        }
        setStudents(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setStudents([])
      }
    }
    void loadStudents()
  }, [classId])

  useEffect(() => {
    const loadMarks = async () => {
      if (!classId || !subjectId) {
        setMarksByStudent({})
        return
      }
      try {
        const response = (await apiFetch(`/teacher/marks?class_id=${classId}&subject_id=${subjectId}`)) as {
          data?: { student_id: number; degree: number }[]
        }
        if (!Array.isArray(response?.data)) {
          setMarksByStudent({})
          return
        }
        const nextMarks: Record<number, string> = {}
        response.data.forEach((mark) => {
          nextMarks[mark.student_id] = String(mark.degree ?? "")
        })
        setMarksByStudent(nextMarks)
      } catch {
        setMarksByStudent({})
      }
    }
    void loadMarks()
  }, [classId, subjectId])

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

  const selectedSubject = useMemo(() => {
    if (!subjectId) return null
    return subjects.find((subject) => subject.id === subjectId) ?? null
  }, [subjects, subjectId])

  const totalDegreeValue = selectedSubject?.total_degree ?? "-"

  const tableRows: MarkRow[] = useMemo(() => {
    if (students.length > 0) {
      return students.map((student) => ({
        id: student.id,
        name: student.full_name,
        full: totalDegreeValue,
        participation: "-",
        score: marksByStudent[student.id] ?? "-",
      }))
    }
    return Array.from({ length: 7 }, () => ({
      name: "-",
      full: totalDegreeValue,
      participation: "-",
      score: "-",
      placeholder: true,
    }))
  }, [students, totalDegreeValue, marksByStudent])

  const handleLevelChange = (value: number | "") => {
    setLevelId(value)
    setClassId("")
    setSubjectId("")
    setEditingStudentId(null)
    setMarksByStudent({})
    setSaveError(null)
    setSaveSuccess(null)
  }

  const handleClassChange = (value: number | "") => {
    setClassId(value)
    setSubjectId("")
    setEditingStudentId(null)
    setMarksByStudent({})
    setSaveError(null)
    setSaveSuccess(null)
  }

  const handleSubjectChange = (value: number | "") => {
    setSubjectId(value)
    setEditingStudentId(null)
    setSaveError(null)
    setSaveSuccess(null)
  }

  const handleMarkChange = (studentId: number, value: string) => {
    setMarksByStudent((prev) => ({ ...prev, [studentId]: value }))
  }

  const handleSave = async () => {
    if (!subjectId || !classId) return
    const payloadMarks = Object.entries(marksByStudent)
      .filter(([, value]) => value !== "")
      .map(([studentId, value]) => ({
        student_id: Number(studentId),
        degree: Number(value),
      }))

    if (payloadMarks.length === 0) {
      setSaveError("أدخل درجات الطلاب قبل الحفظ.")
      setSaveSuccess(null)
      return
    }

    try {
      setSaving(true)
      setSaveError(null)
      setSaveSuccess(null)
      await apiFetch("/teacher/marks", {
        method: "POST",
        body: JSON.stringify({
          subject_id: subjectId,
          class_id: classId,
          marks: payloadMarks,
        }),
      })
      setSaveSuccess("تم حفظ الدرجات بنجاح.")
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "تعذر حفظ الدرجات.")
      setSaveSuccess(null)
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
            <h1 className="text-base font-medium">الدرجات</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <select
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] text-white px-3  text-sm text-black outline-none"
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
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] text-white px-3 text-sm text-black outline-none"
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
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] text-white px-3 text-sm text-black outline-none"
                    value={subjectId}
                    onChange={(event) => handleSubjectChange(event.target.value ? Number(event.target.value) : "")}
                    aria-label="اختر المادة"
                  >
                    <option value="">المادة</option>
                    {filteredSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full max-w-[670px] rounded-md border border-black/25 bg-white shadow-sm">
                  <div className="flex h-[325px] flex-col px-4 pb-3 pt-2">
                    <div className="grid grid-cols-[1.35fr_0.95fr_1.15fr_0.85fr] gap-3">
                      {markHeaders.map((header) => (
                        <div
                          key={header}
                          className="flex h-8 items-center justify-center rounded-[5px] bg-[#EAF6FC] text-[12px] font-medium text-black"
                        >
                          {header}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex-1 overflow-y-auto border-t border-black/25">
                      {tableRows.map((row, index) => (
                        <div
                          key={`mark-row-${index}`}
                          className={`grid min-h-[36px] grid-cols-[1.35fr_0.95fr_1.15fr_0.85fr] border-b border-black/25 text-[12px] text-black ${row.placeholder ? "" : "cursor-pointer hover:bg-[#F5FBFF]"}`}
                          onClick={() => {
                            if (!row.placeholder && row.id && subjectId) {
                              setEditingStudentId(row.id)
                            }
                          }}
                        >
                          <div className="flex items-center justify-center border-l border-black/25">
                            {row.name}
                          </div>
                          <div className="flex items-center justify-center border-l border-black/25">
                            {row.full}
                          </div>
                          <div className="flex items-center justify-center border-l border-black/25">
                            {row.participation}
                          </div>
                          <div className="flex items-center justify-center">
                            {!row.placeholder && row.id && editingStudentId === row.id && subjectId ? (
                              <input
                                type="number"
                                min={0}
                                max={selectedSubject?.total_degree ?? undefined}
                                className="h-8 w-20 rounded-md border border-black/20 bg-white px-2 text-center text-[12px] outline-none"
                                value={marksByStudent[row.id] ?? ""}
                                onChange={(event) => handleMarkChange(row.id!, event.target.value)}
                                onClick={(event) => event.stopPropagation()}
                              />
                            ) : (
                              row.score
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="h-9 rounded-lg bg-[var(--color-sidebar-bg)]  px-4 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleSave}
                    disabled={!subjectId || !classId || saving}
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ الدرجات"}
                  </button>
                  {saveError ? <span className="text-sm text-red-600">{saveError}</span> : null}
                  {saveSuccess ? <span className="text-sm text-green-600">{saveSuccess}</span> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
