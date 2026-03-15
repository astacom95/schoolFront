"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A radar chart"

type LessonChartItem = {
  id: number
  created_at?: string
}

type ChartAreaInteractiveProps = {
  lessons: LessonChartItem[]
}

type MonthlyLessonPoint = {
  month: string
  year: number
  lessons: number
}

const chartConfig = {
  lessons: {
    label: "الدروس",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
]

function isValidDate(value: string | undefined): value is string {
  if (!value) return false
  return !Number.isNaN(new Date(value).getTime())
}

function getMonthLabel(date: Date) {
  return arabicMonths[date.getMonth()] ?? date.toLocaleDateString("ar", { month: "long" })
}

export function ChartAreaInteractive({ lessons }: ChartAreaInteractiveProps) {
  const chartData = React.useMemo<MonthlyLessonPoint[]>(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      return {
        month: getMonthLabel(date),
        year: date.getFullYear(),
        lessons: 0,
      }
    })

    const lessonsByMonth = new Map<string, number>()

    lessons.forEach((lesson) => {
      if (!isValidDate(lesson.created_at)) return

      const lessonDate = new Date(lesson.created_at)
      const key = `${lessonDate.getFullYear()}-${lessonDate.getMonth()}`
      lessonsByMonth.set(key, (lessonsByMonth.get(key) ?? 0) + 1)
    })

    return months.map((item) => {
      const referenceDate = new Date(item.year, arabicMonths.indexOf(item.month), 1)
      const key = `${referenceDate.getFullYear()}-${referenceDate.getMonth()}`
      return {
        ...item,
        lessons: lessonsByMonth.get(key) ?? 0,
      }
    })
  }, [lessons])

  const trend = React.useMemo(() => {
    const currentMonthCount = chartData.at(-1)?.lessons ?? 0
    const previousMonthCount = chartData.at(-2)?.lessons ?? 0

    if (currentMonthCount > previousMonthCount) {
      return "ارتفاع في إنشاء الدروس هذا الشهر"
    }

    if (currentMonthCount < previousMonthCount) {
      return "انخفاض في إنشاء الدروس هذا الشهر"
    }

    return "استقرار في إنشاء الدروس هذا الشهر"
  }, [chartData])

  const rangeLabel = React.useMemo(() => {
    const first = chartData[0]
    const last = chartData.at(-1)

    if (!first || !last) {
      return ""
    }

    return `من ${first.month} ${first.year} إلى ${last.month} ${last.year}`
  }, [chartData])

  return (
    <Card>
      <CardHeader className="items-center pb-4 text-center">
        <CardTitle>الدروس المنشأة شهرياً</CardTitle>
        <CardDescription>إجمالي عدد الدروس المنشأة خلال آخر 6 أشهر</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto text-md aspect-square max-h-[320px] w-full"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const year = payload?.[0]?.payload?.year
                    return `${value} ${year}`
                  }}
                />
              }
            />
            <PolarAngleAxis dataKey="month"/>
            <PolarGrid />
            <Radar
              dataKey="lessons"
              name="الدروس"
              fill="var(--color-lessons)"
              fillOpacity={0.6}
              stroke="var(--color-lessons)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-md">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trend}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          {rangeLabel}
        </div>
      </CardFooter>
    </Card>
  )
}
