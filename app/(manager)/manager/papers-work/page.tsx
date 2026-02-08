"use client"

import { useEffect, useMemo, useState } from "react"

type PaperWorkItem = {
  id: number
  paper_path: string
  paper_url?: string | null
  subject_id: number
  subject_name?: string | null
  level_id: number
  level_name?: string | null
  class_id: number
  class_name?: string | null
  created_at?: string | null
}

export default function ManagerPapersWorkPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [papers, setPapers] = useState<PaperWorkItem[]>([])

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/manager/papers-work`)
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : []
        setPapers(list)
      } catch {
        setPapers([])
      }
    }
    void loadPapers()
  }, [apiBaseUrl])

  const paperCards = useMemo(() => {
    return papers.map((paper) => {
      const rawUrl = paper.paper_url ?? paper.paper_path ?? ""
      const fullUrl = rawUrl && rawUrl.startsWith("/storage") ? `${fileBaseUrl}${rawUrl}` : rawUrl
      const cleanUrl = fullUrl.split("?")[0]
      const ext = cleanUrl.split(".").pop()?.toLowerCase() ?? ""
      const isPdf = ext === "pdf"
      const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext)
      return {
        ...paper,
        previewUrl: fullUrl,
        isPdf,
        isImage,
      }
    })
  }, [papers, fileBaseUrl])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-lg font-semibold">أوراق العمل</h1>
            {paperCards.length === 0 ? (
              <div className="card mt-4">لا توجد أوراق عمل متاحة حالياً.</div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paperCards.map((paper) => (
                  <div
                    key={paper.id}
                    className="group rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    <div className="relative h-56 w-full overflow-hidden rounded-lg bg-slate-50">
                      {paper.previewUrl ? (
                        paper.isPdf ? (
                          <iframe
                            title={paper.subject_name ?? "paper"}
                            src={`${paper.previewUrl}#page=1&view=FitH`}
                            className="h-full w-full"
                          />
                        ) : paper.isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={paper.previewUrl}
                            alt={paper.subject_name ?? "paper"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-500">
                            ملف غير مدعوم للمعاينة
                          </div>
                        )
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          لا يوجد ملف
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {paper.subject_name ?? "ورقة عمل"}
                      </div>
                      <div className="text-xs text-slate-500">{paper.created_at ?? "—"}</div>
                      {paper.previewUrl ? (
                        <a
                          href={paper.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#E9F0FF] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-[#DDE7FF]"
                        >
                          فتح
                        </a>
                      ) : null}
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
