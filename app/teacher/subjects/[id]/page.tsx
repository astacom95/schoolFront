"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
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
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

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
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SubjectDetails = {
  id: number
  name: string
  total_lessons?: number | null
  level?: string | null
  class?: string | null
  book_thumbnail?: string | null
  lessons_count?: number | null
}

type LessonRow = {
  id: number
  title: string
  subject_name?: string | null
  created_at?: string | null
  has_media?: boolean
}

type SubjectTime = {
  id: number
  day: string
  start_time: string
  end_time: string
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

const chartConfig = {
  progress: {
    label: "Progress",
    color: "#1D1E1F",
  },
} satisfies ChartConfig

export default function TeacherSubjectDetailsPage() {
  const params = useParams()
  const subjectId = Number(params?.id)
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [subject, setSubject] = useState<SubjectDetails | null>(null)
  const [subjectTimes, setSubjectTimes] = useState<SubjectTime[]>([])
  const [lessons, setLessons] = useState<LessonRow[]>([])

  useEffect(() => {
    const loadSubject = async () => {
      if (!subjectId) return
      try {
        const response = (await apiFetch(`/teacher/subjects/${subjectId}`)) as {
          data?: SubjectDetails
        }
        setSubject(response?.data ?? null)
      } catch {
        setSubject(null)
      }
    }
    void loadSubject()
  }, [subjectId])

  useEffect(() => {
    const loadTimes = async () => {
      if (!subjectId) {
        setSubjectTimes([])
        return
      }
      try {
        const response = (await apiFetch(`/teacher/timetable?subject_id=${subjectId}`)) as {
          data?: SubjectTime[]
        }
        setSubjectTimes(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setSubjectTimes([])
      }
    }
    void loadTimes()
  }, [subjectId])

  useEffect(() => {
    const loadLessons = async () => {
      if (!subjectId) {
        setLessons([])
        return
      }
      try {
        const response = (await apiFetch(`/teacher/lessons?subject_id=${subjectId}`)) as {
          data?: LessonRow[]
        }
        setLessons(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setLessons([])
      }
    }
    void loadLessons()
  }, [subjectId])

  const imageUrl = useMemo(() => {
    const rawUrl = subject?.book_thumbnail ?? ""
    if (!rawUrl) return ""
    return rawUrl.startsWith("/storage") ? `${fileBaseUrl}${rawUrl}` : rawUrl
  }, [subject?.book_thumbnail, fileBaseUrl])

  const totalLessons = subject?.total_lessons ?? 0
  const lessonsCount = subject?.lessons_count ?? 0
  const progressPercent =
    totalLessons > 0 ? Math.min(100, Math.round((lessonsCount / totalLessons) * 100)) : 0
  const lessonsByCreatedAt = useMemo(() => {
    return [...lessons].sort((first, second) => {
      const firstTime = first.created_at ? new Date(first.created_at).getTime() : 0
      const secondTime = second.created_at ? new Date(second.created_at).getTime() : 0
      return firstTime - secondTime
    })
  }, [lessons])
  const lessonOrderNumber = lessonsByCreatedAt.length > 0 ? lessonsByCreatedAt.length : 1

  const chartData = [
    { name: "progress", value: progressPercent, fill: "#1D1E1F" },
  ]
  const formatTime = (value: string) => {
    if (!value) return "-"
    const [hour, minute] = value.split(":")
    if (!hour || !minute) return value
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
  }

  const todayLabel = new Intl.DateTimeFormat("ar", { weekday: "long" }).format(new Date())
  const englishToday = new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date())
  const englishTodayShort = new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date())

  const normalizeDay = (value: string) =>
    value
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/الأحد/g, "الاحد")

  const arabicDayMap: Record<string, string> = {
    saturday: "السبت",
    sat: "السبت",
    sunday: "الاحد",
    sun: "الاحد",
    monday: "الاثنين",
    mon: "الاثنين",
    tuesday: "الثلاثاء",
    tue: "الثلاثاء",
    wednesday: "الاربعاء",
    wed: "الاربعاء",
    thursday: "الخميس",
    thu: "الخميس",
    friday: "الجمعة",
    fri: "الجمعة",
  }

  const todayArabicFromEnglish =
    arabicDayMap[englishToday.toLowerCase()] || arabicDayMap[englishTodayShort.toLowerCase()] || ""
  const toArabicDay = (value: string) => {
    const key = value.trim().toLowerCase()
    return arabicDayMap[key] || value
  }

  const normalizedToday = normalizeDay(todayArabicFromEnglish || todayLabel)

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
            <h1 className="text-base font-medium">تفاصيل المادة</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="order-2 w-full lg:order-1 lg:flex-1">
                    <Card className="border border-slate-100 shadow-sm">
                      <CardHeader className="items-center pb-0">
                        <CardTitle className="text-base">نسبة إنجاز الدروس</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 pb-6">
                        <div className="flex w-full flex-col items-center gap-4">
                          <ChartContainer
                            config={chartConfig}
                            className="mx-auto w-full max-w-[260px] aspect-square min-h-[260px]"
                          >
                            <RadialBarChart
                              data={chartData}
                              startAngle={90}
                              endAngle={-270}
                              innerRadius={80}
                              outerRadius={110}
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
                                className="first:fill-muted last:fill-background"
                                polarRadius={[86, 74]}
                              />
                              <RadialBar
                                dataKey="value"
                                background={{ fill: "#C0C0C0" }}
                                cornerRadius={10}
                              />
                              <PolarRadiusAxis
                                tick={false}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                              >
                                <Label
                                  content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                      return (
                                        <text
                                          x={viewBox.cx}
                                          y={viewBox.cy}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                        >
                                          <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-4xl font-bold"
                                          >
                                            {progressPercent}%
                                          </tspan>
                                          <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground text-sm"
                                          >
                                            {lessonsCount} / {totalLessons}
                                          </tspan>
                                        </text>
                                      )
                                    }
                                  }}
                                />
                              </PolarRadiusAxis>
                            </RadialBarChart>
                          </ChartContainer>
                                                  <CardTitle className="text-base">جدول المادة</CardTitle>

                          <div className="flex flex-wrap items-center justify-center gap-3">
                            {subjectTimes.length === 0 ? (
                              <div className="text-sm text-slate-500">لا توجد مواعيد للمادة.</div>
                            ) : (
                              subjectTimes.map((entry) => (
                                <div
                                  key={entry.id}
                                  className={`flex w-92 h-32 px-4 flex-col items-center justify-center rounded-md text-white ${normalizeDay(toArabicDay(entry.day)) === normalizedToday ? "bg-green-500" : "bg-[--color-sidebar-bg]"}`}
                                >
                                  <div className="text-[22px] font-semibold leading-[45px] text-[#F5F5F5]">
                                    {entry.day}
                                  </div>
                                  <div className="text-16 font-bold leading-[45px] text-white/90">
                                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="order-1 w-full max-w-[280px] lg:order-2">
                    <div className="overflow-hidden rounded-lg shadow-sm">
                      <div className="relative h-[367px] w-[254px] max-w-full overflow-hidden rounded-lg">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={subject?.name ?? "subject"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[#EAF6FC] text-sm text-slate-500">
                            لا يوجد غلاف
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-4 text-[var(--color-text)]">
                        <h3 className="mb-1 text-lg font-semibold">
                          {subject?.name ?? "-"}
                        </h3>
                        <div className="space-y-1 text-[14px] leading-[22px] text-slate-600">
                          <div>المرحلة: {subject?.level ?? "-"}</div>
                          <div className="flex flex-row gap-8">
                            <div>الصف: {subject?.class ?? "-"}</div>
                            <div>عدد الدروس: {totalLessons}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl font-semibold">دروس المادة</h2>
                  {lessons.length > 0 ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {lessonsByCreatedAt.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="relative w-full rounded-[12px] border border-slate-100 bg-white p-4 shadow-sm"
                        >
                          <div className="absolute right-6 top-5 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-[#D3D4DD]" />
                            <span className="h-2 w-2 rounded-full bg-[#D3D4DD]" />
                            <span className="h-2 w-2 rounded-full bg-[#D3D4DD]" />
                            
                          </div>
                          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
                            <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-[25px] bg-[#1D1E1F] text-white md:h-[220px] md:w-[210px]">
                              <div className="pointer-events-none absolute inset-0">
                                <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[#35C2FF]/20 blur-3xl" />
                                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#FF5E5B]/20 blur-3xl animate-pulse" />
                                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(255,255,255,0.08),rgba(0,0,0,0))]" />
                              </div>
                              <div className="absolute text-[72px] font-extrabold leading-[90px] tracking-[-0.01em] drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
                                {index + 1}
                              </div>
                              <div className="absolute bottom-4 right-4">
                                <span className="relative flex h-3 w-3">
                                  {lesson.has_media ? (
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-100 opacity-70" />
                                  ) : <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5E5B] opacity-70" />}
                                  {lesson.has_media  ? (
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                                  ) : (
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FF5E5B]" />
                                  )}
                                </span>
                              </div>
                            
                            
                            </div>
                            <div className="flex flex-1 flex-col gap-6">
                              <div className="flex flex-col gap-3">
                                <h3 className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em] text-black">
                                  {lesson.title}
                                </h3>
                                <p className="text-[16px] font-medium leading-[21px] tracking-[-0.01em] text-[#7B7A81]">
                                  {lesson.subject_name ?? "—"}
                                </p>
                              </div>
                              <div className="flex flex-col text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-[#424246]">
                                <span className="text-[#7B7A81]">
                                  {lesson.created_at
                                    ? new Intl.DateTimeFormat("en", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      }).format(new Date(lesson.created_at))
                                    : "—"}
                                </span>
                                <span className="mt-2 inline-flex w-fit rounded-full px-3 py-1 text-[12px] font-semibold">
                                  {lesson.has_media ? (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                                      مسجل
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-red-100 px-3 py-1 text-red-600">
                                      غير مسجل
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card mt-4">لا توجد دروس لهذه المادة بعد.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
