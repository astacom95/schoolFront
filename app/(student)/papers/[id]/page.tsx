"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

import { apiFetch } from "@/lib/api/client"

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

export default function StudentPaperDetailsPage() {
  const params = useParams()
  const paperId = Number(params?.id)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const [paper, setPaper] = useState<PaperWorkItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPaper = async () => {
      if (!paperId) {
        setPaper(null)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const response = (await apiFetch(`/student/papers/${paperId}`)) as { data?: PaperWorkItem }
        setPaper(response?.data ?? null)
      } catch (err) {
        setPaper(null)
        setError(err instanceof Error ? err.message : "تعذر تحميل ورقة العمل.")
      } finally {
        setLoading(false)
      }
    }
    void loadPaper()
  }, [paperId])

  const previewUrl = useMemo(() => {
    const rawUrl = paper?.paper_url ?? paper?.paper_path ?? ""
    if (!rawUrl) return ""
    return rawUrl.startsWith("/storage") ? `${fileBaseUrl}${rawUrl}` : rawUrl
  }, [paper?.paper_url, paper?.paper_path, fileBaseUrl])

  const fileMeta = useMemo(() => {
    const cleanUrl = previewUrl.split("?")[0]
    const ext = cleanUrl.split(".").pop()?.toLowerCase() ?? ""
    return {
      isPdf: ext === "pdf",
      isImage: ["jpg", "jpeg", "png", "webp"].includes(ext),
    }
  }, [previewUrl])

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-4 lg:px-6 md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">ورقة العمل</h2>
          <div className="text-sm text-slate-500">{paper?.subject_name ?? "—"}</div>
        </div>
        <div className="flex items-center gap-2">
          {previewUrl ? (
            <a
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
            >
              فتح الملف
            </a>
          ) : null}
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-[var(--color-sidebar-bg)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            طباعة
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">جارٍ تحميل ورقة العمل...</div>
      ) : error ? (
        <div className="card text-red-500">{error}</div>
      ) : !paper ? (
        <div className="card">ورقة العمل غير متاحة.</div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="h-[70vh] w-full overflow-hidden rounded-xl bg-slate-50">
            {previewUrl ? (
              fileMeta.isPdf ? (
                <iframe
                  title={paper.subject_name ?? "paper"}
                  src={previewUrl}
                  className="h-full w-full"
                />
              ) : fileMeta.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={paper.subject_name ?? "paper"} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  لا يمكن عرض هذا الملف في المتصفح.
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                لا يوجد ملف.
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {paper.created_at ?? "—"}
          </div>
        </div>
      )}
    </div>
  )
}
