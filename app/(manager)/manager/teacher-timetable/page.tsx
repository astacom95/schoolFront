"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

function normalizeTimeValue(value: string) {
  return value ? value.slice(0, 5) : ""
}

export default function TeacherTimetablePage() {
  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""), [])
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [levels, setLevels] = useState<LevelWithClasses[]>([])
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)

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
    const classMap = new Map<
      number,
      {
        classId: number
        className: string
        levelName: string
        days: {
          dayValue: string
          dayLabel: string
          rows: TimetableEntry[]
        }[]
      }
    >()

    for (const entry of entries) {
      if (!classMap.has(entry.class_id)) {
        classMap.set(entry.class_id, {
          classId: entry.class_id,
          className: entry.class_name || "—",
          levelName: entry.level_name || "—",
          days: DAYS.map((dayItem) => ({
            dayValue: dayItem.value,
            dayLabel: dayItem.label,
            rows: [],
          })),
        })
      }

      const classGroup = classMap.get(entry.class_id)
      const dayGroup = classGroup?.days.find((dayItem) => dayItem.dayValue === entry.day)
      if (dayGroup) {
        dayGroup.rows.push(entry)
      }
    }

    return Array.from(classMap.values()).sort((a, b) => a.className.localeCompare(b.className, "ar"))
  }, [entries])

  const overlaps = (startA: string, endA: string, startB: string, endB: string) => {
    return startA < endB && endA > startB
  }

  const hasClassConflict = useMemo(() => {
    if (!day || !startTime || !endTime || !classId) return false
    const classNum = Number(classId)
    return entries.some(
      (e) =>
        e.id !== editingEntryId &&
        e.class_id === classNum &&
        e.day === day &&
        overlaps(startTime, endTime, e.start_time, e.end_time),
    )
  }, [classId, day, editingEntryId, endTime, entries, startTime])

  const hasTeacherConflict = useMemo(() => {
    if (!day || !startTime || !endTime || !teacherId) return false
    const teacherNum = Number(teacherId)
    return entries.some(
      (e) =>
        e.id !== editingEntryId &&
        e.teacher_id === teacherNum &&
        e.day === day &&
        overlaps(startTime, endTime, e.start_time, e.end_time),
    )
  }, [day, editingEntryId, endTime, entries, startTime, teacherId])

  const resetForm = () => {
    setEditingEntryId(null)
    setDay("")
    setStartTime("")
    setEndTime("")
    setLevelId("")
    setClassId("")
    setSubjectId("")
    setTeacherId("")
  }

  const startEditing = (entry: TimetableEntry) => {
    setMessage(null)
    setEditingEntryId(entry.id)
    setDay(entry.day)
    setStartTime(normalizeTimeValue(entry.start_time))
    setEndTime(normalizeTimeValue(entry.end_time))
    setLevelId(String(entry.level_id))
    setClassId(String(entry.class_id))
    setSubjectId(String(entry.subject_id))
    setTeacherId(String(entry.teacher_id))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
      const payload = new URLSearchParams()
      payload.set("day", day)
      payload.set("start_time", normalizeTimeValue(startTime))
      payload.set("end_time", normalizeTimeValue(endTime))
      payload.set("level_id", String(Number(levelId)))
      payload.set("class_id", String(Number(classId)))
      payload.set("subject_id", String(Number(subjectId)))
      payload.set("teacher_id", String(Number(teacherId)))

      const url = editingEntryId
        ? `${apiRoot}/manager/teacher-time-table/${editingEntryId}`
        : `${apiRoot}/manager/teacher-time-table`

      if (editingEntryId) {
        payload.set("_method", "PUT")
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: payload,
      })

      const json = await res.json()
      if (!res.ok) {
        const msg = json?.message || "فشل حفظ الجدول."
        throw new Error(msg)
      }

      setEntries((prev) =>
        editingEntryId ? prev.map((entry) => (entry.id === editingEntryId ? json.data : entry)) : [json.data, ...prev],
      )
      setMessage({ text: editingEntryId ? "تم تحديث الجدول بنجاح." : "تم إضافة الجدول بنجاح.", variant: "success" })
      resetForm()
    } catch (error: any) {
      setMessage({ text: error?.message || "حدث خطأ غير متوقع.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 md:py-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">جدول المعلمين</h2>
          <span className="text-sm text-muted-foreground">إضافة وتعديل مع تحقق التعارضات للفصول والمعلمين</span>
        </div>
      </div>

      <Card className="border border-slate-200 p-4 shadow-none">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {editingEntryId && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              أنت الآن في وضع تعديل الجدول.
            </div>
          )}

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
                  {submitting ? "جاري الحفظ..." : editingEntryId ? "حفظ التعديل" : "حفظ الجدول"}
                </Button>
                {editingEntryId && (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                    إلغاء التعديل
                  </Button>
                )}
                {hasClassConflict && (
                  <span className="text-xs text-red-600">تنبيه: الفصل لديه تعارض في هذا الوقت.</span>
                )}
                {hasTeacherConflict && (
                  <span className="text-xs text-red-600">تنبيه: المعلم لديه تعارض في هذا الوقت.</span>
                )}
              </div>
        </form>
      </Card>

      <Card className="border border-slate-200 p-4 shadow-none">
        <h3 className="mb-4 text-base font-semibold text-slate-900">الجدول الحالي</h3>
        {groupedEntries.length === 0 ? (
          <div className="text-sm text-slate-500">لا توجد حصص حالياً.</div>
        ) : (
          <div className="grid gap-4">
            {groupedEntries.map((classGroup) => (
              <div key={classGroup.classId} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{classGroup.className}</h4>
                    <div className="text-xs text-slate-500">{classGroup.levelName}</div>
                  </div>
                  <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">
                    {classGroup.days.reduce((sum, dayGroup) => sum + dayGroup.rows.length, 0)} حصة
                  </span>
                </div>
                <div className="grid gap-2">
                  {classGroup.days.map((dayGroup) => (
                    <div
                      key={`${classGroup.classId}-${dayGroup.dayValue}`}
                      className="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-slate-900">{dayGroup.dayLabel}</h5>
                        <span className="text-xs text-slate-400">{dayGroup.rows.length} حصة</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {dayGroup.rows.length === 0 && (
                          <div className="text-xs text-slate-400">لا توجد حصص.</div>
                        )}
                        {dayGroup.rows.map((row) => (
                          <div
                            key={row.id}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs leading-5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-slate-800">{row.subject_name || "—"}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">
                                  {row.start_time} - {row.end_time}
                                </span>
                                <button
                                  type="button"
                                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                                  onClick={() => startEditing(row)}
                                >
                                  تعديل
                                </button>
                              </div>
                            </div>
                            <div className="text-slate-500">{row.teacher_name || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
