"use client"

import * as React from "react"
import {
  BarChartIcon,
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

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  
  ],
  navSecondary: [
    {
      title: "الإعدادات",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "مساعدة",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "بحث",
      url: "#",
      icon: SearchIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <HomeIcon className="h-5 w-5" />
                <span className="text-base font-semibold">منصة الإدارة</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
