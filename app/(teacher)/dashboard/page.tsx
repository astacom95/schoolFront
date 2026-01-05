"use client"

import { Fragment, useEffect, useMemo, useState } from "react"

import {
  BarChartIcon,
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  HomeIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react"

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
import { NavMain } from "@/components/nav-main"
import { SectionCards } from "@/components/section-cards"
import { TeacherAttendancePie } from "@/components/teacher-attendance-pie"
import { apiFetch } from "@/lib/api/client"

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

const teacherCards = [
  {
    title: "الطلاب",
    value: "0",
    footerTitle: "متابعة حضور الطلاب",
    footerNote: "اخر تحديث اليوم",
    trend: "none" as const,
    imageSrc: "/assets/graduation-cap-line.svg",
    imageAlt: "الطلاب",
  },
  {
    title: "الدروس",
    value: "0",
    footerTitle: "دروس هذا الأسبوع",
    footerNote: "جاهزة للبث",
    trend: "up" as const,
    imageSrc: "/assets/mdi_laptop-account.svg",
    imageAlt: "الدروس",
  },
  {
    title: "المواد",
    value: "0",
    footerTitle: "المواد الخاصة بك",
    footerNote: "محدثة باستمرار",
    trend: "none" as const,
    imageSrc: "/assets/Vector (1).svg",
    imageAlt: "المواد",
  },
  {
    title: "التقارير",
    value: "0",
    footerTitle: "تقارير الأداء",
    footerNote: "قيد الإعداد",
    trend: "down" as const,
    imageSrc: "/assets/Vector (2).svg",
    imageAlt: "التقارير",
  },
  {
    title: "الحضور",
    value: "0",
    footerTitle: "سجلات الحضور",
    footerNote: "اخر مراجعة اليوم",
    trend: "down" as const,
    imageSrc: "/assets/Vector.svg",
    imageAlt: "الحضور",
  },
]

const teacherPlanRows = [
  { label: "الانجليزي", value: 100 },
  { label: "رياضيات", value: 75 },
  { label: "عربي", value: 50 },
  { label: "فيزياء", value: 25 },
  { label: "تاريخ", value: 0 },
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

export default function TeacherDashboard() {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([])

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const response = (await apiFetch("/teacher/timetable")) as { data?: TimetableEntry[] }
        setTimetableEntries(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setTimetableEntries([])
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
    return Number.parseInt(hour, 10) * 60 + Number.parseInt(minute, 10)
  }

  const timetableByDay = useMemo(() => {
    const normalized = timetableEntries.map((entry) => ({
      ...entry,
      dayKey: normalizeDay(entry.day),
      startKey: normalizeTime(entry.start_time),
      endKey: normalizeTime(entry.end_time),
    }))
    return timetableDays.map((day) => {
      const entriesForDay = normalized.filter((entry) => entry.dayKey === normalizeDay(day.value))
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
            <h1 className="text-base font-medium">لوحة المعلم</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards items={teacherCards} />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-transparent mt-12 px-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">الخطة الدراسية</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {teacherPlanRows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-3">
                        <span className="text-[11px] text-black text-center">{row.label}</span>
                        <div className="relative h-3 rounded-full bg-[#B0D2DE] overflow-hidden">
                          <div
                            className="absolute inset-y-0 right-0 rounded-full bg-[#4EE8D0]"
                            style={{ width: `${row.value}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-black text-center">{row.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <TeacherAttendancePie />
              </div>
            
              <div className="rounded-2xl bg-white p-4 mx-4 shadow-sm border border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="text-sm font-semibold">جدول المعلم</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] text-white px-3 text-sm  outline-none"
                      defaultValue=""
                      aria-label="اختر المرحلة"
                    >
                      <option  value="" disabled>المرحلة</option>
                      <option value="secondary">ثانوي</option>
                      <option value="middle">متوسط</option>
                      <option value="primary">ابتدائي</option>
                    </select>
                    <select
                      className="h-9 rounded-lg bg-[var(--color-sidebar-bg)] text-white px-3 text-sm outline-none"
                      defaultValue=""
                      aria-label="اختر الصف"
                    >
                      <option value="" disabled>الصف</option>
                      <option value="first">الأول</option>
                      <option value="second">الثاني</option>
                      <option value="third">الثالث</option>
                    </select>
                    <button
                      type="button"
                      className="h-9 rounded-lg bg-[var(--color-sidebar-bg)]  px-4 text-sm text-white"
                    >
                      بحث
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-9 gap-2 text-sm">
                  <div className="flex items-center justify-center rounded-lg bg-[#EAF6FC] px-2 py-3 font-semibold text-black">
                    اليوم
                  </div>
                  {timetableSlots.map((slot) => (
                    <div
                      key={slot.label}
                      className="flex items-center justify-center rounded-lg bg-[#EAF6FC] px-1 py-3  text-black"
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
                            {entry?.subject_name ?? ""}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
