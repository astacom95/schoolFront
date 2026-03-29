"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import FlvPlayer from "@/components/flv-player"
import { apiFetch } from "@/lib/api/client"

type LessonDetails = {
  id: number
  title: string
  summary?: string | null
  subject_name?: string | null
  created_at?: string | null
  watch_url?: string | null
  embed_url?: string | null
  video_url?: string | null
  playback_url?: string | null
  is_live?: boolean
  media_type?: string | null
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
  const [playbackError, setPlaybackError] = useState<string | null>(null)

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
      } catch (err) {
        console.error("تعذر تسجيل الحضور", err)
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
        if (display && display.startsWith("/storage")) {
          return `${fileBaseUrl}${display}`
        }
        if (display) return display
        if (lesson.quiz_url && lesson.quiz_url.startsWith("/storage")) {
          return `${fileBaseUrl}${lesson.quiz_url}`
        }
        return lesson.quiz_url ?? null
      })()
    : null
  const hasQuiz = !!quizHref
  const playbackUrl = lesson?.playback_url ?? lesson?.video_url ?? lesson?.watch_url ?? null
  const useFlvPlayer = Boolean(
    playbackUrl && (lesson?.is_live || lesson?.media_type === "live" || playbackUrl.toLowerCase().endsWith(".flv")),
  )

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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_320px]">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
              {lesson.embed_url ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <iframe
                    title={lesson.title}
                    src={lesson.embed_url}
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : useFlvPlayer && playbackUrl ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <FlvPlayer
                    url={playbackUrl}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : playbackUrl ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <video
                    className="absolute inset-0 h-full w-full"
                    controls
                    src={playbackUrl}
                    onError={() => setPlaybackError("تعذر تشغيل الفيديو المسجل. تحقق من رابط التخزين أو صلاحيات الوصول.")}
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-slate-500">
                  لا يتوفر فيديو لهذا الدرس بعد.
                </div>
              )}
              {playbackError ? (
                <div className="border-t border-slate-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                  {playbackError}
                </div>
              ) : null}
              {lesson.is_live ? (
                <div className="absolute left-8 top-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-white shadow-lg">
                    <span className="h-5 w-5 rounded-full bg-white" />
                    <span className="text-3xl font-semibold tracking-wide">LIVE</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700">اسم الدرس</div>
                <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                  {lesson.title}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700">المادة</div>
                <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                  {lesson.subject_name ?? "—"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700">التاريخ</div>
                <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                  {lesson.created_at ?? "—"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700">تدريبات</div>
                <a
                  className={`flex h-52 flex-col items-center justify-center gap-4 rounded-lg border border-transparent bg-emerald-100 text-center text-sm font-semibold text-slate-900 shadow-sm transition ${
                    hasQuiz ? "hover:-translate-y-0.5 hover:shadow-md" : "cursor-not-allowed opacity-70"
                  }`}
                  href={quizHref ?? "#"}
                  target={hasQuiz ? "_blank" : undefined}
                  rel={hasQuiz ? "noreferrer" : undefined}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-500">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 64 64"
                      className="h-14 w-14 text-white"
                      fill="currentColor"
                    >
                      <path d="M40 6H18c-2.2 0-4 1.8-4 4v44c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V20L40 6zm0 4.5L49.5 20H40v-9.5zM22 28h20v6H22v-6zm0 12h20v6H22v-6z" />
                    </svg>
                  </div>
                  {hasQuiz ? "اضغط لفتح التدريب" : "لا يوجد تدريب متاح"}
                </a>
              </div>

              {attendanceStatus ? (
                <div className="rounded-lg bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
                  {attendanceStatus}
                  {typeof attendanceCount === "number" ? ` (عدد الحضور: ${attendanceCount})` : ""}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-center text-lg font-semibold text-slate-800">ملخص الدرس</div>
            <div className="rounded-lg bg-white px-6 py-5 text-sm leading-7 text-slate-700 shadow-sm">
              {lesson.summary ? lesson.summary : "لا يوجد ملخص لهذا الدرس."}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
