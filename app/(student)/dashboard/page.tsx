"use client"

import { Fragment, useEffect, useMemo, useState } from "react"

import { SectionCards } from "@/components/section-cards"
import { apiFetch } from "@/lib/api/client"

const studentCards = [
  {
    title: "القاعة",
    value: "جاهز",
    footerTitle: "البث المباشر والتسجيلات",
    footerNote: "آخر تحديث اليوم",
    trend: "none" as const,
    imageSrc: "/assets/mdi_laptop-account.svg",
    imageAlt: "القاعة",
    href: "/student/lessons",
  },
  {
    title: "الاختبارات",
    value: "قريباً",
    footerTitle: "اختبارات شهرية",
    footerNote: "قيد الإعداد",
    trend: "down" as const,
    imageSrc: "/assets/Vector (2).svg",
    imageAlt: "الاختبارات",
  },
  {
    title: "المواد الدراسية",
    value: "قريباً",
    footerTitle: "ملخصات وواجبات",
    footerNote: "قيد الإعداد",
    trend: "none" as const,
    imageSrc: "/assets/Vector (1).svg",
    imageAlt: "المواد الدراسية",
    href: "/student/subjects",
  },
  {
    title: "الارشاد",
    value: "قريباً",
    footerTitle: "دعم وتوجيه",
    footerNote: "قيد الإعداد",
    trend: "none" as const,
    imageSrc: "/assets/Vector.svg",
    imageAlt: "الارشاد",
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

export default function StudentDashboard() {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([])
  const [timetableError, setTimetableError] = useState<string | null>(null)

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

  const todayEnglish = new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date())
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes()

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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:gap-6 md:py-6">
          <SectionCards items={studentCards} />

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
                      currentMinutes <= toMinutes(entry.end_time)
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
