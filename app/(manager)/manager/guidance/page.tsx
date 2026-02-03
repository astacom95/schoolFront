"use client"

import { useEffect, useState } from "react"
import { ImageIcon, VideoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type GuidanceEntry = {
  id: number
  guidance: string
  image_path?: string | null
  video_path?: string | null
  created_at?: string | null
}

export default function ManagerGuidancePage() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

  const [guidanceEntries, setGuidanceEntries] = useState<GuidanceEntry[]>([])
  const [guidanceText, setGuidanceText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        const guidanceRes = await fetch(`${base}/api/manager/guidance`, { cache: "no-store" })
        const guidanceJson = await guidanceRes.json()
        setGuidanceEntries(Array.isArray(guidanceJson?.data) ? guidanceJson.data : [])
      } catch (error) {
        console.error("فشل في جلب البيانات", error)
      }
    }
    void load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!guidanceText.trim()) {
      setMessage({ text: "الرجاء إدخال نص الإرشاد.", variant: "error" })
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("guidance", guidanceText.trim())
      if (imageFile) formData.append("image_path", imageFile)
      if (videoFile) formData.append("video_path", videoFile)

      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      const res = await fetch(`${base}/api/manager/guidance`, {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || "فشل حفظ الإرشاد")
      }
      setGuidanceEntries((prev) => [json.data, ...prev])
      setGuidanceText("")
      setImageFile(null)
      setVideoFile(null)
      setMessage({ text: "تم حفظ الإرشاد بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء الحفظ.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (entryId: number) => {
    try {
      setMessage(null)
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      const res = await fetch(`${base}/api/manager/guidance/${entryId}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || "فشل حذف الإرشاد")
      }
      setGuidanceEntries((prev) => prev.filter((entry) => entry.id !== entryId))
      setMessage({ text: "تم حذف الإرشاد.", variant: "success" })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء الحذف.", variant: "error" })
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">الإرشاد الطلابي</h1>
        <p className="text-sm text-muted-foreground mt-1">
          أضف إرشادات وتوجيهات للطلاب مع إمكانية إرفاق صورة أو فيديو.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Label className="text-sm font-semibold" htmlFor="guidanceText">نص الإرشاد</Label>
            <textarea
              id="guidanceText"
              className="mt-1 h-32 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="اكتب الإرشاد المطلوب للطلاب"
              value={guidanceText}
              onChange={(e) => setGuidanceText(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm font-semibold">إرفاق فيديو</Label>
            <label
              htmlFor="videoUpload"
              className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-[var(--color-surface-alt)] px-4 py-6 text-center text-sm text-[var(--color-muted-text)]"
            >
              <VideoIcon className="h-6 w-6 text-[var(--color-sidebar-bg)]" />
              <span>اضغط لاختيار فيديو</span>
              {videoFile && <span className="text-xs text-[var(--color-text)]">{videoFile.name}</span>}
            </label>
            <Input
              id="videoUpload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">إرفاق صورة</Label>
            <label
              htmlFor="imageUpload"
              className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-[var(--color-surface-alt)] px-4 py-6 text-center text-sm text-[var(--color-muted-text)]"
            >
              <ImageIcon className="h-6 w-6 text-[var(--color-sidebar-bg)]" />
              <span>اضغط لاختيار صورة</span>
              {imageFile && <span className="text-xs text-[var(--color-text)]">{imageFile.name}</span>}
            </label>
            <Input
              id="imageUpload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.variant === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90">
            {submitting ? "جارٍ الحفظ..." : "حفظ الإرشاد"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">قائمة الإرشادات</h2>
          <span className="text-xs text-muted-foreground">{guidanceEntries.length} عنصر</span>
        </div>
        {guidanceEntries.length === 0 ? (
          <div className="text-sm text-muted-foreground mt-3">لا توجد إرشادات حالياً.</div>
        ) : (
          <div className="mt-3 grid gap-3">
            {guidanceEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold">{entry.guidance}</div>
                    <div className="mt-1 text-xs text-muted-foreground">إرشاد عام للمدرسة</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    حذف
                  </Button>
                </div>
                {(entry.image_path || entry.video_path) && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {entry.image_path && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                        <ImageIcon className="h-4 w-4" />
                        <a
                          className="underline"
                          href={resolveStorageUrl(entry.image_path, apiBase)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          عرض الصورة
                        </a>
                      </div>
                    )}
                    {entry.video_path && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                        <VideoIcon className="h-4 w-4" />
                        <a
                          className="underline"
                          href={resolveStorageUrl(entry.video_path, apiBase)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          مشاهدة الفيديو
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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
