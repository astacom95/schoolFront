"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { apiFetch } from "@/lib/api/client"

type LessonDetails = {
  id: number
  title: string
  summary?: string | null
  subject_name?: string | null
  created_at?: string | null
  meet_link?: string | null
  quiz_url?: string | null
  quiz_url_display?: string | null
}

export default function StudentLessonDetailsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
  const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "")
  const params = useParams()
  const lessonId = Number(params?.id)
  const [lesson, setLesson] = useState<LessonDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceCount, setAttendanceCount] = useState<number | null>(null)
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null)

  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) {
        setLesson(null)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const response = (await apiFetch(`/student/lessons/${lessonId}`)) as { data?: LessonDetails }
        setLesson(response?.data ?? null)
      } catch (err) {
        setLesson(null)
        setError(err instanceof Error ? err.message : "تعذر تحميل الدرس.")
      } finally {
        setLoading(false)
      }
    }
    void loadLesson()
  }, [lessonId])

  useEffect(() => {
    const recordAttendance = async () => {
      if (!lessonId || !lesson) return
      try {
        const response = (await apiFetch(`/student/lessons/${lessonId}/attendance`, {
          method: "POST",
        })) as { data?: { attendance_count?: number; event_created?: boolean } }
        const count = response?.data?.attendance_count
        if (typeof count === "number") {
          setAttendanceCount(count)
        }
        setAttendanceStatus(response?.data?.event_created ? "تم تسجيل الحضور." : "تم تسجيل الحضور مسبقاً.")
      } catch {
        setAttendanceStatus("تعذر تسجيل الحضور.")
      }
    }

    if (lessonId && lesson) {
      void recordAttendance()
    }
  }, [lessonId, lesson])

  const quizHref = lesson
    ? (() => {
        const display = lesson.quiz_url_display
        if (display && display.startsWith("/storage")) return `${fileBaseUrl}${display}`
        if (display) return display
        if (lesson.quiz_url && lesson.quiz_url.startsWith("/storage")) return `${fileBaseUrl}${lesson.quiz_url}`
        return lesson.quiz_url ?? null
      })()
    : null
  const hasQuiz = !!quizHref

  return (
    <div className="flex flex-1 flex-col bg-[#F5F7FA] px-4 py-6 text-slate-900 lg:px-10" dir="rtl">
      {loading ? (
        <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
          جارٍ تحميل الدرس...
        </div>
      ) : error ? (
        <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-6 text-sm text-red-600 shadow-sm">
          {error}
        </div>
      ) : !lesson ? (
        <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
          الدرس غير متاح.
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{lesson.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{lesson.subject_name ?? "—"}</p>
            <p className="mt-3 text-sm text-slate-600">{lesson.summary ?? "لا يوجد ملخص لهذا الدرس."}</p>
            <p className="mt-2 text-xs text-slate-400">{lesson.created_at ?? "—"}</p>

            {lesson.meet_link ? (
              <a
                href={lesson.meet_link}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-semibold text-white"
              >
                انضم إلى Google Meet
              </a>
            ) : (
              <div className="mt-5 text-sm text-slate-500">لا يوجد رابط Meet لهذا الدرس حالياً.</div>
            )}
          </div>

          <div className="space-y-2 rounded-lg bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">تدريبات</div>
            <a
              className={`inline-flex rounded-lg px-4 py-2 text-sm font-semibold ${
                hasQuiz
                  ? "bg-emerald-100 text-emerald-700"
                  : "cursor-not-allowed bg-slate-100 text-slate-500"
              }`}
              href={quizHref ?? "#"}
              target={hasQuiz ? "_blank" : undefined}
              rel={hasQuiz ? "noreferrer" : undefined}
            >
              {hasQuiz ? "فتح التدريب" : "لا يوجد تدريب متاح"}
            </a>
          </div>

          {attendanceStatus ? (
            <div className="rounded-lg bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
              {attendanceStatus}
              {typeof attendanceCount === "number" ? ` (عدد الحضور: ${attendanceCount})` : ""}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
