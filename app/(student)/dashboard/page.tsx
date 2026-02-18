"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import { Door } from "@/components/door/door"
import { SectionCards } from "@/components/section-cards"
import { apiFetch } from "@/lib/api/client"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

const baseStudentCards = [
  {
    title: "القاعة",
    value: "جاهز",
    footerTitle: "البث المباشر والتسجيلات",
    trend: "none" as const,
    imageSrc: "/assets/mdi_laptop-account.svg",
    imageAlt: "القاعة",
    href: "/student/lessons",
  },
  {
    title: "الاختبارات",
    value: "قريباً",
    footerTitle: "اختبارات شهرية",
    trend: "down" as const,
    imageSrc: "/assets/Vector (2).svg",
    imageAlt: "الاختبارات",
  },
  {
    title: "المواد الدراسية",
    value: "0",
    footerTitle: "ملخصات وواجبات",
    trend: "none" as const,
    imageSrc: "/assets/Vector (1).svg",
    imageAlt: "المواد الدراسية",
    href: "/student/subjects",
  },
  {
    title: "الارشاد",
    value: "قريباً",
    footerTitle: "دعم وتوجيه",
    trend: "none" as const,
    imageSrc: "/assets/Vector.svg",
    imageAlt: "الارشاد",
    href: "/student/guidance",
  },
]

const timetableSlots = [
  { label: "الاولى", start: "08:00", end: "09:00" },
  { label: "الثانية", start: "09:00", end: "10:00" },
  { label: "الثالثة", start: "10:00", end: "11:00" },
  { label: "الرابعة", start: "11:00", end: "12:00" },
  { label: "الخامسة", start: "12:00", end: "13:00" },
  { label: "السادسة", start: "13:00", end: "14:00" },
  { label: "السابعة", start: "14:00", end: "15:00" },
  { label: "الثامنة", start: "15:00", end: "16:00" },
]

const timetableDays = [
  { label: "السبت", value: "Saturday" },
  { label: "الاحد", value: "Sunday" },
  { label: "الاثنين", value: "Monday" },
  { label: "الثلاثاء", value: "Tuesday" },
  { label: "الاربعاء", value: "Wednesday" },
  { label: "الخميس", value: "Thursday" },
]

type TimetableEntry = {
  id: number
  day: string
  start_time: string
  end_time: string
  subject_id?: number
  subject_name?: string | null
}

type SubjectRow = {
  id: number
}

type SubjectLesson = {
  id: number
  created_at?: string | null
}

type AttendanceOverview = {
  average_score?: number | null
  average_percent?: number | null
}

const attendanceChartConfig = {
  attendance: {
    label: "Attendance",
    color: "#39559E",
  },
} satisfies ChartConfig

export default function StudentDashboard() {
  const router = useRouter()
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([])
  const [timetableError, setTimetableError] = useState<string | null>(null)
  const [subjectCount, setSubjectCount] = useState(0)
  const [attendancePercent, setAttendancePercent] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const [currentLessonTargetId, setCurrentLessonTargetId] = useState<number | null>(null)

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const response = (await apiFetch("/student/timetable")) as { data?: TimetableEntry[] }
        setTimetableEntries(Array.isArray(response?.data) ? response.data : [])
        setTimetableError(null)
      } catch (error) {
        console.error("تعذر تحميل جدول الطالب", error)
        setTimetableEntries([])
        setTimetableError("تعذر تحميل جدول الطالب حالياً.")
      }
    }
    void loadTimetable()
  }, [])

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = (await apiFetch("/student/subjects")) as { data?: SubjectRow[] }
        const subjects = Array.isArray(response?.data) ? response.data : []
        setSubjectCount(subjects.length)
      } catch {
        setSubjectCount(0)
      }
    }
    void loadSubjects()
  }, [])

  useEffect(() => {
    const loadAttendanceOverview = async () => {
      try {
        const response = (await apiFetch("/student/attendance/overall")) as {
          data?: AttendanceOverview
        }
        const percentRaw = response?.data?.average_percent
        const scoreRaw = response?.data?.average_score
        const percent =
          typeof percentRaw === "number"
            ? percentRaw
            : typeof scoreRaw === "number"
              ? (scoreRaw / 7) * 100
              : 0
        const safePercent = Math.max(0, Math.min(100, Math.round(percent)))
        setAttendancePercent(safePercent)
      } catch {
        setAttendancePercent(0)
      }
    }
    void loadAttendanceOverview()
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const studentCards = useMemo(() => {
    return baseStudentCards.map((card) =>
      card.title === "المواد الدراسية" ? { ...card, value: String(subjectCount) } : card,
    )
  }, [subjectCount])

  const todayEnglish = new Intl.DateTimeFormat("en", { weekday: "long" }).format(now)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const dayMap: Record<string, string> = {
    السبت: "Saturday",
    الاحد: "Sunday",
    الأحد: "Sunday",
    الاثنين: "Monday",
    الإثنين: "Monday",
    الثلاثاء: "Tuesday",
    الاربعاء: "Wednesday",
    الأربعاء: "Wednesday",
    الخميس: "Thursday",
    الجمعة: "Friday",
  }

  const normalizeDay = (value: string) => {
    const trimmed = value.trim()
    const mapped = dayMap[trimmed] ?? trimmed
    return mapped.toLowerCase()
  }

  const formatTime = (value: string) => {
    if (!value) return "-"
    const [hour, minute] = value.split(":")
    if (!hour || !minute) return value
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
  }

  const normalizeTime = (value: string) => {
    if (!value) return value
    const [hour, minute] = value.split(":")
    if (!hour || !minute) return value
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
  }

  const toMinutes = (value: string) => {
    const [hour, minute] = value.split(":")
    if (!hour || !minute) return 0
    return Number(hour) * 60 + Number(minute)
  }

  const timetableByDay = useMemo(() => {
    const normalized = timetableEntries.map((entry) => ({
      ...entry,
      dayKey: normalizeDay(entry.day),
      startKey: normalizeTime(entry.start_time),
      endKey: normalizeTime(entry.end_time),
    }))

    return timetableDays.map((day) => {
      const entriesForDay = normalized.filter((entry) => normalizeDay(day.value) === entry.dayKey)
      const slots = timetableSlots.map((slot) => {
        const exactMatch = entriesForDay.find(
          (entry) => entry.startKey === slot.start && entry.endKey === slot.end,
        )
        if (exactMatch) return exactMatch
        return (
          entriesForDay.find((entry) => {
            const entryStart = toMinutes(entry.start_time)
            const entryEnd = toMinutes(entry.end_time)
            const slotStart = toMinutes(slot.start)
            const slotEnd = toMinutes(slot.end)
            return entryStart < slotEnd && entryEnd > slotStart
          }) ?? null
        )
      })
      return { day, slots }
    })
  }, [timetableEntries])

  const attendanceChartData = useMemo(() => {
    return [{ name: "attendance", value: attendancePercent, fill: "#39559E" }]
  }, [attendancePercent])

  const currentLesson = useMemo(() => {
    const todayKey = normalizeDay(todayEnglish)
    const todayEntries = timetableEntries.filter((entry) => normalizeDay(entry.day) === todayKey)
    return (
      todayEntries.find((entry) => {
        const start = toMinutes(entry.start_time)
        const end = toMinutes(entry.end_time)
        return currentMinutes >= start && currentMinutes < end
      }) ?? null
    )
  }, [currentMinutes, timetableEntries, todayEnglish])

  const currentLessonSubject =
    currentLesson?.subject_name?.trim() ||
    (currentLesson?.subject_id ? `مادة ${currentLesson.subject_id}` : "لا يوجد درس الآن")

  const currentLessonTime = currentLesson
    ? `${formatTime(currentLesson.start_time)} - ${formatTime(currentLesson.end_time)}`
    : "حالياً خارج وقت الحصص"

  useEffect(() => {
    const currentSubjectId = currentLesson?.subject_id
    if (!currentSubjectId) {
      setCurrentLessonTargetId(null)
      return
    }

    const loadLatestLesson = async () => {
      try {
        const response = (await apiFetch(
          `/student/lessons?subject_id=${currentSubjectId}`,
        )) as { data?: SubjectLesson[] }
        const lessons = Array.isArray(response?.data) ? response.data : []
        const latest = [...lessons].sort((first, second) => {
          const firstTime = first.created_at ? new Date(first.created_at).getTime() : 0
          const secondTime = second.created_at ? new Date(second.created_at).getTime() : 0
          if (secondTime !== firstTime) return secondTime - firstTime
          return second.id - first.id
        })[0]
        setCurrentLessonTargetId(latest?.id ?? null)
      } catch {
        setCurrentLessonTargetId(null)
      }
    }

    void loadLatestLesson()
  }, [currentLesson?.subject_id])

  const handleEnterCurrentLesson = () => {
    if (currentLessonTargetId) {
      router.push(`/student/lessons/${currentLessonTargetId}`)
      return
    }
    router.push("/student/lessons")
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:gap-6 md:py-6">
          <SectionCards items={studentCards} />

          <div className="px-4 lg:px-6">
            <div className="flex flex-wrap items-start gap-40 mr-20">
                
                <div className="relative mt-4 flex h-[170px] w-[200px] items-center justify-center">
                  <div className="mt-20">
                    <div className="text-center text-lg font-semibold text-black">الحضور والغياب</div>
 <ChartContainer
                    config={attendanceChartConfig}
                    className="h-[240px] w-[240px]"
                  >
                    <RadialBarChart
                      data={attendanceChartData}
                      startAngle={180}
                      endAngle={0}
                      innerRadius={114}
                      outerRadius={145}
                      cx="50%"
                      cy="100%"
                    >
                      <PolarAngleAxis
                        type="number"
                        dataKey="value"
                        domain={[0, 100]}
                        tick={false}
                      />
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-transparent last:fill-background"
                        polarRadius={[90, 70]}
                      />
                      <RadialBar dataKey="value" background={{ fill: "#D9DEEC" }} cornerRadius={8} />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} domain={[0, 100]}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) - 18}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan className="fill-black text-[13px] font-bold">
                                    {attendancePercent}%
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                     <div className="mt-2 text-center text-xs font-semibold text-black">
                  نسبة الحضور والغياب اليومي
                </div>
                  </div>
                 
                </div>
             
              
              <Door
                subject={currentLessonSubject}
                timeRange={currentLessonTime}
                enterLabel="ادخل"
                isActive={Boolean(currentLesson)}
                disabled={!currentLesson}
                className="m-0"
                onEnter={handleEnterCurrentLesson}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 mx-4 shadow-sm border border-slate-100 lg:mx-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="text-sm font-semibold">جدول الطالب</div>
              {timetableError ? (
                <div className="text-xs text-red-600">{timetableError}</div>
              ) : null}
            </div>
            <div className="grid grid-cols-9 gap-2 text-sm">
              <div className="flex items-center justify-center rounded-lg bg-[#EAF6FC] px-2 py-3 font-semibold text-black">
                اليوم
              </div>
              {timetableSlots.map((slot) => (
                <div
                  key={slot.label}
                  className="flex items-center justify-center rounded-lg bg-[#EAF6FC] px-1 py-3 text-black"
                >
                  {slot.label} من {formatTime(slot.start)}-{formatTime(slot.end)}
                </div>
              ))}
              {timetableByDay.map(({ day, slots }) => (
                <Fragment key={day.value}>
                  <div className="flex items-center justify-center rounded-lg bg-[#EAF6FC] px-2 py-3 font-semibold text-black">
                    {day.label}
                  </div>
                  {slots.map((entry, index) => {
                    const isToday = normalizeDay(day.value) === normalizeDay(todayEnglish)
                    const isActive =
                      entry &&
                      isToday &&
                      currentMinutes >= toMinutes(entry.start_time) &&
                      currentMinutes < toMinutes(entry.end_time)
                    return (
                      <div
                        key={`${day.value}-${index}`}
                        className={`flex h-12 items-center justify-center rounded-lg border-2 text-sm ${
                          isActive
                            ? "border-green-200 bg-green-100 text-green-900"
                            : "border-[#EAF6FC] bg-white text-slate-700"
                        }`}
                      >
                        {entry?.subject_name ?? (entry?.subject_id ? `مادة ${entry.subject_id}` : "—")}
                      </div>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
