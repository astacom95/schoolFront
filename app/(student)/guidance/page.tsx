"use client"

import { useEffect, useMemo, useState } from "react"

import { apiFetch } from "@/lib/api/client"

type GuidanceEntry = {
  id: number
  guidance: string
  image_path?: string | null
  video_path?: string | null
  created_at?: string | null
}

export default function StudentGuidancePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")

  const [guidanceEntries, setGuidanceEntries] = useState<GuidanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGuidance = async () => {
      try {
        const response = (await apiFetch("/student/guidance")) as { data?: GuidanceEntry[] }
        setGuidanceEntries(Array.isArray(response?.data) ? response.data : [])
        setError(null)
      } catch (err: any) {
        console.error("تعذر تحميل الإرشادات", err)
        setGuidanceEntries([])
        setError("تعذر تحميل الإرشادات حالياً.")
      } finally {
        setLoading(false)
      }
    }
    void loadGuidance()
  }, [])

  const entries = useMemo(() => {
    return guidanceEntries.map((entry) => {
      const imageRaw = entry.image_path ?? ""
      const videoRaw = entry.video_path ?? ""
      const imageUrl = imageRaw && imageRaw.startsWith("/storage") ? `${fileBaseUrl}${imageRaw}` : imageRaw
      const videoUrl = videoRaw && videoRaw.startsWith("/storage") ? `${fileBaseUrl}${videoRaw}` : videoRaw
      return { ...entry, imageUrl, videoUrl }
    })
  }, [guidanceEntries, fileBaseUrl])

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">الإرشاد الطلابي</h1>
        <p className="text-sm text-muted-foreground mt-1">رسائل وإرشادات عامة موجهة للطلاب.</p>
      </div>

      {loading ? (
        <div className="card text-sm">جارٍ تحميل الإرشادات...</div>
      ) : error ? (
        <div className="card text-sm text-red-600">{error}</div>
      ) : entries.length === 0 ? (
        <div className="card text-sm text-muted-foreground">لا توجد إرشادات حالياً.</div>
      ) : (
        <div className="grid gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-[var(--color-text)]">{entry.guidance}</div>

              {entry.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.imageUrl}
                    alt="صورة الإرشاد"
                    className="h-full max-h-[520px] w-full object-cover"
                  />
                </div>
              )}

              {entry.videoUrl && (
                <div className="mt-4">
                  <video
                    className="w-full rounded-lg border border-slate-200 bg-black"
                    controls
                    preload="metadata"
                  >
                    <source src={entry.videoUrl} />
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
