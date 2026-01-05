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
  level_id?: number | null
  class_id?: number | null
  level?: string | null
  class?: string | null
}

type StudentOption = {
  id: number
  full_name: string
}

const performanceOptions = ["ضعيف", "متوسط", "جيد", "ممتاز"] as const

export default function TeacherReportsPage() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [levelId, setLevelId] = useState<number | "">("")
  const [classId, setClassId] = useState<number | "">("")
  const [subjectId, setSubjectId] = useState<number | "">("")
  const [studentId, setStudentId] = useState<number | "">("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    student_subject_performance: "",
    homework_commitment: "",
    discipline_commitment: "",
    peer_relationship: "",
    self_confidence: "",
    special_skills: "",
    academic_progress: "",
    literacy_numeracy_skills: "",
    participation_interaction: "",
    follow_up_cases: "",
    responsibility_ability: "",
    absence_delay: "",
    support_needs: "",
    recommendations: "",
  })

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

  const handleRadioChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTextChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!studentId || !subjectId || !classId || !levelId) {
      setSaveError("يرجى اختيار المرحلة والصف والمادة والطالب.")
      setSaveSuccess(null)
      return
    }
    try {
      setSaving(true)
      setSaveError(null)
      setSaveSuccess(null)
      await apiFetch("/teacher/reports", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          subject_id: subjectId,
          class_id: classId,
          level_id: levelId,
          ...formData,
        }),
      })
      setSaveSuccess("تم حفظ التقرير بنجاح.")
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "تعذر حفظ التقرير.")
      setSaveSuccess(null)
    } finally {
      setSaving(false)
    }
  }

  const radioGroups = [
    { key: "student_subject_performance", label: "اداء الطالب في المواد" },
    { key: "homework_commitment", label: "الالتزام بالواجبات المدرسية والاختبارات" },
    { key: "discipline_commitment", label: "الانضباط والالتزام بالقوانين" },
    { key: "peer_relationship", label: "علاقته مع زملائه" },
    { key: "academic_progress", label: "التقدم في التحصيل الدراسي" },
    { key: "literacy_numeracy_skills", label: "مهارات القراءة والكتابة والحساب" },
    { key: "participation_interaction", label: "المشاركة والتفاعل" },
  ] as const

  const textFields = [
    { key: "self_confidence", label: "مستوى الثقة بالنفس" },
    { key: "special_skills", label: "مهارات مميزة" },
    { key: "follow_up_cases", label: "حالات تحتاج متابعة" },
    { key: "responsibility_ability", label: "القدرة على تحمل المسؤلية" },
    { key: "absence_delay", label: "الغياب والتاخر" },
    { key: "support_needs", label: "جوانب تحتاج دعما او تدخلا" },
    { key: "recommendations", label: "التوصيات" },
  ] as const

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
            <h1 className="text-base font-medium">التقارير</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex w-full max-w-[920px] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex w-[210px] flex-col items-center justify-center gap-2 bg-[--color-sidebar-bg] text-white">
                    <FileTextIcon className="h-7 w-7" />
                    <span className="text-base font-semibold">التقارير</span>
                  </div>
                  <div className="flex flex-1 items-center px-6 py-6 text-right text-[18px] font-medium leading-[32px] text-black">
                    يساعد تقرير المعلّم الإدارة المدرسية في تكوين صورة واضحة عن مستوى الطالب الأكاديمي والسلوكي داخل الصف. كما يمكّن من تحديد نقاط القوة ودعمها، واكتشاف أي مشكلات أو صعوبات تحتاج إلى تدخل مبكر. يساهم التقرير أيضًا في تعزيز التعاون بين المعلّم والإدارة وولي الأمر لتحقيق مصلحة الطالب
                  </div>
                </div>
                <div className="mt-8 w-full max-w-[1025px] rounded-xl p-8 text-white">
                  <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <select
                      className="h-10 rounded-md bg-[--color-sidebar-bg] px-3 text-sm text-white outline-none"
                      value={levelId}
                      onChange={(event) => {
                        setLevelId(event.target.value ? Number(event.target.value) : "")
                        setClassId("")
                        setSubjectId("")
                        setStudentId("")
                      }}
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
                      className="h-10 rounded-md bg-[--color-sidebar-bg] px-3 text-sm text-white outline-none"
                      value={classId}
                      onChange={(event) => {
                        setClassId(event.target.value ? Number(event.target.value) : "")
                        setSubjectId("")
                        setStudentId("")
                      }}
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
                      className="h-10 rounded-md bg-[--color-sidebar-bg] px-3 text-sm text-white outline-none"
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
                    <select
                      className="h-10 rounded-md bg-[--color-sidebar-bg] px-3 text-sm text-white outline-none"
                      value={studentId}
                      onChange={(event) => setStudentId(event.target.value ? Number(event.target.value) : "")}
                      aria-label="اختر الطالب"
                    >
                      <option value="">الطالب</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6">
                      {radioGroups.slice(0, 4).map((group) => (
                        <div key={group.key} className="space-y-2">
                          <div className="text-[15px] font-medium text-black">{group.label}</div>
                          <div className="flex flex-wrap gap-5">
                            {performanceOptions.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 text-[15px] font-medium text-black"
                              >
                                <input
                                  type="radio"
                                  name={group.key}
                                  value={option}
                                  checked={formData[group.key] === option}
                                  onChange={() => handleRadioChange(group.key, option)}
                                  className="h-4 w-4"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    
                    </div>
                    <div className="space-y-6">
                      {radioGroups.slice(4, 7).map((group) => (
                        <div key={group.key} className="space-y-2">
                          <div className="text-[15px] font-medium text-black">{group.label}</div>
                          <div className="flex flex-wrap gap-5">
                            {performanceOptions.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 text-[15px] font-medium text-black"
                              >
                                <input
                                  type="radio"
                                  name={group.key}
                                  value={option}
                                  checked={formData[group.key] === option}
                                  onChange={() => handleRadioChange(group.key, option)}
                                  className="h-4 w-4"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {textFields.slice(2, 6).map((field) => (
                          <div key={field.key} className="space-y-2">
                            <div className="text-[12px] font-medium text-black">{field.label}</div>
                            <input
                              type="text"
                              value={formData[field.key]}
                              onChange={(event) => handleTextChange(field.key, event.target.value)}
                              className="h-10 w-full rounded-md bg-gray-100 px-3 text-sm text-black outline-none"
                            />
                          </div>
                        ))}
                      </div>
                        <div className="grid gap-4 md:grid-cols-2">
                        {textFields.slice(0, 2).map((field) => (
                          <div key={field.key} className="space-y-2">
                            <div className="text-[12px] font-medium text-black">{field.label}</div>
                            <input
                              type="text"
                              value={formData[field.key]}
                              onChange={(event) => handleTextChange(field.key, event.target.value)}
                              className="h-10 w-full rounded-md bg-gray-100 px-3 text-sm text-black outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="text-[12px] font-medium text-black">التوصيات</div>
                        <textarea
                          value={formData.recommendations}
                          onChange={(event) => handleTextChange("recommendations", event.target.value)}
                          className="h-40 w-full resize-none rounded-md bg-gray-100 px-3 py-3 text-sm text-black outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        className="h-10 w-full rounded-md bg-[var(--color-sidebar-bg)] text-sm font-semibold text-white"
                        onClick={handleSubmit}
                        disabled={saving}
                      >
                        {saving ? "جارٍ الحفظ..." : "حفظ التقرير"}
                      </button>
                      {saveError ? <div className="text-sm text-red-600">{saveError}</div> : null}
                      {saveSuccess ? <div className="text-sm text-green-600">{saveSuccess}</div> : null}
                    </div>
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
