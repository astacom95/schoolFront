"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type MeResponse = {
  data?: {
    user_name?: string | null
    role?: string | null
  }
}

type ManagerItem = {
  id: number
  full_name: string
  user_name: string
  phone_number: string
  email?: string | null
  date_of_birth: string
  gender: "Male" | "Female"
  created_at?: string | null
}

export default function AddManagerPage() {
  const router = useRouter()

  const [checkedPermission, setCheckedPermission] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingManagers, setLoadingManagers] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [managers, setManagers] = useState<ManagerItem[]>([])
  const [editingManager, setEditingManager] = useState<ManagerItem | null>(null)

  const [form, setForm] = useState({
    full_name: "",
    user_name: "",
    password: "",
    phone_number: "",
    email: "",
    date_of_birth: "",
    gender: "Male",
  })
  const [editForm, setEditForm] = useState({
    full_name: "",
    user_name: "",
    password: "",
    phone_number: "",
    email: "",
    date_of_birth: "",
    gender: "Male",
  })

  useEffect(() => {
    let cancelled = false

    const checkPermission = async () => {
      try {
        const response = (await apiFetch("/auth/me")) as MeResponse
        const userName = response?.data?.user_name ?? ""
        const role = response?.data?.role ?? ""
        const allowed = role === "Manager" && userName === "system.manager"

        if (!cancelled) {
          setCanCreate(allowed)
          setCheckedPermission(true)
        }

        if (!allowed) {
          router.replace("/manager/dashboard")
        }
      } catch {
        if (!cancelled) {
          setCanCreate(false)
          setCheckedPermission(true)
        }
        router.replace("/manager/dashboard")
      }
    }

    void checkPermission()

    return () => {
      cancelled = true
    }
  }, [router])

  const loadManagers = async () => {
    try {
      setLoadingManagers(true)
      const response = (await apiFetch("/manager/managers")) as {
        data?: ManagerItem[]
      }
      setManagers(Array.isArray(response?.data) ? response.data : [])
    } catch {
      setManagers([])
    } finally {
      setLoadingManagers(false)
    }
  }

  useEffect(() => {
    if (!canCreate) return
    void loadManagers()
  }, [canCreate])

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)

    if (
      !form.full_name.trim() ||
      !form.user_name.trim() ||
      !form.password.trim() ||
      !form.phone_number.trim() ||
      !form.date_of_birth
    ) {
      setMessage({ text: "الرجاء إدخال جميع الحقول المطلوبة.", variant: "error" })
      return
    }

    try {
      setSubmitting(true)
      await apiFetch("/manager/managers", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          user_name: form.user_name.trim(),
          password: form.password,
          phone_number: form.phone_number.trim(),
          email: form.email.trim() || null,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
        }),
      })

      setMessage({ text: "تم إنشاء المدير بنجاح.", variant: "success" })
      setForm({
        full_name: "",
        user_name: "",
        password: "",
        phone_number: "",
        email: "",
        date_of_birth: "",
        gender: "Male",
      })
      await loadManagers()
    } catch (error: any) {
      setMessage({ text: error?.message || "حدث خطأ أثناء إنشاء المدير.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const startEditManager = (manager: ManagerItem) => {
    setEditingManager(manager)
    setEditForm({
      full_name: manager.full_name ?? "",
      user_name: manager.user_name ?? "",
      password: "",
      phone_number: manager.phone_number ?? "",
      email: manager.email ?? "",
      date_of_birth: manager.date_of_birth ?? "",
      gender: manager.gender === "Female" ? "Female" : "Male",
    })
  }

  const handleUpdateManager = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingManager) return
    setMessage(null)

    if (
      !editForm.full_name.trim() ||
      !editForm.user_name.trim() ||
      !editForm.phone_number.trim() ||
      !editForm.date_of_birth
    ) {
      setMessage({ text: "الرجاء إدخال جميع الحقول المطلوبة في التعديل.", variant: "error" })
      return
    }

    try {
      setUpdatingId(editingManager.id)
      await apiFetch(`/manager/managers/${editingManager.id}`, {
        method: "PUT",
        body: JSON.stringify({
          full_name: editForm.full_name.trim(),
          user_name: editForm.user_name.trim(),
          password: editForm.password || null,
          phone_number: editForm.phone_number.trim(),
          email: editForm.email.trim() || null,
          date_of_birth: editForm.date_of_birth,
          gender: editForm.gender,
        }),
      })
      setEditingManager(null)
      setMessage({ text: "تم تحديث بيانات المدير بنجاح.", variant: "success" })
      await loadManagers()
    } catch (error: any) {
      setMessage({ text: error?.message || "حدث خطأ أثناء تحديث المدير.", variant: "error" })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteManager = async (manager: ManagerItem) => {
    const confirmed = window.confirm(`هل أنت متأكد من حذف المدير ${manager.full_name}؟`)
    if (!confirmed) return

    try {
      setDeletingId(manager.id)
      setMessage(null)
      await apiFetch(`/manager/managers/${manager.id}`, {
        method: "DELETE",
      })
      setMessage({ text: "تم حذف المدير بنجاح.", variant: "success" })
      await loadManagers()
    } catch (error: any) {
      setMessage({ text: error?.message || "حدث خطأ أثناء حذف المدير.", variant: "error" })
    } finally {
      setDeletingId(null)
    }
  }

  if (!checkedPermission) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
        جارٍ التحقق من الصلاحيات...
      </div>
    )
  }

  if (!canCreate) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col px-4 lg:px-6 py-4 md:py-6 gap-6">
      <div>
        <h2 className="text-xl font-semibold">إنشاء مدير جديد</h2>
        <p className="text-sm text-muted-foreground">هذه الصفحة متاحة فقط للمستخدم system.manager.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">الاسم الكامل</Label>
            <Input value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} placeholder="الاسم الكامل" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">اسم المستخدم</Label>
            <Input value={form.user_name} onChange={(e) => handleChange("user_name", e.target.value)} placeholder="manager.username" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">كلمة المرور</Label>
            <Input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="••••••" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">رقم الهاتف</Label>
            <Input value={form.phone_number} onChange={(e) => handleChange("phone_number", e.target.value)} placeholder="05xxxxxxxx" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">البريد الإلكتروني (اختياري)</Label>
            <Input value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">تاريخ الميلاد</Label>
            <Input type="date" value={form.date_of_birth} onChange={(e) => handleChange("date_of_birth", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">الجنس</Label>
            <select
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="Male">ذكر</option>
              <option value="Female">أنثى</option>
            </select>
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.variant === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90">
            {submitting ? "جارٍ الإنشاء..." : "إنشاء المدير"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-semibold">المديرون الحاليون</h3>
          <p className="text-sm text-muted-foreground">يمكنك تعديل أو حذف أي مدير من القائمة.</p>
        </div>

        {loadingManagers ? (
          <div className="text-sm text-slate-500">جارٍ تحميل بيانات المديرين...</div>
        ) : managers.length === 0 ? (
          <div className="text-sm text-slate-500">لا يوجد مديرون حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EAF6FC] text-black">
                  <th className="px-3 py-2 text-right font-semibold">الاسم</th>
                  <th className="px-3 py-2 text-right font-semibold">اسم المستخدم</th>
                  <th className="px-3 py-2 text-right font-semibold">الهاتف</th>
                  <th className="px-3 py-2 text-right font-semibold">البريد</th>
                  <th className="px-3 py-2 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager.id} className="border-b border-slate-200">
                    <td className="px-3 py-2">{manager.full_name}</td>
                    <td className="px-3 py-2">{manager.user_name}</td>
                    <td className="px-3 py-2">{manager.phone_number}</td>
                    <td className="px-3 py-2">{manager.email || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                          onClick={() => startEditManager(manager)}
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => void handleDeleteManager(manager)}
                          disabled={deletingId === manager.id}
                        >
                          {deletingId === manager.id ? "جارٍ الحذف..." : "حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingManager ? (
        <form onSubmit={handleUpdateManager} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold">تعديل بيانات المدير</h3>
            <p className="text-sm text-muted-foreground">تحديث بيانات: {editingManager.full_name}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">الاسم الكامل</Label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">اسم المستخدم</Label>
              <Input value={editForm.user_name} onChange={(e) => setEditForm((prev) => ({ ...prev, user_name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">كلمة مرور جديدة (اختياري)</Label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="اتركها فارغة بدون تغيير"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">رقم الهاتف</Label>
              <Input value={editForm.phone_number} onChange={(e) => setEditForm((prev) => ({ ...prev, phone_number: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">البريد الإلكتروني</Label>
              <Input value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">تاريخ الميلاد</Label>
              <Input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm((prev) => ({ ...prev, date_of_birth: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold">الجنس</Label>
              <select
                className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                value={editForm.gender}
                onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value as "Male" | "Female" }))}
              >
                <option value="Male">ذكر</option>
                <option value="Female">أنثى</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditingManager(null)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={updatingId === editingManager.id} className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90">
              {updatingId === editingManager.id ? "جارٍ الحفظ..." : "حفظ التعديل"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
