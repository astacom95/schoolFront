"use client"
import Link from "next/link"

import { useEffect, useMemo, useState } from "react"
import {
  BarChartIcon,
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  HomeIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react"

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

type SubjectRow = {
  id: number
  name: string
  total_lessons?: number | null
  level?: string | null
  class?: string | null
  book_thumbnail?: string | null
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

export default function TeacherSubjectsPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [subjects, setSubjects] = useState<SubjectRow[]>([])

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = (await apiFetch("/teacher/subjects")) as { data?: SubjectRow[] }
        setSubjects(Array.isArray(response?.data) ? response.data : [])
      } catch {
        setSubjects([])
      }
    }
    void loadSubjects()
  }, [])

  const subjectCards = useMemo(() => {
    return subjects.map((subject) => {
      const rawUrl = subject.book_thumbnail ?? ""
      const imageUrl =
        rawUrl && rawUrl.startsWith("/storage") ? `${fileBaseUrl}${rawUrl}` : rawUrl
      return {
        ...subject,
        imageUrl,
      }
    })
  }, [subjects, fileBaseUrl])

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
            <h1 className="text-base font-medium">المواد</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {subjectCards.length === 0 ? (
                  <div className="card">لا توجد مواد مرتبطة بتخصصات المعلم حالياً.</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subjectCards.map((subject) => (
                      <Link
                        key={subject.id}
                         href={`/teacher/subjects/${subject.id}`}
                        className="relative h-[357px] w-[254px] overflow-hidden rounded-lg shadow-sm"
                      >
                        {subject.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={subject.imageUrl}
                            alt={subject.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[#EAF6FC] text-sm text-slate-500">
                            لا يوجد غلاف
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-[98px] rounded-b-lg bg-gray-900" />
                        <div className="absolute inset-x-0 bottom-0 h-[98px] px-4 py-3 text-white">
                          <h3 className="mb-1 text-sm font-semibold text-white">
                            {subject.name}
                          </h3>
                          <div className="space-y-1 text-[12px] font-semibold leading-[22px] text-white/90">
                            <div>المرحلة: {subject.level ?? "-"}</div>
                            <div className="flex flex-row gap-8">
                                  <div>الصف: {subject.class ?? "-"}</div>
                              <div>عدد الدروس: {subject.total_lessons ?? 0}</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
