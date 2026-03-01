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
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all")

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

  const classOptions = useMemo(() => {
    const map = new Map<number, string>()

    papers.forEach((paper) => {
      if (typeof paper.class_id === "number" && paper.class_name) {
        map.set(paper.class_id, paper.class_name)
      }
    })

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
  }, [papers])

  const subjectOptions = useMemo(() => {
    const map = new Map<number, string>()

    papers.forEach((paper) => {
      const matchesClass = selectedClassId === "all" || String(paper.class_id) === selectedClassId
      if (matchesClass && typeof paper.subject_id === "number" && paper.subject_name) {
        map.set(paper.subject_id, paper.subject_name)
      }
    })

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
  }, [papers, selectedClassId])

  useEffect(() => {
    if (selectedSubjectId === "all") {
      return
    }

    const hasSubject = subjectOptions.some((option) => String(option.id) === selectedSubjectId)
    if (!hasSubject) {
      setSelectedSubjectId("all")
    }
  }, [selectedSubjectId, subjectOptions])

  const filteredPaperCards = useMemo(() => {
    return paperCards.filter((paper) => {
      const classMatches = selectedClassId === "all" || String(paper.class_id) === selectedClassId
      const subjectMatches = selectedSubjectId === "all" || String(paper.subject_id) === selectedSubjectId

      return classMatches && subjectMatches
    })
  }, [paperCards, selectedClassId, selectedSubjectId])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-lg font-semibold">أوراق العمل</h1>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">تصفية حسب الفصل</label>
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={selectedClassId}
                  onChange={(event) => setSelectedClassId(event.target.value)}
                >
                  <option value="all">كل الفصول</option>
                  {classOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">تصفية حسب المادة</label>
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={selectedSubjectId}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                >
                  <option value="all">كل المواد</option>
                  {subjectOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {filteredPaperCards.length === 0 ? (
              <div className="card mt-4">لا توجد أوراق عمل مطابقة للتصفية الحالية.</div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPaperCards.map((paper) => (
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
