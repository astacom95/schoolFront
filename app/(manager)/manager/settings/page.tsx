"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DEFAULT_SIDEBAR_COLOR = "#5783af"

type SchoolSetting = {
  id: number
  school_name?: string | null
  slogan?: string | null
  description?: string | null
  school_logo?: string | null
  school_logo_url?: string | null
  background_image?: string | null
  background_image_url?: string | null
  school_color?: string | null
}

export default function ManagerSettingsPage() {
  const apiRoot = useMemo(() => {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "")
    return base.endsWith("/api") ? base : `${base}/api`
  }, [])

  const [setting, setSetting] = useState<SchoolSetting | null>(null)
  const [schoolName, setSchoolName] = useState("")
  const [slogan, setSlogan] = useState("")
  const [description, setDescription] = useState("")
  const [schoolColor, setSchoolColor] = useState(DEFAULT_SIDEBAR_COLOR)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSettings = async () => {
      try {
        const res = await fetch(`${apiRoot}/manager/settings`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          throw new Error("فشل تحميل الإعدادات.")
        }

        const json = await res.json()
        const currentSetting = (json?.data ?? null) as SchoolSetting | null

        if (cancelled) {
          return
        }

        setSetting(currentSetting)
        setSchoolName(currentSetting?.school_name ?? "")
        setSlogan(currentSetting?.slogan ?? "")
        setDescription(currentSetting?.description ?? "")
        setSchoolColor(currentSetting?.school_color ?? DEFAULT_SIDEBAR_COLOR)
        setLogoPreview(currentSetting?.school_logo_url ?? null)
        setBackgroundImagePreview(currentSetting?.background_image_url ?? null)
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setMessage({ text: "تعذر تحميل الإعدادات الحالية.", variant: "error" })
          setSchoolColor(DEFAULT_SIDEBAR_COLOR)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSettings()

    return () => {
      cancelled = true
    }
  }, [apiRoot])

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview)
      }

      if (backgroundImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(backgroundImagePreview)
      }
    }
  }, [backgroundImagePreview, logoPreview])

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setLogoFile(file)

    setLogoPreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current)
      }

      if (!file) {
        return setting?.school_logo_url ?? null
      }

      return URL.createObjectURL(file)
    })
  }

  const handleBackgroundImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setBackgroundImageFile(file)

    setBackgroundImagePreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current)
      }

      if (!file) {
        return setting?.background_image_url ?? null
      }

      return URL.createObjectURL(file)
    })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append("school_name", schoolName)
      formData.append("slogan", slogan)
      formData.append("description", description)
      formData.append("school_color", schoolColor || "")

      if (logoFile) {
        formData.append("school_logo", logoFile)
      }

      if (backgroundImageFile) {
        formData.append("background_image", backgroundImageFile)
      }

      const res = await fetch(`${apiRoot}/manager/settings`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || "فشل حفظ الإعدادات.")
      }

      const saved = (json?.data ?? null) as SchoolSetting | null
      setSetting(saved)
      setSchoolName(saved?.school_name ?? "")
      setSlogan(saved?.slogan ?? "")
      setDescription(saved?.description ?? "")
      setSchoolColor(saved?.school_color ?? DEFAULT_SIDEBAR_COLOR)
      setLogoFile(null)
      setBackgroundImageFile(null)
      setLogoPreview(saved?.school_logo_url ?? null)
      setBackgroundImagePreview(saved?.background_image_url ?? null)
      document.documentElement.style.setProperty("--color-sidebar-bg", saved?.school_color ?? DEFAULT_SIDEBAR_COLOR)
      setMessage({ text: "تم حفظ الإعدادات بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error?.message || "حدث خطأ أثناء حفظ الإعدادات.", variant: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عدل اسم المدرسة، الشعار، الشعار النصي، ولون الواجهة الرئيسي.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="school-name" className="text-sm font-semibold">اسم المدرسة</Label>
            <Input
              id="school-name"
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
              placeholder="اسم المدرسة"
              disabled={loading || saving}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="school-slogan" className="text-sm font-semibold">الشعار النصي</Label>
            <Input
              id="school-slogan"
              value={slogan}
              onChange={(event) => setSlogan(event.target.value)}
              placeholder="مثال: نرتقي بالعلم والقيم"
              disabled={loading || saving}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="school-description" className="text-sm font-semibold">الوصف</Label>
          <textarea
            id="school-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="وصف المدرسة أو نص تعريفي يظهر في الواجهة"
            disabled={loading || saving}
            className="min-h-28 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-[var(--color-sidebar-bg)]/20"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="school-color" className="text-sm font-semibold">لون الشريط الجانبي</Label>
            <div className="flex items-center gap-3">
              <Input
                id="school-color"
                type="color"
                value={schoolColor}
                onChange={(event) => setSchoolColor(event.target.value)}
                className="h-11 w-20 cursor-pointer p-1"
                disabled={loading || saving}
              />
              <div className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
                {schoolColor}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex flex-col gap-1">
            <Label htmlFor="school-logo" className="text-sm font-semibold">شعار المدرسة</Label>
            <Input
              id="school-logo"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg"
              onChange={handleLogoChange}
              disabled={loading || saving}
            />
            <p className="text-xs text-slate-500">يدعم JPG و PNG و WEBP و SVG حتى 10MB.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">المعاينة الحالية</Label>
            <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="شعار المدرسة" className="h-full w-full object-contain p-3" />
              ) : (
                <span className="text-sm text-slate-400">لا يوجد شعار محفوظ</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex flex-col gap-1">
            <Label htmlFor="background-image" className="text-sm font-semibold">صورة الخلفية</Label>
            <Input
              id="background-image"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg"
              onChange={handleBackgroundImageChange}
              disabled={loading || saving}
            />
            <p className="text-xs text-slate-500">يدعم JPG و PNG و WEBP و SVG حتى 10MB.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">معاينة الخلفية</Label>
            <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {backgroundImagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={backgroundImagePreview} alt="صورة الخلفية" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-slate-400">لا توجد صورة خلفية محفوظة</span>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.variant === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || saving} className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90">
            {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </form>
    </div>
  )
}
