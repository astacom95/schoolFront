"use client"

import { useEffect, useState } from "react"

import { apiFetch } from "@/lib/api/client"

type Lesson = {
  id: number
  title: string
  summary?: string | null
  subject_name?: string | null
  created_at?: string | null
  watch_url?: string | null
  embed_url?: string | null
  is_live?: boolean
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = (await apiFetch("/student/lessons")) as { data?: Lesson[] }
        const data = Array.isArray(res?.data) ? res.data : []
        setLessons(data)
        if (data.length) {
          setSelected((current) => current ?? data[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل الدروس.")
        setLessons([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold">مشغل الدروس</h2>
        <p className="text-sm text-slate-600">تابع البث المباشر أو شاهد تسجيل الدرس لاحقاً.</p>
      </div>

      {loading ? (
        <div className="card">جارٍ تحميل الدروس...</div>
      ) : error ? (
        <div className="card text-red-500">{error}</div>
      ) : lessons.length === 0 ? (
        <div className="card">لا توجد دروس متاحة حالياً.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="card">
            {selected?.embed_url ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200">
                <iframe
                  title={selected.title}
                  src={selected.embed_url}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-sm text-slate-600">لا يتوفر فيديو لهذا الدرس بعد.</div>
            )}
            {selected?.watch_url ? (
              <div className="mt-3 text-sm text-slate-600">
                رابط المشاهدة:{" "}
                <a className="text-blue-600 underline" href={selected.watch_url} target="_blank" rel="noreferrer">
                  فتح في يوتيوب
                </a>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelected(lesson)}
                className={`card text-right transition hover:border-slate-300 ${
                  selected?.id === lesson.id ? "border-[var(--color-sidebar-bg)]" : "border-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">{lesson.title}</h3>
                  {lesson.is_live ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      بث مباشر
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">{lesson.subject_name ?? "—"}</p>
                <p className="text-xs text-slate-500">{lesson.created_at ?? "—"}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
