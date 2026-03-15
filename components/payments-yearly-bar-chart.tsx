"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type PaymentsYearSeriesItem = {
  month: number
  month_label: string
  total_amount: number
}

export type PaymentsAnalytics = {
  selected_year: number
  available_years: number[]
  year_total: number
  comparison_year?: number | null
  comparison_year_total?: number | null
  series: PaymentsYearSeriesItem[]
}

type PaymentsYearlyBarChartProps = {
  data: PaymentsAnalytics | null
  loading?: boolean
  selectedYear: string
  onYearChange: (year: string) => void
}

const chartConfig = {
  total_amount: {
    label: "المدفوعات",
    color: "var(--color-sidebar-bg)",
  },
} satisfies ChartConfig

function formatAmount(value: number) {
  return new Intl.NumberFormat("ar", {
    maximumFractionDigits: 2,
  }).format(value)
}

export function PaymentsYearlyBarChart({
  data,
  loading = false,
  selectedYear,
  onYearChange,
}: PaymentsYearlyBarChartProps) {
  const trendSummary = React.useMemo(() => {
    if (!data || data.comparison_year == null || data.comparison_year_total == null) {
      return "لا توجد مدفوعات مسجلة للمقارنة"
    }

    if (data.year_total > data.comparison_year_total) {
      return `ارتفاع عن سنة ${data.comparison_year}`
    }

    if (data.year_total < data.comparison_year_total) {
      return `انخفاض عن سنة ${data.comparison_year}`
    }

    return `استقرار مقارنة بسنة ${data.comparison_year}`
  }, [data])

  const footerSummary = loading
    ? "جاري تحميل بيانات المدفوعات"
    : data?.year_total
      ? `إجمالي السنة: ${formatAmount(data.year_total)}`
      : "سيتم تحديث الرسم عند توفر بيانات مدفوعات"

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>المدفوعات الشهرية</CardTitle>
          <CardDescription>
            إجمالي المدفوعات خلال سنة {selectedYear || data?.selected_year || new Date().getFullYear()}
          </CardDescription>
        </div>
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-full sm:w-40" aria-label="اختر السنة">
            <SelectValue placeholder="اختر السنة" />
          </SelectTrigger>
          <SelectContent>
            {(data?.available_years ?? []).map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] text-md w-full">
          <BarChart
            accessibilityLayer
            data={data?.series ?? []}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month_label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => String(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const amount = typeof value === "number" ? value : Number(value)
                    return (
                      <div className="flex min-w-[10rem] items-center justify-between gap-3">
                        <span className="font-medium">{item.payload.month_label}</span>
                        <span>{formatAmount(amount)}</span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar dataKey="total_amount" fill="var(--color-sidebar-bg)" radius={8}>
              <LabelList
                dataKey="total_amount"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => formatAmount(value)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trendSummary}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">{footerSummary}</div>
      </CardFooter>
    </Card>
  )
}
