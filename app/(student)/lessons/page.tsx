"use client"

import Link from "next/link"
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
        <div className="grid gap-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/student/lessons/${lesson.id}`}
              className="card text-right transition hover:border-slate-300"
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
              {lesson.watch_url ? (
                <div className="mt-2 text-xs font-semibold text-[var(--color-sidebar-bg)]">فتح الدرس</div>
              ) : (
                <div className="mt-2 text-xs text-slate-400">لا يوجد رابط متاح</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
