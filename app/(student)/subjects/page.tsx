"use client"

import { useEffect, useMemo, useState } from "react"

import { apiFetch } from "@/lib/api/client"

type SubjectRow = {
  id: number
  name: string
  total_lessons?: number | null
  level?: string | null
  class?: string | null
  book_thumbnail?: string | null
}

export default function StudentSubjectsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [subjects, setSubjects] = useState<SubjectRow[]>([])

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = (await apiFetch("/student/subjects")) as { data?: SubjectRow[] }
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
      const imageUrl = rawUrl && rawUrl.startsWith("/storage") ? `${fileBaseUrl}${rawUrl}` : rawUrl
      return {
        ...subject,
        imageUrl,
      }
    })
  }, [subjects, fileBaseUrl])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {subjectCards.length === 0 ? (
              <div className="card">لا توجد مواد مرتبطة بفصل الطالب حالياً.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjectCards.map((subject) => (
                  <div
                    key={subject.id}
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
                      <h3 className="mb-1 text-sm font-semibold text-white">{subject.name}</h3>
                      <div className="space-y-1 text-[12px] font-semibold leading-[22px] text-white/90">
                        <div>المرحلة: {subject.level ?? "-"}</div>
                        <div className="flex flex-row gap-8">
                          <div>الصف: {subject.class ?? "-"}</div>
                          <div>عدد الدروس: {subject.total_lessons ?? 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
