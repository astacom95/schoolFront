"use client"

import { useEffect, useMemo, useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"

type LevelWithClasses = {
  id: number
  name: string
  classes: { id: number; name: string; number_of_subjects: number }[]
}

type SubjectRow = {
  id: number
  name: string
  level_id: number
  class_id: number
}

type TeacherRow = {
  id: number
  full_name: string
}

type TimetableEntry = {
  id: number
  day: string
  start_time: string
  end_time: string
  level_id: number
  level_name?: string | null
  class_id: number
  class_name?: string | null
  subject_id: number
  subject_name?: string | null
  teacher_id: number
  teacher_name?: string | null
}

type MessageState = { text: string; variant: "success" | "error" } | null

const DAYS = [
  { value: "Saturday", label: "السبت" },
  { value: "Sunday", label: "الأحد" },
  { value: "Monday", label: "الاثنين" },
  { value: "Tuesday", label: "الثلاثاء" },
  { value: "Wednesday", label: "الأربعاء" },
  { value: "Thursday", label: "الخميس" },
  { value: "Friday", label: "الجمعة" },
]

export default function TeacherTimetablePage() {
  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""), [])
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [levels, setLevels] = useState<LevelWithClasses[]>([])
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [entries, setEntries] = useState<TimetableEntry[]>([])

  const [day, setDay] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [levelId, setLevelId] = useState<string>("")
  const [classId, setClassId] = useState<string>("")
  const [subjectId, setSubjectId] = useState<string>("")
  const [teacherId, setTeacherId] = useState<string>("")

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<MessageState>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.allSettled([
          fetch(`${apiRoot}/manager/levels`, { cache: "no-store" }).then((r) => r.json()),
          fetch(`${apiRoot}/manager/subjects`, { cache: "no-store" }).then((r) => r.json()),
          fetch(`${apiRoot}/manager/teachers/public`, { cache: "no-store" }).then((r) => r.json()),
          fetch(`${apiRoot}/manager/teacher-time-table`, { cache: "no-store" }).then((r) => r.json()),
        ])

        const [levelsRes, subjectsRes, teachersRes, entriesRes] = results

        if (levelsRes.status === "fulfilled") {
          const raw = levelsRes.value
          setLevels(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [])
        }
        if (subjectsRes.status === "fulfilled") {
          const raw = subjectsRes.value
          setSubjects(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [])
        }
        if (teachersRes.status === "fulfilled") {
          const raw = teachersRes.value
          setTeachers(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [])
        }
        if (entriesRes.status === "fulfilled") {
          const raw = entriesRes.value
          setEntries(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [])
        }
      } catch (error) {
        console.error("فشل في جلب البيانات", error)
      }
    }
    void load()
  }, [apiRoot])

  const classesForLevel = useMemo(() => {
    const lvlIdNum = Number(levelId)
    return levels.find((lvl) => lvl.id === lvlIdNum)?.classes ?? []
  }, [levelId, levels])

  const subjectsForClass = useMemo(() => {
    const clsIdNum = Number(classId)
    const lvlIdNum = Number(levelId)
    return subjects.filter((s) => s.class_id === clsIdNum && s.level_id === lvlIdNum)
  }, [classId, levelId, subjects])

  const groupedEntries = useMemo(() => {
    return DAYS.map((d) => ({
      dayValue: d.value,
      dayLabel: d.label,
      rows: entries.filter((e) => e.day === d.value),
    }))
  }, [entries])

  const overlaps = (startA: string, endA: string, startB: string, endB: string) => {
    return startA < endB && endA > startB
  }

  const hasClassConflict = useMemo(() => {
    if (!day || !startTime || !endTime || !classId) return false
    const classNum = Number(classId)
    return entries.some(
      (e) => e.class_id === classNum && e.day === day && overlaps(startTime, endTime, e.start_time, e.end_time),
    )
  }, [classId, day, endTime, entries, startTime])

  const hasTeacherConflict = useMemo(() => {
    if (!day || !startTime || !endTime || !teacherId) return false
    const teacherNum = Number(teacherId)
    return entries.some(
      (e) => e.teacher_id === teacherNum && e.day === day && overlaps(startTime, endTime, e.start_time, e.end_time),
    )
  }, [day, endTime, entries, startTime, teacherId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!day || !startTime || !endTime || !levelId || !classId || !subjectId || !teacherId) {
      setMessage({ text: "الرجاء تعبئة جميع الحقول.", variant: "error" })
      return
    }

    if (hasClassConflict) {
      setMessage({ text: "الفصل لديه معلم في هذا الوقت لليوم المحدد.", variant: "error" })
      return
    }
    if (hasTeacherConflict) {
      setMessage({ text: "المعلم غير متاح في هذا الوقت.", variant: "error" })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        day,
        start_time: startTime,
        end_time: endTime,
        level_id: Number(levelId),
        class_id: Number(classId),
        subject_id: Number(subjectId),
        teacher_id: Number(teacherId),
      }

      const res = await fetch(`${apiRoot}/manager/teacher-time-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        const msg = json?.message || "فشل حفظ الجدول."
        throw new Error(msg)
      }

      setEntries((prev) => [json.data, ...prev])
      setMessage({ text: "تم إضافة الجدول بنجاح.", variant: "success" })
    } catch (error: any) {
      setMessage({ text: error?.message || "حدث خطأ غير متوقع.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar side="right" variant="inset" />
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <SiteHeader />
        <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold">جدول المعلمين</h2>
              <span className="text-sm text-muted-foreground">إضافة وتحقق التعارضات للفصول والمعلمين</span>
            </div>
          </div>

          <Card className="p-4 shadow-sm border border-slate-200">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">اليوم</Label>
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اليوم" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">وقت البداية</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">وقت النهاية</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">المعلم</Label>
                  <Select value={teacherId} onValueChange={setTeacherId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المعلم" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">المستوى</Label>
                  <Select
                    value={levelId}
                    onValueChange={(val) => {
                      setLevelId(val)
                      setClassId("")
                      setSubjectId("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((lvl) => (
                        <SelectItem key={lvl.id} value={String(lvl.id)}>
                          {lvl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">الفصل</Label>
                  <Select
                    value={classId}
                    onValueChange={(val) => {
                      setClassId(val)
                      setSubjectId("")
                    }}
                    disabled={!levelId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفصل" />
                    </SelectTrigger>
                    <SelectContent>
                      {classesForLevel.map((cls) => (
                        <SelectItem key={cls.id} value={String(cls.id)}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">المادة</Label>
                  <Select value={subjectId} onValueChange={setSubjectId} disabled={!classId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsForClass.map((subj) => (
                        <SelectItem key={subj.id} value={String(subj.id)}>
                          {subj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {message && (
                <div
                  className={`rounded-md px-3 py-2 text-sm ${
                    message.variant === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "جاري الحفظ..." : "حفظ الجدول"}
                </Button>
                {hasClassConflict && (
                  <span className="text-xs text-red-600">تنبيه: الفصل لديه تعارض في هذا الوقت.</span>
                )}
                {hasTeacherConflict && (
                  <span className="text-xs text-red-600">تنبيه: المعلم لديه تعارض في هذا الوقت.</span>
                )}
              </div>
            </form>
          </Card>

          <Card className="p-4 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">الجدول الحالي</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedEntries.map((group) => (
                <div key={group.dayValue} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{group.dayLabel}</h4>
                    <span className="text-xs text-muted-foreground">{group.rows.length} حصة</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.rows.length === 0 && (
                      <div className="text-xs text-muted-foreground">لا توجد حصص.</div>
                    )}
                    {group.rows.map((row) => (
                      <div key={row.id} className="rounded-md bg-white border border-slate-200 p-2 text-xs leading-5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{row.class_name || "—"}</span>
                          <span className="text-slate-600">
                            {row.start_time} - {row.end_time}
                          </span>
                        </div>
                        <div className="text-slate-700">{row.subject_name || "—"}</div>
                        <div className="text-slate-600">{row.teacher_name || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </SidebarInset>
      <style jsx global>{`
          [data-sidebar=\"sidebar\"] {
            background: var(--color-sidebar-bg);
            color: var(--color-sidebar-fg);
          }
        `}</style>
    </SidebarProvider>
  )
}
