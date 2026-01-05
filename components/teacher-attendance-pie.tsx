"use client"

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

const chartData = [
  { status: "حاضر", value: 62, fill: "var(--color-present)" },
  { status: "غياب", value: 18, fill: "var(--color-absent)" },
  { status: "متأخر", value: 12, fill: "var(--color-late)" },
  { status: "بعذر", value: 6, fill: "var(--color-excused)" },
  { status: "اخرى", value: 2, fill: "var(--color-other)" },
]

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

export function TeacherAttendancePie() {
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
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
