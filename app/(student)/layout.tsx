"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  BookOpenIcon,
  ClipboardListIcon,
  HelpCircleIcon,
  HomeIcon,
  LayersIcon,
  VideoIcon,
} from "lucide-react"
import { apiFetch } from "@/lib/api/client"

const studentNav = [
  {
    title: "لوحة الطالب",
    url: "/student/dashboard",
    icon: HomeIcon,
  },
  {
    title: "القاعة",
    url: "/student/lessons",
    icon: VideoIcon,
  },
  {
    title: "الاختبارات",
    url: "/student/monthly-tests",
    icon: ClipboardListIcon,
  },
  {
    title: "المواد الدراسية",
    url: "/student/subjects",
    icon: LayersIcon,
  },
  {
    title: "الارشاد",
    url: "/student/guidance",
    icon: HelpCircleIcon,
  },
  {
    title: "أوراق عمل",
    url: "/student/papers",
    icon: BookOpenIcon,
  },
  
  {
    title: "الدرجات و النتائج",
    url: "/student/results",
    icon: BookOpenIcon,
  },
   
   
   
]

export default function StudentLayout({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<{
    full_name?: string | null
    email?: string | null
    personal_image_url?: string | null
  } | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = (await apiFetch("/student/profile")) as {
          data?: { full_name?: string; email?: string; personal_image_url?: string }
        }
        setProfile(res?.data ?? null)
      } catch {
        setProfile(null)
      }
    }
    void loadProfile()
  }, [])

  return (
    <SidebarProvider>
      <Sidebar side="right" variant="inset" collapsible="offcanvas">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <a href="/student/dashboard">
                  <HomeIcon className="h-5 w-5" />
                  <span className="text-base font-semibold">منصة الطالب</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={studentNav} />
        </SidebarContent>
        <SidebarFooter className="p-3">
          <div className="rounded-2xl bg-white p-2 shadow-sm">
            <NavUser
              user={{
                name: profile?.full_name ?? "طالب",
                email: profile?.email ?? "—",
                avatar: profile?.personal_image_url ?? "",
              }}
              buttonClassName="bg-white text-slate-900 hover:bg-slate-50 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900"
              emailClassName="text-slate-500"
            />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-base font-medium">لوحة الطالب</h1>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
