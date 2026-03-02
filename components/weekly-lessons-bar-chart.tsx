"use client"

import * as React from "react"
import { Bar, BarChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type LessonActivityItem = {
  id: number
  created_at?: string
  has_media?: boolean
}

type WeeklyLessonsBarChartProps = {
  lessons: LessonActivityItem[]
}

type WeeklyLessonPoint = {
  date: string
  dayLabel: string
  created: number
  recorded: number
}

const chartConfig = {
  created: {
    label: "الدروس المنشأة",
    color: "var(--color-sidebar-bg)",
  },
  recorded: {
    label: "الدروس المسجلة",
    color: "var(--color-sidebar-bg)",
  },
} satisfies ChartConfig

const arabicDays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
]

function isValidDate(value: string | undefined): value is string {
  if (!value) return false
  return !Number.isNaN(new Date(value).getTime())
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function WeeklyLessonsBarChart({ lessons }: WeeklyLessonsBarChartProps) {
  const chartData = React.useMemo<WeeklyLessonPoint[]>(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)

      return {
        date: formatDateKey(date),
        dayLabel: arabicDays[date.getDay()],
        created: 0,
        recorded: 0,
      }
    })

    const countsByDate = new Map<string, { created: number; recorded: number }>()

    lessons.forEach((lesson) => {
      if (!isValidDate(lesson.created_at)) return

      const lessonDate = new Date(lesson.created_at)
      const lessonDateKey = formatDateKey(lessonDate)

      if (!days.some((day) => day.date === lessonDateKey)) return

      const current = countsByDate.get(lessonDateKey) ?? { created: 0, recorded: 0 }
      current.created += 1
      if (lesson.has_media) {
        current.recorded += 1
      }
      countsByDate.set(lessonDateKey, current)
    })

    return days.map((day) => {
      const current = countsByDate.get(day.date)
      return {
        ...day,
        created: current?.created ?? 0,
        recorded: current?.recorded ?? 0,
      }
    })
  }, [lessons])

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>الدروس المنشأة والمسجلة هذا الأسبوع</CardTitle>
        <CardDescription>مقارنة يومية خلال الأسبوع الحالي</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const item = chartData.find((entry) => entry.date === value)
                return item?.dayLabel ?? value
              }}
            />
            <Bar
              dataKey="recorded"
              stackId="a"
              barSize={55}
              fill="var(--color-sidebar-bg)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="created"
              stackId="a"
              barSize={55}
              fill="color-mix(in srgb, var(--color-sidebar-bg) 10%, transparent)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const dayLabel = payload?.[0]?.payload?.dayLabel
                    return `${dayLabel ?? ""} ${value}`.trim()
                  }}
                />
              }
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
