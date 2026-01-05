"use client"

import Link from "next/link"
import { ReactNode, useEffect, useMemo, useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable, type StudentRow } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const PAGE_SIZE = 10

export default function ManagerStudentsPage() {
  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""), [])
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [students, setStudents] = useState<StudentRow[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)

  const normalizeStudent = (item: any, idx = 0): StudentRow => ({
    id: item.id ?? item.student_id ?? idx,
    full_name: item.full_name ?? "",
    email: item.email ?? "",
    phone_number: item.phone_number ?? "",
    level: item.level ?? "",
    class: item.class ?? "",
    gender: item.gender ?? "",
    guardian_name: item.guardian_name ?? "",
    date_of_birth: item.date_of_birth ?? "",
    created_at: item.created_at ?? "",
    country: item.country ?? "",
    state: item.state ?? "",
    city: item.city ?? "",
    certificate_path: item.certificate_path ?? "",
    personal_image_path: item.personal_image_path ?? "",
    paid_amount: Number(item.paid_amount ?? 0),
    total_fee: Number(item.total_fee ?? 0),
    remaining_amount: Number(item.remaining_amount ?? 0),
  })

  useEffect(() => {
    const load = async () => {
      try {
        const studentsRes = await fetch(`${apiRoot}/manager/students/public`, { cache: "no-store" })
        const studentsJson = await studentsRes.json()
        const studentList = Array.isArray(studentsJson?.data) ? studentsJson.data : Array.isArray(studentsJson) ? studentsJson : []
        const normalizedStudents = studentList.map((item: any, idx: number) => normalizeStudent(item, idx))
        setStudents(normalizedStudents)
        setSelectedStudent((prev) => prev ?? normalizedStudents[0] ?? null)
      } catch (error) {
        console.error("فشل جلب الطلاب", error)
        setStudents([])
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
              <h2 className="text-xl font-semibold">الطلاب</h2>
              <span className="text-sm text-muted-foreground">عرض وإدارة الطلاب</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/manager/students/add"
                className="inline-flex h-10 items-center rounded-md bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
              >
                إضافة طالب
              </Link>
            </div>
          </div>

          <div className="w-full">
            <DataTable
              data={students}
              paginate
              pageSize={PAGE_SIZE}
              maxHeight="50vh"
              selectedId={selectedStudent?.id ?? null}
              onSelectRow={setSelectedStudent}
            />
          </div>
          {selectedStudent && (
            <div className="grid gap-4">
              <div className="flex items-start">
                <AvatarTile src={selectedStudent.personal_image_path} name={selectedStudent.full_name} baseUrl={apiBase} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <InfoTile title="الاسم الكامل" value={selectedStudent.full_name} />
                <InfoTile title="البريد الإلكتروني" value={selectedStudent.email || "—"} />
                <InfoTile title="رقم الهاتف" value={selectedStudent.phone_number || "—"} />
                <InfoTile title="المستوى" value={selectedStudent.level || "—"} />
                <InfoTile title="الفصل" value={selectedStudent.class || "—"} />
                <InfoTile title="الجنس" value={selectedStudent.gender || "—"} />
                <InfoTile title="ولي الأمر" value={selectedStudent.guardian_name || "—"} />
                <InfoTile title="تاريخ الميلاد" value={selectedStudent.date_of_birth || "—"} />
                <InfoTile title="تاريخ التسجيل" value={selectedStudent.created_at || "—"} />
                <InfoTile title="الدولة" value={selectedStudent.country || "—"} />
                <InfoTile title="الولاية / المنطقة" value={selectedStudent.state || "—"} />
                <InfoTile title="المدينة" value={selectedStudent.city || "—"} />
                <InfoTile
                  title="الوثائق الرسمية"
                  value={
                    selectedStudent.certificate_path ? (
                      <a
                        href={resolveStorageUrl(selectedStudent.certificate_path, apiBase)}
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
                  title="ملاحظات"
                  value="لا توجد ملاحظات مضافة"
                  className="md:col-span-2"
                />
                <InfoTile
                  title="ملف الطالب"
                  value="يظهر هنا أي محتوى أو معلومات إضافية للطالب المختار."
                  className="md:col-span-3 h-32"
                />
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
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
      <div className="text-xs font-semibold mb-1 text-black">صورة الطالب</div>
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
