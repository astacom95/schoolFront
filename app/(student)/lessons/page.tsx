"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { apiFetch } from "@/lib/api/client"

type Lesson = {
  id: number
  title: string
  summary?: string | null
  subject_name?: string | null
  created_at?: string | null
  watch_url?: string | null
  embed_url?: string | null
  playback_url?: string | null
  video_url?: string | null
  is_live?: boolean
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null)

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

  const groupedLessons = useMemo(() => {
    const groups = new Map<string, Lesson[]>()
    lessons.forEach((lesson) => {
      const subject = lesson.subject_name ?? "بدون مادة"
      if (!groups.has(subject)) {
        groups.set(subject, [])
      }
      groups.get(subject)!.push(lesson)
    })
    return Array.from(groups.entries()).map(([subject, items]) => ({
      subject,
      items: items.sort((a, b) => {
        const aDate = a.created_at ?? ""
        const bDate = b.created_at ?? ""
        return bDate.localeCompare(aDate)
      }),
    }))
  }, [lessons])

  const subjectBadge = (subject: string) => {
    const trimmed = subject.trim()
    const initial = trimmed ? trimmed[0] : "?"
    return initial.toUpperCase()
  }

  useEffect(() => {
    if (groupedLessons.length > 0 && !expandedSubject) {
      setExpandedSubject(groupedLessons[0].subject)
    }
  }, [groupedLessons, expandedSubject])

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">مشغل الدروس</h2>
            <p className="text-sm text-slate-600">
              نظّم الدروس حسب المادة ثم افتح الدرس لمتابعة الشرح أو مشاهدة التسجيل.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs text-slate-500">
            {lessons.length} درس متاح
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">جارٍ تحميل الدروس...</div>
      ) : error ? (
        <div className="card text-red-500">{error}</div>
      ) : lessons.length === 0 ? (
        <div className="card">لا توجد دروس متاحة حالياً.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedLessons.map((group) => {
            const isOpen = expandedSubject === group.subject
            return (
              <div key={group.subject} className="card">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 text-right"
                  onClick={() => setExpandedSubject(group.subject)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-sm font-semibold text-slate-700">
                      {subjectBadge(group.subject)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold">{group.subject}</span>
                      <span className="text-xs text-slate-500">
                        {group.items.length} درس
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-600">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen ? (
                  <div className="mt-4 grid gap-3">
                    {group.items.map((lesson) => {
                      const isExpanded = expandedLessonId === lesson.id
                      return (
                        <div
                          key={lesson.id}
                          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/student/lessons/${lesson.id}`}
                                className="text-base font-semibold text-[var(--color-text)] transition hover:text-[var(--color-sidebar-bg)]"
                              >
                                {lesson.title}
                              </Link>
                              {lesson.is_live ? (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                  بث مباشر
                                </span>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              className="text-xs font-semibold text-[var(--color-sidebar-bg)]"
                              onClick={() =>
                                setExpandedLessonId((current) =>
                                  current === lesson.id ? null : lesson.id,
                                )
                              }
                            >
                              {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>{lesson.created_at ?? "—"}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>{lesson.subject_name ?? "—"}</span>
                          </div>

                          {isExpanded ? (
                            <div className="mt-4 rounded-xl border border-slate-100 bg-[var(--color-surface-alt)] p-4">
                              <p className="text-sm text-slate-600">
                                {lesson.summary ?? "لا يوجد ملخص لهذا الدرس."}
                              </p>
                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/student/lessons/${lesson.id}`}
                                  className="inline-flex items-center justify-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                                >
                                  فتح الدرس
                                </Link>
                                {lesson.is_live ? (
                                  <span className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                                    البث متاح داخل صفحة الدرس
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
