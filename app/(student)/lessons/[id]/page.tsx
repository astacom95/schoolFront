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
  watch_url?: string | null
  embed_url?: string | null
  is_live?: boolean
}

export default function StudentLessonDetailsPage() {
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
      } catch (err) {
        console.error("تعذر تسجيل الحضور", err)
        setAttendanceStatus("تعذر تسجيل الحضور.")
      }
    }

    if (lessonId && lesson) {
      void recordAttendance()
    }
  }, [lessonId, lesson])

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-4 lg:px-6 md:py-6">
      <div className="card">
        <h2 className="text-xl font-semibold">تفاصيل الدرس</h2>
        <p className="text-sm text-slate-600">شاهد الفيديو وراجع ملخص الدرس.</p>
      </div>

      {loading ? (
        <div className="card">جارٍ تحميل الدرس...</div>
      ) : error ? (
        <div className="card text-red-500">{error}</div>
      ) : !lesson ? (
        <div className="card">الدرس غير متاح.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="card">
            {lesson.embed_url ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200">
                <iframe
                  title={lesson.title}
                  src={lesson.embed_url}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-sm text-slate-600">لا يتوفر فيديو لهذا الدرس بعد.</div>
            )}
            {lesson.watch_url ? (
              <div className="mt-3 text-sm text-slate-600">
                رابط المشاهدة:{" "}
                <a className="text-blue-600 underline" href={lesson.watch_url} target="_blank" rel="noreferrer">
                  فتح في يوتيوب
                </a>
              </div>
            ) : null}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold">{lesson.title}</h3>
            <div className="mt-2 text-sm text-slate-600">المادة: {lesson.subject_name ?? "—"}</div>
            <div className="text-sm text-slate-600">التاريخ: {lesson.created_at ?? "—"}</div>
            {attendanceStatus ? (
              <div className="mt-2 text-xs text-slate-500">
                {attendanceStatus}
                {typeof attendanceCount === "number" ? ` (عدد الحضور: ${attendanceCount})` : ""}
              </div>
            ) : null}
            {lesson.is_live ? (
              <div className="mt-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                بث مباشر
              </div>
            ) : null}
            {lesson.summary ? (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{lesson.summary}</p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">لا يوجد ملخص لهذا الدرس.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
