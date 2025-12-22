import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 px-4 lg:px-6 overflow-x-auto">
      <Card className="@container/card bg-[var(--color-sidebar-bg)] text-white border-none shadow-sm">
        <CardHeader className="relative">
          <img
            src="/assets/graduation-cap-line.svg"
            alt="الطلاب"
            className="absolute left-10 top-4 h-35 w-35 opacity-80"
          />
          <CardDescription className="text-white/90"> الطلاب</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            86
          </CardTitle>
        
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            نمو مستمر في التوظيف <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-white/80">
            تمت إضافة 5 معلمين هذا الأسبوع
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-[var(--color-sidebar-bg)] text-white border-none shadow-sm">
        <CardHeader className="relative">
           <img
            src="/assets/mdi_laptop-account.svg"
            alt="الطلاب"
            className="absolute left-10 top-4 h-35 w-35 opacity-80"
          />
          <CardDescription className="text-white/90">الفصول</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            12
          </CardTitle>
        
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            تسجيلات جديدة هذا الأسبوع <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-white/80">
            التركيز على دمج الطلاب الجدد
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-[var(--color-sidebar-bg)] text-white border-none shadow-sm">
        <CardHeader className="relative">
          <img
            src="/assets/Vector (1).svg"
            alt="الطلاب"
            className="absolute left-10 top-4 h-35 w-35 opacity-80"
          />
          <CardDescription className="text-white/90">المواد</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            42
          </CardTitle>
        
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            المحتوى الأكاديمي جاهز 
          </div>
          <div className="text-white/80">تمت مراجعة جميع الخطط</div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-[var(--color-sidebar-bg)] text-white border-none shadow-sm">
        <CardHeader className="relative">
          <img
            src="/assets/Vector (2).svg"
            alt="الطلاب"
            className="absolute left-10 top-4 h-35 w-35 opacity-80"
          />
          <CardDescription className="text-white/90"> المعلمين</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            28
          </CardTitle>
      
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            متابعة يومية للجودة <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-white/80">6 معلمين تمت مراجعتهم اليوم</div>
        </CardFooter>
      </Card>
        <Card className="@container/card bg-[var(--color-sidebar-bg)] text-white border-none shadow-sm">
        <CardHeader className="relative">
          <img
            src="/assets/Vector.svg"
            alt="الطلاب"
            className="absolute left-10 top-4 h-35 w-35 opacity-80"
          />
          <CardDescription className="text-white/90"> الحضور والغياب</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            28
          </CardTitle>
      
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            متابعة يومية للطلاب <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-white/80"> اخر مراجعة يوم </div>
        </CardFooter>
      </Card>
    </div>
  )
}
