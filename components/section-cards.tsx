import type { ReactNode } from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionCardItem = {
  title: string
  value: string
  footerTitle?: string
  footerNote?: string
  trend?: "up" | "down" | "none"
  imageSrc?: string
  imageAlt?: string
  href?: string
}

const defaultItems: SectionCardItem[] = [
  {
    title: "الطلاب",
    value: "86",
    footerTitle: "نمو مستمر في التوظيف",
    footerNote: "تمت إضافة 5 معلمين هذا الأسبوع",
    trend: "up",
    imageSrc: "/assets/graduation-cap-line.svg",
    imageAlt: "الطلاب",
  },
  {
    title: "الفصول",
    value: "12",
    footerTitle: "تسجيلات جديدة هذا الأسبوع",
    footerNote: "التركيز على دمج الطلاب الجدد",
    trend: "up",
    imageSrc: "/assets/mdi_laptop-account.svg",
    imageAlt: "الفصول",
  },
  {
    title: "المواد",
    value: "42",
    footerTitle: "المحتوى الأكاديمي جاهز",
    footerNote: "تمت مراجعة جميع الخطط",
    trend: "none",
    imageSrc: "/assets/Vector (1).svg",
    imageAlt: "المواد",
  },
  {
    title: "المعلمين",
    value: "28",
    footerTitle: "متابعة يومية للجودة",
    footerNote: "6 معلمين تمت مراجعتهم اليوم",
    trend: "down",
    imageSrc: "/assets/Vector (2).svg",
    imageAlt: "المعلمين",
  },
  {
    title: "الحضور والغياب",
    value: "28",
    footerTitle: "متابعة يومية للطلاب",
    footerNote: "اخر مراجعة يوم",
    trend: "down",
    imageSrc: "/assets/Vector.svg",
    imageAlt: "الحضور والغياب",
  },
]

export function SectionCards({ items = defaultItems }: { items?: SectionCardItem[] }) {
  return (
    <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 px-4 lg:px-6 overflow-x-auto">
      {items.map((item) => (
        <Card
          key={item.title}
          className="@container/card bg-[var(--color-sidebar-bg)] text-white border-none shadow-sm"
        >
          <CardLink href={item.href} disabled={!item.href}>
            <CardHeader className="relative">
              {item.imageSrc ? (
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt ?? item.title}
                  className="absolute left-10 top-4 h-35 w-35 opacity-80"
                />
              ) : null}
              <CardDescription className="text-white/90">{item.title}</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {item.value}
              </CardTitle>
            </CardHeader>
            {(item.footerTitle || item.footerNote) && (
              <CardFooter className="flex-col items-start gap-1 text-sm">
                {item.footerTitle ? (
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    {item.footerTitle}
                    {item.trend === "up" && <TrendingUpIcon className="size-4" />}
                    {item.trend === "down" && <TrendingDownIcon className="size-4" />}
                  </div>
                ) : null}
                {item.footerNote ? (
                  <div className="text-white/80">{item.footerNote}</div>
                ) : null}
              </CardFooter>
            )}
          </CardLink>
        </Card>
      ))}
    </div>
  )
}

function CardLink({
  href,
  disabled,
  children,
}: {
  href?: string
  disabled?: boolean
  children: ReactNode
}) {
  const className = `block h-full ${disabled ? "cursor-default" : "cursor-pointer hover:opacity-90"}`
  if (!href || disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
