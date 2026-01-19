"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ClassPayload = {
  id: string
  name: string
  number_of_subjects: number
}

type LevelResponse = {
  id: number
  name: string
  classes: { id: number; name: string; number_of_subjects: number }[]
}

export default function LevelsPage() {
  const [levelName, setLevelName] = useState("")
  const [classes, setClasses] = useState<ClassPayload[]>([
    { id: crypto.randomUUID(), name: "", number_of_subjects: 0 },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [levels, setLevels] = useState<LevelResponse[]>([])

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        const res = await fetch(`${base}/api/manager/levels`, { cache: "no-store" })
        const json = await res.json()
        setLevels(Array.isArray(json?.data) ? json.data : [])
      } catch (error) {
        console.error("فشل في جلب المستويات", error)
      }
    }
    void loadLevels()
  }, [])

  const addClassRow = () => {
    setClasses((rows) => [...rows, { id: crypto.randomUUID(), name: "", number_of_subjects: 0 }])
  }

  const removeClassRow = (id: string) => {
    setClasses((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows))
  }

  const updateClassRow = (id: string, key: keyof ClassPayload, value: string | number) => {
    setClasses((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      const payload = {
        name: levelName.trim(),
        classes: classes
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            number_of_subjects: Number(c.number_of_subjects) || 0,
          })),
      }

      if (!payload.name || payload.classes.length === 0) {
        setMessage({ text: "الرجاء إدخال اسم المستوى وإضافة فصل واحد على الأقل.", variant: "error" })
        setSubmitting(false)
        return
      }

      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      const res = await fetch(`${base}/api/manager/levels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        const errMsg = json?.message || "فشل حفظ المستوى"
        throw new Error(errMsg)
      }

      setMessage({ text: "تم حفظ المستوى والفصول بنجاح.", variant: "success" })
      setLevelName("")
      setClasses([{ id: crypto.randomUUID(), name: "", number_of_subjects: 0 }])
      setLevels((prev) => [json.data, ...prev])
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء الحفظ.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (levelId: number) => {
    try {
      setMessage(null)
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      const res = await fetch(`${base}/api/manager/levels/${levelId}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || "فشل حذف المستوى")
      }
      setLevels((prev) => prev.filter((lvl) => lvl.id !== levelId))
      setMessage({ text: "تم حذف المستوى.", variant: "success" })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء الحذف.", variant: "error" })
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">المستويات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          أضف مستوى جديداً والفصول التابعة له.
        </p>
      </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <Label htmlFor="levelName" className="mb-1 block text-sm font-semibold">
                  اسم المستوى
                </Label>
                <Input
                  id="levelName"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  placeholder="مثال: الصف الأول"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">الفصول التابعة للمستوى</h2>
                <Button type="button" variant="outline" size="sm" onClick={addClassRow}>
                  إضافة فصل
                </Button>
              </div>
              <div className="grid gap-3">
                {classes.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-2 md:grid-cols-[2fr,1fr,auto] items-end rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-semibold">اسم الفصل</Label>
                      <Input
                        value={row.name}
                        onChange={(e) => updateClassRow(row.id, "name", e.target.value)}
                        placeholder="مثال: الفصل أ"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-semibold">عدد المواد</Label>
                      <Input
                        type="number"
                        min={0}
                        value={row.number_of_subjects}
                        onChange={(e) =>
                          updateClassRow(row.id, "number_of_subjects", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeClassRow(row.id)}
                        disabled={classes.length === 1}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {message && (
              <div className={`text-sm ${message.variant === "error" ? "text-red-600" : "text-green-600"}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90">
                {submitting ? "جارٍ الحفظ..." : "حفظ المستوى"}
              </Button>
            </div>
          </form>

          {levels.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">المستويات الحالية</h2>
              <div className="grid gap-3">
                {levels.map((level) => (
                  <div key={level.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-semibold">{level.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {level.classes?.length ?? 0} فصول
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(level.id)}
                      >
                        حذف
                      </Button>
                    </div>
                    {level.classes?.length ? (
                      <div className="mt-2 grid gap-2 md:grid-cols-3">
                        {level.classes.map((cls) => (
                          <div key={cls.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                            <div className="font-medium">{cls.name}</div>
                            <div className="text-xs text-muted-foreground">
                              المواد: {cls.number_of_subjects}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1">لا يوجد فصول مرتبطة</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
    </div>
  )
}
