"use client"

import * as React from "react"
import {
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  LayersIcon,
  ListChecksIcon,
  RadioTowerIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  VideoIcon,
  WalletIcon,
} from "lucide-react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "مدير المدرسة",
    email: "manager@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "الرئيسية",
      url: "/manager/dashboard",
      icon: HomeIcon,
    },
    {
      title: "الطلاب",
      url: "/manager/students",
      icon: UsersIcon,
    },
    {
      title: "المعلمين",
      url: "/manager/teachers",
      icon: UsersIcon,
    },
    {
      title: "المستويات",
      url: "/manager/levels",
      icon: LayersIcon,
    },
    {
      title: "المواد",
      url: "/manager/subjects",
      icon: BookOpenIcon,
    },
    {
      title: "الإرشاد الطلابي",
      url: "/manager/guidance",
      icon: HelpCircleIcon,
    },
    {
      title: "جدول المعلمين",
      url: "/manager/teacher-timetable",
      icon: ListChecksIcon,
    },
    {
      title: "الرسوم",
      url: "/manager/fees",
      icon: WalletIcon,
    },
 
    {
      title: "ملخصات",
      url: "/manager/summaries",
      icon: LayersIcon,
    },
    {
      title: "تدريبات",
      url: "/manager/quizzes",
      icon: ListChecksIcon,
    },
    {
      title: "اوراق عمل",
      url: "/manager/papers-work",
      icon: FileTextIcon,
    },
    {
      title: "امتحانات",
      url: "/manager/exams-period",
      icon: ClipboardListIcon,
    },
    {
      title: "متابعة المعلمين",
      url: "/manager/teacher-tracking",
      icon: VideoIcon,
    },
    {
      title: "موصل يوتيوب",
      url: "/manager/youtube-connector",
      icon: VideoIcon,
    },
    {
      title: "النتائج",
      url: "#",
      icon: RadioTowerIcon,
    },
    {
      title: "التقارير",
      url: "/manager/reports",
      icon: FileTextIcon,
    },
     {
      title: "الإعدادات",
      url: "/manager/settings",
      icon: SettingsIcon,
    },
  
  ],
  
}

type SchoolSetting = {
  school_name?: string | null
  school_logo_url?: string | null
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [setting, setSetting] = React.useState<SchoolSetting | null>(null)

  React.useEffect(() => {
    let cancelled = false

    const loadSetting = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "")
        const apiRoot = base.endsWith("/api") ? base : `${base}/api`
        const res = await fetch(`${apiRoot}/manager/settings`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          throw new Error("Failed to load settings")
        }

        const json = await res.json()
        if (!cancelled) {
          setSetting((json?.data ?? null) as SchoolSetting | null)
        }
      } catch {
        if (!cancelled) {
          setSetting(null)
        }
      }
    }

    void loadSetting()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Link
          href="/manager/dashboard"
          className="flex flex-col items-center  rounded-2xl  px-3  text-white shadow-sm"
        >
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl shrink-0">
            {setting?.school_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={setting.school_logo_url} alt={setting.school_name ?? "School logo"} className="h-full w-full rounded-[12px] object-contain" />
            ) : (
              <span className="text-lg font-bold text-slate-400">
                {(setting?.school_name ?? "MS").trim().slice(0, 2) || "MS"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl  font-semibold">
              {setting?.school_name?.trim() || "اسم المدرسة"}
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="rounded-md bg-white p-2 shadow-sm">
          <NavUser
            user={data.user}
            buttonClassName="bg-white text-slate-900 hover:bg-slate-50 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900"
            emailClassName="text-slate-500"
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
