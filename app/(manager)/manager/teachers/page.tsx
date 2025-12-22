"use client"

import Link from "next/link"
import { ReactNode, useEffect, useMemo, useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable, type StudentRow } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const PAGE_SIZE = 10

export default function ManagerTeachersPage() {
  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""), [])
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [teachers, setTeachers] = useState<StudentRow[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<StudentRow | null>(null)

  const normalizeTeacher = (item: any, idx = 0): StudentRow => ({
    id: item.id ?? idx,
    full_name: item.full_name ?? "",
    email: item.email ?? "",
    phone_number: item.phone_number ?? "",
    gender: item.gender ?? "",
    date_of_birth: item.date_of_birth ?? "",
    created_at: item.created_at ?? "",
    country: item.country ?? "",
    state: item.state ?? "",
    city: item.city ?? "",
    certificate_path: item.certificate_path ?? "",
    personal_image_path: item.personal_image_path ?? "",
    cv_path: item.cv_path ?? "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiRoot}/manager/teachers/public`, { cache: "no-store" })
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
        const normalized = list.map((item: any, idx: number) => normalizeTeacher(item, idx))
        setTeachers(normalized)
        setSelectedTeacher((prev) => prev ?? normalized[0] ?? null)
      } catch (error) {
        console.error("فشل جلب المعلمين", error)
        setTeachers([])
      }
    }
    void load()
  }, [apiRoot])

  return (
    <SidebarProvider>
      <AppSidebar side="right" variant="inset" />
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <SiteHeader />
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-4 md:py-6 gap-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">المعلمين</h2>
              <span className="text-sm text-muted-foreground">عرض وإدارة المعلمين</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/manager/teachers/add"
                className="inline-flex h-10 items-center rounded-md bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
              >
                إضافة معلم
              </Link>
            </div>
          </div>

          <div className="w-full">
            <DataTable
              data={teachers}
              paginate
              pageSize={PAGE_SIZE}
              maxHeight="50vh"
              selectedId={selectedTeacher?.id ?? null}
              onSelectRow={setSelectedTeacher}
              showFinanceColumns={false}
              title="قائمة المعلمين"
            />
          </div>
          {selectedTeacher && (
            <div className="grid gap-4">
              <div className="flex items-start">
                <AvatarTile src={selectedTeacher.personal_image_path} name={selectedTeacher.full_name} baseUrl={apiBase} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <InfoTile title="الاسم الكامل" value={selectedTeacher.full_name} />
                <InfoTile title="البريد الإلكتروني" value={selectedTeacher.email || "—"} />
                <InfoTile title="رقم الهاتف" value={selectedTeacher.phone_number || "—"} />
                <InfoTile title="الجنس" value={selectedTeacher.gender || "—"} />
                <InfoTile title="تاريخ الميلاد" value={selectedTeacher.date_of_birth || "—"} />
                <InfoTile title="تاريخ التسجيل" value={selectedTeacher.created_at || "—"} />
                <InfoTile title="الدولة" value={selectedTeacher.country || "—"} />
                <InfoTile title="الولاية / المنطقة" value={selectedTeacher.state || "—"} />
                <InfoTile title="المدينة" value={selectedTeacher.city || "—"} />
                <InfoTile
                  title="الوثائق الرسمية"
                  value={
                    selectedTeacher.certificate_path ? (
                      <a
                        href={resolveStorageUrl(selectedTeacher.certificate_path, apiBase)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-black"
                      >
                        عرض الوثيقة
                      </a>
                    ) : (
                      "لا توجد وثائق"
                    )
                  }
                  className="md:col-span-3"
                />
                <InfoTile
                  title="السيرة الذاتية"
                  value={
                    selectedTeacher.cv_path ? (
                      <a
                        href={resolveStorageUrl(selectedTeacher.cv_path, apiBase)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-black"
                      >
                        عرض السيرة الذاتية
                      </a>
                    ) : (
                      "لا يوجد ملف"
                    )
                  }
                  className="md:col-span-3"
                />
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
      <style jsx global>{`
          [data-sidebar="sidebar"] {
            background: var(--color-sidebar-bg);
            color: var(--color-sidebar-fg);
          }
        `}</style>  
    </SidebarProvider>
  )
}

function InfoTile({
  title,
  value,
  className,
}: {
  title: string
  value: ReactNode
  className?: string
}) {
  return (
    <div className={className ?? ""}>
      <div className="text-xs font-semibold mb-1 text-black">{title}</div>
      <div className="rounded-xl bg-[#c5dfe3] px-4 py-3 text-right text-sm text-black shadow-sm">
        <div className="text-[13px] leading-relaxed">{value}</div>
      </div>
    </div>
  )
}

function AvatarTile({ src, name, baseUrl }: { src?: string | null; name: string; baseUrl: string }) {
  const initial = name?.[0] ?? "?"
  const safeSrc = src && typeof src === "string" ? src : null
  const resolved = resolveStorageUrl(safeSrc, baseUrl)
  return (
    <div className="flex flex-col">
      <div className="text-xs font-semibold mb-1 text-black">صورة المعلم</div>
      <div className="h-32 w-32 rounded-xl bg-[#c5dfe3] text-black shadow-sm overflow-hidden flex items-center justify-center">
        {safeSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolved}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-lg font-semibold">{initial}</span>
        )}
      </div>
    </div>
  )
}

function resolveStorageUrl(path: string | null | undefined, base: string) {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
