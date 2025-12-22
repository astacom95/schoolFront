"use client"

import { useEffect, useMemo, useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type LevelOption = {
  id: number
  name: string
  classes?: { id: number; name: string }[]
}

type Subject = {
  id: number
  name: string
  level_id: number
  level_name?: string | null
  class_id: number
  class_name?: string | null
  total_lessons: number
  total_degree: number
  book_pdf?: string | null
  book_thumbnail?: string | null
}

export default function SubjectsPage() {
  const PDF_MAX_BYTES = 100 * 1024 * 1024 // ~100MB to match backend limit
  const IMAGE_MAX_BYTES = 5 * 1024 * 1024 // ~5MB

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

  const [levels, setLevels] = useState<LevelOption[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [name, setName] = useState("")
  const [levelId, setLevelId] = useState<number | null>(null)
  const [classId, setClassId] = useState<number | null>(null)
  const [totalLessons, setTotalLessons] = useState<number | string>("")
  const [totalDegree, setTotalDegree] = useState<number | string>("")
  const [bookPdf, setBookPdf] = useState<File | null>(null)
  const [bookThumbnail, setBookThumbnail] = useState<File | null>(null)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        const [levelsRes, subjectsRes] = await Promise.all([
          fetch(`${base}/api/manager/levels`, { cache: "no-store" }),
          fetch(`${base}/api/manager/subjects`, { cache: "no-store" }),
        ])
        const levelsJson = await levelsRes.json()
        const subjectsJson = await subjectsRes.json()
        const lvlData: LevelOption[] = Array.isArray(levelsJson?.data) ? levelsJson.data : []
        setLevels(lvlData)
        if (lvlData.length) {
          setLevelId(lvlData[0].id)
          const firstClass = lvlData[0].classes?.[0]
          setClassId(firstClass?.id ?? null)
        }
        setSubjects(Array.isArray(subjectsJson?.data) ? subjectsJson.data : [])
      } catch (error) {
        console.error("فشل في جلب البيانات", error)
      }
    }
    void load()
  }, [])

  const filteredClasses = useMemo(() => {
    if (!levelId) return []
    return levels.find((l) => l.id === levelId)?.classes ?? []
  }, [levelId, levels])

  useEffect(() => {
    // adjust class selection when level changes
    if (filteredClasses.length === 0) {
      setClassId(null)
    } else if (!filteredClasses.find((c) => c.id === classId)) {
      setClassId(filteredClasses[0].id)
    }
  }, [filteredClasses, classId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!name.trim() || !levelId || !classId || totalLessons === "" || totalDegree === "") {
      setMessage({ text: "الرجاء ملء جميع الحقول.", variant: "error" })
      return
    }
    if (bookPdf && bookPdf.size > PDF_MAX_BYTES) {
      setMessage({ text: "حجم ملف الـ PDF يتجاوز الحد المسموح (حتى 100MB).", variant: "error" })
      return
    }
    if (bookThumbnail && bookThumbnail.size > IMAGE_MAX_BYTES) {
      setMessage({ text: "حجم صورة الكتاب كبير جداً (الحد الأقصى 5MB).", variant: "error" })
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", name.trim())
      formData.append("level_id", String(levelId))
      formData.append("class_id", String(classId))
      formData.append("total_lessons", String(Number(totalLessons)))
      formData.append("total_degree", String(Number(totalDegree)))
      if (bookPdf) formData.append("book_pdf", bookPdf)
      if (bookThumbnail) formData.append("book_thumbnail", bookThumbnail)
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      const res = await fetch(`${base}/api/manager/subjects`, {
        method: "POST",
        body: formData,
      })
      let json: any = null
      try {
        json = await res.json()
      } catch (parseErr) {
        if (res.status === 413) {
          throw new Error("حجم الملف كبير، الحد الحالي حتى 100MB. تأكد أيضاً من إعدادات الخادم.")
        }
        throw new Error("فشل في قراءة استجابة الخادم.")
      }
      if (!res.ok) {
        throw new Error(json?.message || "فشل حفظ المادة")
      }
      const newSubject = json.data as Subject
      setSubjects((prev) => [newSubject, ...prev])
      setName("")
      setTotalLessons("")
      setTotalDegree("")
      setBookPdf(null)
      setBookThumbnail(null)
      setMessage({ text: "تم حفظ المادة بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء الحفظ.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar side="right" variant="inset" />
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">المواد</h1>
            <p className="text-sm text-muted-foreground mt-1">
              أضف مادة جديدة وحدد المستوى والفصل وعدد الدروس والدرجات.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold" htmlFor="subjectName">اسم المادة</Label>
                <Input
                  id="subjectName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الرياضيات"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold" htmlFor="bookPdf">كتاب المادة (PDF)</Label>
                <Input
                  id="bookPdf"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setBookPdf(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold" htmlFor="bookThumbnail">صورة الكتاب</Label>
                <Input
                  id="bookThumbnail"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setBookThumbnail(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold">المستوى</Label>
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={levelId ?? ""}
                  onChange={(e) => setLevelId(e.target.value ? Number(e.target.value) : null)}
                >
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                  ))}
                  {levels.length === 0 && <option value="">لا توجد مستويات</option>}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold">الفصل</Label>
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={classId ?? ""}
                  onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : null)}
                  disabled={filteredClasses.length === 0}
                >
                  {filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                  {filteredClasses.length === 0 && <option value="">لا توجد فصول</option>}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold" htmlFor="totalDegree">إجمالي الدرجات</Label>
                <Input
                  id="totalDegree"
                  type="number"
                  min={0}
                  value={totalDegree}
                  onChange={(e) => setTotalDegree(e.target.value)}
                  placeholder="مثال: 100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold" htmlFor="totalLessons">إجمالي الدروس</Label>
                <Input
                  id="totalLessons"
                  type="number"
                  min={0}
                  value={totalLessons}
                  onChange={(e) => setTotalLessons(e.target.value)}
                  placeholder="مثال: 30"
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
                {submitting ? "جارٍ الحفظ..." : "حفظ المادة"}
              </Button>
            </div>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">قائمة المواد</h2>
            {subjects.length === 0 ? (
              <div className="text-sm text-muted-foreground">لا توجد مواد حالياً.</div>
            ) : (
              <div className="grid gap-3">
                {subjects.map((subj) => (
                  <div key={subj.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-semibold">{subj.name}</div>
                      <div className="text-xs text-muted-foreground">
                        المستوى: {subj.level_name || subj.level_id} - الفصل: {subj.class_name || subj.class_id}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      الدروس: {subj.total_lessons} | الدرجات: {subj.total_degree}
                    </div>
                    {(subj.book_pdf || subj.book_thumbnail) && (
                      <div className="mt-3 flex items-start gap-3 flex-wrap">
                        {subj.book_thumbnail && (
                          <div className="flex flex-col gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveStorageUrl(subj.book_thumbnail, apiBase)}
                              alt={`غلاف ${subj.name}`}
                              className="h-28 w-20 rounded-md object-cover border border-slate-200"
                            />
                          </div>
                        )}
                        {subj.book_pdf && (
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90 border-none"
                            >
                              <a href={resolveStorageUrl(subj.book_pdf, apiBase)} target="_blank" rel="noopener noreferrer">
                                مشاهدة
                              </a>
                            </Button>
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
      </SidebarInset>
    </SidebarProvider>
  )
}

function resolveStorageUrl(path: string | null | undefined, base: string) {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
