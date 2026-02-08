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

type AttendanceRow = {
  student_id: number
  student_name: string
  attendance_count: number
  recorded_lessons: number
  attendance_percent: number
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

const attendanceHeaders = [
  "اسم الطالب",
  "عدد الحضور",
  "الدروس المسجلة",
  "نسبة الحضور",
]

export default function TeacherAttendancePage() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [levelId, setLevelId] = useState<number | "">("")
  const [classId, setClassId] = useState<number | "">("")
  const [subjectId, setSubjectId] = useState<number | "">("")
  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [recordedLessons, setRecordedLessons] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)

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
    const loadAttendance = async () => {
      if (!subjectId) {
        setRows([])
        setRecordedLessons(0)
        setLoadError(null)
        return
      }

      const params = new URLSearchParams()
      params.set("subject_id", String(subjectId))
      if (classId) params.set("class_id", String(classId))
      if (levelId) params.set("level_id", String(levelId))

      try {
        const response = (await apiFetch(`/teacher/attendance?${params.toString()}`)) as {
          data?: { students?: AttendanceRow[]; recorded_lessons?: number }
        }
        const students = Array.isArray(response?.data?.students) ? response.data.students : []
        setRows(students)
        setRecordedLessons(Number(response?.data?.recorded_lessons ?? 0))
        setLoadError(null)
      } catch (error) {
        setRows([])
        setRecordedLessons(0)
        setLoadError(error instanceof Error ? error.message : "تعذر تحميل بيانات الحضور.")
      }
    }
    void loadAttendance()
  }, [subjectId, classId, levelId])

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
    setRows([])
    setRecordedLessons(0)
    setLoadError(null)
  }

  const handleClassChange = (value: number | "") => {
    setClassId(value)
    setSubjectId("")
    setRows([])
    setRecordedLessons(0)
    setLoadError(null)
  }

  const handleSubjectChange = (value: number | "") => {
    setSubjectId(value)
    setRows([])
    setRecordedLessons(0)
    setLoadError(null)
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
            <h1 className="text-base font-medium">حضور الطلاب</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
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
                        disabled={!levelId}
                      >
                        <option value="">اختر الصف</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name}
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
                          handleSubjectChange(event.target.value ? Number(event.target.value) : "")
                        }
                        aria-label="اختر المادة"
                        disabled={!classId}
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

                  <div className="mt-6 rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm text-slate-600">
                    {subjectId
                      ? `عدد الدروس المسجلة لهذا المقرر: ${recordedLessons}`
                      : "اختر مادة لعرض سجل الحضور."}
                  </div>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-[#E9F0FF] text-slate-700">
                        <tr>
                          {attendanceHeaders.map((header) => (
                            <th key={header} className="px-4 py-3 text-right text-xs font-semibold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length > 0 ? (
                          rows.map((row) => (
                            <tr key={row.student_id} className="border-b border-slate-100">
                              <td className="px-4 py-3 text-slate-700">{row.student_name}</td>
                              <td className="px-4 py-3 text-slate-600">{row.attendance_count}</td>
                              <td className="px-4 py-3 text-slate-600">{row.recorded_lessons}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {row.attendance_percent}%
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={attendanceHeaders.length}
                              className="px-4 py-6 text-center text-sm text-slate-500"
                            >
                              {loadError ?? "لا توجد بيانات حضور لعرضها حالياً."}
                            </td>
                          </tr>
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
