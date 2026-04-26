"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LevelOption = {
  id: number
  name: string
  classes?: { id: number; name: string; level_id?: number }[]
}

export default function StudentSelfRegistrationPage() {
  const apiRoot = useMemo(() => {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "")
    return base.endsWith("/api") ? base : `${base}/api`
  }, [])

  const [levels, setLevels] = useState<LevelOption[]>([])
  const [levelId, setLevelId] = useState<number | null>(null)
  const [classId, setClassId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [personalImage, setPersonalImage] = useState<File | null>(null)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    full_name: "",
    user_name: "",
    password: "",
    email: "",
    phone_number: "",
    student_phone_number: "",
    guardian_name: "",
    guardian_phone_number: "",
    guardian_relationship: "Parent",
    guardian_email: "",
    guardian_address: "",
    country: "",
    state: "",
    city: "",
    date_of_birth: "",
    gender: "Male",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const levelsRes = await fetch(`${apiRoot}/manager/levels`, { cache: "no-store" })
        const levelsJson = await levelsRes.json()
        const levelData: LevelOption[] = Array.isArray(levelsJson?.data) ? levelsJson.data : []
        setLevels(levelData)

        if (levelData.length) {
          setLevelId(levelData[0].id)
          setClassId(levelData[0].classes?.[0]?.id ?? null)
        }
      } catch (error) {
        console.error("فشل جلب المستويات", error)
        setMessage({ text: "تعذر تحميل بيانات المستويات والفصول.", variant: "error" })
      }
    }

    void load()
  }, [apiRoot])

  const filteredClasses = useMemo(() => {
    if (!levelId) return []
    return levels.find((level) => level.id === levelId)?.classes ?? []
  }, [levelId, levels])

  useEffect(() => {
    if (filteredClasses.length === 0) {
      setClassId(null)
    } else if (!filteredClasses.find((c) => c.id === classId)) {
      setClassId(filteredClasses[0].id)
    }
  }, [filteredClasses, classId])

  const handleFormChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!levelId || !classId) {
      setMessage({ text: "الرجاء اختيار المستوى والفصل.", variant: "error" })
      return
    }

    if (!form.full_name.trim() || !form.user_name.trim() || !form.password.trim() || !form.phone_number.trim() || !form.guardian_name.trim() || !form.guardian_phone_number.trim()) {
      setMessage({ text: "الرجاء إدخال بيانات الطالب وولي الأمر المطلوبة.", variant: "error" })
      return
    }

    if (!personalImage) {
      setMessage({ text: "الرجاء رفع الصورة الشخصية.", variant: "error" })
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("full_name", form.full_name.trim())
      formData.append("user_name", form.user_name.trim())
      formData.append("password", form.password)
      formData.append("phone_number", form.phone_number.trim())
      formData.append("guardian_name", form.guardian_name.trim())
      formData.append("guardian_phone_number", form.guardian_phone_number.trim())
      formData.append("gender", form.gender)
      formData.append("level_id", String(levelId))
      formData.append("class_id", String(classId))

      if (form.email) formData.append("email", form.email)
      if (form.student_phone_number) formData.append("student_phone_number", form.student_phone_number)
      if (form.guardian_relationship) formData.append("guardian_relationship", form.guardian_relationship)
      if (form.guardian_email) formData.append("guardian_email", form.guardian_email)
      if (form.guardian_address) formData.append("guardian_address", form.guardian_address)
      if (form.country) formData.append("country", form.country)
      if (form.state) formData.append("state", form.state)
      if (form.city) formData.append("city", form.city)
      if (form.date_of_birth) formData.append("date_of_birth", form.date_of_birth)
      if (certificateFile) formData.append("certificate_file", certificateFile)
      if (personalImage) formData.append("personal_image", personalImage)

      const res = await fetch(`${apiRoot}/auth/register/student`, {
        method: "POST",
        body: formData,
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "فشل إنشاء الحساب")
      }

      setMessage({ text: "تم التسجيل بنجاح. حسابك غير مفعل حالياً وسيتم تفعيله من الإدارة.", variant: "success" })
      setForm({
        full_name: "",
        user_name: "",
        password: "",
        email: "",
        phone_number: "",
        student_phone_number: "",
        guardian_name: "",
        guardian_phone_number: "",
        guardian_relationship: "Parent",
        guardian_email: "",
        guardian_address: "",
        country: "",
        state: "",
        city: "",
        date_of_birth: "",
        gender: "Male",
      })
      setPersonalImage(null)
      setCertificateFile(null)
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء التسجيل.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">تسجيل طالب جديد</h2>
          <p className="text-sm text-muted-foreground">املأ بياناتك وسيتم تفعيل الحساب من الإدارة بعد المراجعة.</p>
        </div>
        <Link href="/" className="text-sm font-medium text-[var(--color-sidebar-bg)] hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
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
            <Label className="text-xs font-semibold">هاتف الطالب</Label>
            <Input value={form.student_phone_number} onChange={(e) => handleFormChange("student_phone_number", e.target.value)} placeholder="05xxxxxxxx" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">هاتف أساسي</Label>
            <Input value={form.phone_number} onChange={(e) => handleFormChange("phone_number", e.target.value)} placeholder="05xxxxxxxx" />
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
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">المستوى</Label>
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
            <Label className="text-xs font-semibold">الفصل</Label>
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
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">اسم ولي الأمر</Label>
            <Input value={form.guardian_name} onChange={(e) => handleFormChange("guardian_name", e.target.value)} placeholder="اسم ولي الأمر" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">صلة القرابة</Label>
            <Input value={form.guardian_relationship} onChange={(e) => handleFormChange("guardian_relationship", e.target.value)} placeholder="أب / أم / ولي أمر" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">هاتف ولي الأمر</Label>
            <Input value={form.guardian_phone_number} onChange={(e) => handleFormChange("guardian_phone_number", e.target.value)} placeholder="05xxxxxxxx" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">بريد ولي الأمر</Label>
            <Input value={form.guardian_email} onChange={(e) => handleFormChange("guardian_email", e.target.value)} placeholder="guardian@example.com" />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label className="text-xs font-semibold">عنوان ولي الأمر</Label>
            <Input value={form.guardian_address} onChange={(e) => handleFormChange("guardian_address", e.target.value)} placeholder="العنوان" />
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.variant === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button asChild type="button" variant="outline">
            <Link href="/">العودة</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90">
            {submitting ? "جارٍ التسجيل..." : "تسجيل"}
          </Button>
        </div>
      </form>
    </div>
  )
}
