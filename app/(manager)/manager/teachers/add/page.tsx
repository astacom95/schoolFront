"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type LevelOption = {
  id: number
  name: string
  classes?: { id: number; name: string; level_id?: number }[]
}

type SubjectOption = {
  id: number
  name: string
  level_id: number
  class_id: number
}

type SpecRow = {
  id: string
  level_id: number | ""
  class_id: number | ""
  subject_id: number | ""
}

export default function AddTeacherPage() {
  const router = useRouter()
  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""), [])
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [levels, setLevels] = useState<LevelOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [personalImage, setPersonalImage] = useState<File | null>(null)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [specs, setSpecs] = useState<SpecRow[]>([
    { id: crypto.randomUUID(), level_id: "", class_id: "", subject_id: "" },
  ])

  const [form, setForm] = useState({
    full_name: "",
    user_name: "",
    password: "",
    email: "",
    phone_number: "",
    gender: "Male",
    date_of_birth: "",
    country: "",
    state: "",
    city: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [levelsRes, subjectsRes] = await Promise.all([
          fetch(`${apiRoot}/manager/levels`, { cache: "no-store" }),
          fetch(`${apiRoot}/manager/subjects`, { cache: "no-store" }),
        ])
        const levelsJson = await levelsRes.json()
        const subjectsJson = await subjectsRes.json()
        const lvlData: LevelOption[] = Array.isArray(levelsJson?.data) ? levelsJson.data : []
        const subjData: SubjectOption[] = Array.isArray(subjectsJson?.data)
          ? subjectsJson.data.map((s: any) => ({
              id: s.id,
              name: s.name,
              level_id: s.level_id,
              class_id: s.class_id,
            }))
          : []
        setLevels(lvlData)
        setSubjects(subjData)
      } catch (error) {
        console.error("فشل جلب البيانات", error)
      }
    }
    void load()
  }, [apiRoot])

  const handleFormChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSpecChange = (id: string, key: keyof SpecRow, value: number | "" | string) => {
    setSpecs((rows) =>
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              [key]: value,
              ...(key === "level_id" ? { class_id: "", subject_id: "" } : {}),
              ...(key === "class_id" ? { subject_id: "" } : {}),
            }
          : row,
      ),
    )
  }

  const addSpecRow = () => setSpecs((rows) => [...rows, { id: crypto.randomUUID(), level_id: "", class_id: "", subject_id: "" }])
  const removeSpecRow = (id: string) => setSpecs((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows))

  const filteredClasses = (levelId: number | "") => {
    if (!levelId) return []
    return levels.find((l) => l.id === levelId)?.classes ?? []
  }
  const filteredSubjects = (levelId: number | "", classId: number | "") =>
    subjects.filter((s) => (levelId ? s.level_id === levelId : true) && (classId ? s.class_id === classId : true))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!form.full_name.trim() || !form.user_name.trim() || !form.password.trim() || !form.phone_number.trim()) {
      setMessage({ text: "الرجاء إدخال البيانات الأساسية للمعلم.", variant: "error" })
      return
    }
    if (!form.date_of_birth) {
      setMessage({ text: "الرجاء إدخال تاريخ الميلاد.", variant: "error" })
      return
    }
    if (!personalImage) {
      setMessage({ text: "الرجاء رفع الصورة الشخصية.", variant: "error" })
      return
    }
    const validSpecs = specs.filter((s) => s.level_id && s.class_id && s.subject_id)
    if (validSpecs.length === 0) {
      setMessage({ text: "الرجاء إضافة تخصص واحد على الأقل.", variant: "error" })
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("full_name", form.full_name.trim())
      formData.append("user_name", form.user_name.trim())
      formData.append("password", form.password)
      formData.append("phone_number", form.phone_number.trim())
      formData.append("gender", form.gender)
      formData.append("date_of_birth", form.date_of_birth)
      formData.append("country", form.country || "غير محدد")
      formData.append("state", form.state || "غير محدد")
      formData.append("city", form.city || "غير محدد")
      if (form.email) formData.append("email", form.email)
      if (certificateFile) formData.append("certificate_file", certificateFile)
      if (cvFile) formData.append("cv_file", cvFile)
      formData.append("personal_image", personalImage)

      validSpecs.forEach((spec, idx) => {
        formData.append(`specializations[${idx}][level_id]`, String(spec.level_id))
        formData.append(`specializations[${idx}][class_id]`, String(spec.class_id))
        formData.append(`specializations[${idx}][subject_id]`, String(spec.subject_id))
      })

      const res = await fetch(`${apiRoot}/manager/teachers`, {
        method: "POST",
        body: formData,
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.message || "فشل حفظ المعلم")
      }

      setMessage({ text: "تم حفظ المعلم والتخصصات بنجاح.", variant: "success" })
      setTimeout(() => router.push("/manager/teachers"), 800)
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
        <SiteHeader />
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-4 md:py-6 gap-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-semibold">إضافة معلم</h2>
              <p className="text-sm text-muted-foreground">أدخل بيانات المعلم وحدد التخصصات.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">الاسم الكامل</Label>
                <Input value={form.full_name} onChange={(e) => handleFormChange("full_name", e.target.value)} placeholder="مثال: أحمد محمد" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">اسم المستخدم</Label>
                <Input value={form.user_name} onChange={(e) => handleFormChange("user_name", e.target.value)} placeholder="username" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">كلمة المرور</Label>
                <Input type="password" value={form.password} onChange={(e) => handleFormChange("password", e.target.value)} placeholder="••••••" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">البريد الإلكتروني</Label>
                <Input value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">رقم الهاتف</Label>
                <Input value={form.phone_number} onChange={(e) => handleFormChange("phone_number", e.target.value)} placeholder="05xxxxxxxx" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">الجنس</Label>
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={form.gender}
                  onChange={(e) => handleFormChange("gender", e.target.value)}
                >
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">تاريخ الميلاد</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => handleFormChange("date_of_birth", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">الدولة</Label>
                <Input value={form.country} onChange={(e) => handleFormChange("country", e.target.value)} placeholder="الدولة" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">الولاية / المنطقة</Label>
                <Input value={form.state} onChange={(e) => handleFormChange("state", e.target.value)} placeholder="الولاية" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">المدينة</Label>
                <Input value={form.city} onChange={(e) => handleFormChange("city", e.target.value)} placeholder="المدينة" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">الصورة الشخصية (مطلوبة)</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setPersonalImage(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">الوثائق الرسمية (اختياري)</Label>
                <Input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">السيرة الذاتية (اختياري)</Label>
                <Input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">التخصصات</h3>
                <Button type="button" variant="outline" size="sm" onClick={addSpecRow}>
                  إضافة تخصص
                </Button>
              </div>
              <div className="grid gap-3">
                {specs.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-2 md:grid-cols-[1fr,1fr,1fr,auto] items-end rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-semibold">المستوى</Label>
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={row.level_id}
                        onChange={(e) => handleSpecChange(row.id, "level_id", e.target.value ? Number(e.target.value) : "")}
                      >
                        <option value="">اختر المستوى</option>
                        {levels.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-semibold">الفصل</Label>
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={row.class_id}
                        onChange={(e) => handleSpecChange(row.id, "class_id", e.target.value ? Number(e.target.value) : "")}
                        disabled={!row.level_id}
                      >
                        <option value="">اختر الفصل</option>
                        {filteredClasses(row.level_id).map((cls) => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-semibold">المادة</Label>
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={row.subject_id}
                        onChange={(e) => handleSpecChange(row.id, "subject_id", e.target.value ? Number(e.target.value) : "")}
                        disabled={!row.class_id}
                      >
                        <option value="">اختر المادة</option>
                        {filteredSubjects(row.level_id, row.class_id).map((subj) => (
                          <option key={subj.id} value={subj.id}>{subj.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecRow(row.id)}
                        disabled={specs.length === 1}
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/manager/teachers")}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90">
                {submitting ? "جارٍ الحفظ..." : "حفظ المعلم"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
