 "use client";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ManagerDashboard() {
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        const res = await fetch(`${base}/api/manager/students/public`)
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
        const normalized = list.map((item: any, idx: number) => ({
          id: item.id ?? item.student_id ?? idx,
          full_name: item.full_name ?? item.name ?? item.user?.full_name ?? "",
          email: item.email ?? item.user?.email ?? "",
          phone_number: item.phone_number ?? item.user?.phone_number ?? "",
          level: item.level?.name ?? item.level_name ?? item.level ?? "",
          class: item.class?.name ?? item.class_name ?? item.class ?? "",
          gender: item.gender ?? "",
        }))
        setStudents(normalized)
      } catch (error) {
        console.error("فشل جلب الطلاب", error)
        setStudents([])
      }
    }
    void load()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar side="right" variant="inset" />
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <SectionCards />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                  <DataTable data={students} />
                </div>
              </div>
            </div>
          </SidebarInset>
      </SidebarProvider>
  )
}
