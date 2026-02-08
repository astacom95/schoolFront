"use client"

import { useEffect, useMemo, useState } from "react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { apiFetch } from "@/lib/api/client"

const chartConfig = {
  value: {
    label: "النسبة",
  },
  present: {
    label: "حاضر",
    color: "#4EE8D0",
  },
  absent: {
    label: "غياب",
    color: "#B0D2DE",
  },
  late: {
    label: "متأخر",
    color: "#7FD9E9",
  },
  excused: {
    label: "بعذر",
    color: "#9AD7B6",
  },
  other: {
    label: "اخرى",
    color: "#D2E7EE",
  },
} satisfies ChartConfig

type AttendanceSummary = {
  present?: number
  absent?: number
  total_possible?: number
  present_percent?: number
  absent_percent?: number
}

export function TeacherAttendancePie() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = (await apiFetch("/teacher/attendance/summary")) as {
          data?: AttendanceSummary
        }
        setSummary(response?.data ?? null)
      } catch {
        setSummary(null)
      }
    }
    void loadSummary()
  }, [])

  const chartData = useMemo(() => {
    const present = Math.max(0, Number(summary?.present ?? 0))
    const absent = Math.max(0, Number(summary?.absent ?? 0))
    return [
      { status: "حاضر", value: present, fill: "var(--color-present)" },
      { status: "غياب", value: absent, fill: "var(--color-absent)" },
      { status: "متأخر", value: 0, fill: "var(--color-late)" },
      { status: "بعذر", value: 0, fill: "var(--color-excused)" },
      { status: "اخرى", value: 0, fill: "var(--color-other)" },
    ]
  }, [summary])

  return (
    <Card className="flex flex-col border-none bg-transparent shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm font-semibold">حضور الطلاب</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[240px]"
        >
          {summary ? (
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="status"
                stroke="0"
              />
            </PieChart>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              لا توجد بيانات حضور.
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
