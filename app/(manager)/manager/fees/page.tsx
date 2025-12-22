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

type Fee = {
  id: number
  class_id: number
  class_name?: string | null
  total_fee: number
  minimum_fee: number
}

export default function FeesPage() {
  const apiRoot = useMemo(() => {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "")
    return base.endsWith("/api") ? base : `${base}/api`
  }, [])

  const [levels, setLevels] = useState<LevelOption[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [levelId, setLevelId] = useState<number | null>(null)
  const [classId, setClassId] = useState<number | null>(null)
  const [totalFee, setTotalFee] = useState<number | string>("")
  const [minimumFee, setMinimumFee] = useState<number | string>("")
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const readJson = async (res: Response) => {
    const contentType = res.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      const text = await res.text()
      throw new Error(`Unexpected response (status ${res.status}): ${text.slice(0, 120)}`)
    }
    return res.json()
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [levelsRes, feesRes] = await Promise.all([
          fetch(`${apiRoot}/manager/levels`, { cache: "no-store" }),
          fetch(`${apiRoot}/manager/fees`, { cache: "no-store" }),
        ])
        if (!levelsRes.ok) {
          const text = await levelsRes.text()
          throw new Error(`فشل تحميل المستويات (status ${levelsRes.status}): ${text.slice(0, 120)}`)
        }
        if (!feesRes.ok) {
          const text = await feesRes.text()
          throw new Error(`فشل تحميل الرسوم (status ${feesRes.status}): ${text.slice(0, 120)}`)
        }
        const levelsJson = await readJson(levelsRes)
        const feesJson = await readJson(feesRes)
        const lvlData: LevelOption[] = Array.isArray(levelsJson?.data)
          ? levelsJson.data
          : Array.isArray(levelsJson)
          ? levelsJson
          : []
        setLevels(lvlData)
        if (lvlData.length) {
          setLevelId(lvlData[0].id)
          const firstClass = lvlData[0].classes?.[0]
          setClassId(firstClass?.id ?? null)
        }
        setFees(Array.isArray(feesJson?.data) ? feesJson.data : [])
      } catch (error) {
        console.error("فشل في جلب البيانات", error)
      }
    }
    void load()
  }, [apiRoot])

  const filteredClasses = useMemo(() => {
    if (!levelId) return []
    return levels.find((l) => l.id === levelId)?.classes ?? []
  }, [levelId, levels])

  useEffect(() => {
    if (filteredClasses.length === 0) {
      setClassId(null)
    } else if (!filteredClasses.find((c) => c.id === classId)) {
      setClassId(filteredClasses[0].id)
    }
  }, [filteredClasses, classId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!levelId || !classId || totalFee === "" || minimumFee === "") {
      setMessage({ text: "الرجاء ملء جميع الحقول.", variant: "error" })
      return
    }
    const total = Number(totalFee)
    const min = Number(minimumFee)
    if (Number.isNaN(total) || Number.isNaN(min) || total <= 0 || min <= 0) {
      setMessage({ text: "يجب أن تكون القيم أرقاماً أكبر من الصفر.", variant: "error" })
      return
    }
    if (min > total) {
      setMessage({ text: "الحد الأدنى لا يمكن أن يتجاوز إجمالي الرسوم.", variant: "error" })
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        class_id: classId,
        total_fee: total,
        minimum_fee: min,
      }
      const res = await fetch(`${apiRoot}/manager/fees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "فشل حفظ الرسوم")
      }
      const json = await readJson(res)
      const newFee = json.data as Fee
      setFees((prev) => [newFee, ...prev])
      setTotalFee("")
      setMinimumFee("")
      setMessage({ text: "تم حفظ الرسوم بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء الحفظ.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (feeId: number) => {
    setMessage(null)
    setDeletingId(feeId)
    try {
      const res = await fetch(`${apiRoot}/manager/fees/${feeId}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || "فشل حذف الرسوم")
      }
      setFees((prev) => prev.filter((fee) => fee.id !== feeId))
      setMessage({ text: "تم حذف الرسوم.", variant: "success" })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء الحذف.", variant: "error" })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar side="right" variant="inset" />
      <SidebarInset className="bg-white text-[var(--color-text)]">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">الرسوم</h1>
            <p className="text-sm text-muted-foreground mt-1">
              أضف رسوم جديدة، حدد الحد الأدنى، واربطها بالفصل المناسب.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <Label className="text-sm font-semibold" htmlFor="totalFee">إجمالي الرسوم</Label>
                <Input
                  id="totalFee"
                  type="number"
                  min={0}
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  placeholder="مثال: 1500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold" htmlFor="minimumFee">الحد الأدنى</Label>
                <Input
                  id="minimumFee"
                  type="number"
                  min={0}
                  value={minimumFee}
                  onChange={(e) => setMinimumFee(e.target.value)}
                  placeholder="مثال: 500"
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
                {submitting ? "جارٍ الحفظ..." : "حفظ الرسوم"}
              </Button>
            </div>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">قائمة الرسوم</h2>
            {fees.length === 0 ? (
              <div className="text-sm text-muted-foreground">لا توجد رسوم حالياً.</div>
            ) : (
              <div className="grid gap-3">
                {fees.map((fee) => (
                  <div key={fee.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-semibold">
                        الفصل: {fee.class_name || fee.class_id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        الإجمالي: {fee.total_fee} | الحد الأدنى: {fee.minimum_fee}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(fee.id)}
                        disabled={deletingId === fee.id}
                      >
                        {deletingId === fee.id ? "جارٍ الحذف..." : "حذف"}
                      </Button>
                    </div>
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
