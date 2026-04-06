"use client"

import Link from "next/link"
import { ReactNode, useEffect, useMemo, useState } from "react"

import { DataTable, type StudentRow } from "@/components/data-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PAGE_SIZE = 10

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

type TeacherRow = StudentRow & {
  specializations?: {
    id?: number
    level_id: number
    level_name?: string | null
    class_id: number
    class_name?: string | null
    subject_id: number
    subject_name?: string | null
  }[]
}

type EditTeacherForm = {
  full_name: string
  user_name: string
  email: string
  phone_number: string
  gender: "Male" | "Female"
  date_of_birth: string
  country: string
  state: string
  city: string
  password: string
}

export default function ManagerTeachersPage() {
  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""), [])
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [levels, setLevels] = useState<LevelOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRow | null>(null)
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherRow | null>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherRow | null>(null)
  const [savePending, setSavePending] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [editPersonalImage, setEditPersonalImage] = useState<File | null>(null)
  const [specs, setSpecs] = useState<SpecRow[]>([{ id: crypto.randomUUID(), level_id: "", class_id: "", subject_id: "" }])
  const [editForm, setEditForm] = useState<EditTeacherForm>({
    full_name: "",
    user_name: "",
    email: "",
    phone_number: "",
    gender: "Male",
    date_of_birth: "",
    country: "",
    state: "",
    city: "",
    password: "",
  })

  const normalizeTeacher = (item: any, idx = 0): TeacherRow => ({
    id: item.id ?? idx,
    full_name: item.full_name ?? "",
    user_name: item.user_name ?? item.user?.user_name ?? "",
    email: item.email ?? "",
    phone_number: item.phone_number ?? "",
    gender: item.gender ?? "",
    date_of_birth: item.date_of_birth ?? "",
    created_at: item.created_at ?? "",
    country: item.country ?? "",
    state: item.state ?? "",
    city: item.city ?? "",
    certificate_path: item.certificate_path ?? "",
    personal_image_path: item.personal_image_path ?? "",
    cv_path: item.cv_path ?? "",
    specializations: Array.isArray(item.specializations)
      ? item.specializations.map((spec: any) => ({
          id: spec.id,
          level_id: Number(spec.level_id ?? 0),
          level_name: spec.level_name ?? "",
          class_id: Number(spec.class_id ?? 0),
          class_name: spec.class_name ?? "",
          subject_id: Number(spec.subject_id ?? 0),
          subject_name: spec.subject_name ?? "",
        }))
      : [],
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [teachersRes, levelsRes, subjectsRes] = await Promise.all([
          fetch(`${apiRoot}/manager/teachers/public`, { cache: "no-store" }),
          fetch(`${apiRoot}/manager/levels`, { cache: "no-store" }),
          fetch(`${apiRoot}/manager/subjects`, { cache: "no-store" }),
        ])
        const teachersJson = await teachersRes.json()
        const levelsJson = await levelsRes.json()
        const subjectsJson = await subjectsRes.json()
        const list = Array.isArray(teachersJson?.data) ? teachersJson.data : Array.isArray(teachersJson) ? teachersJson : []
        const levelList = Array.isArray(levelsJson?.data) ? levelsJson.data : []
        const subjectList: SubjectOption[] = Array.isArray(subjectsJson?.data)
          ? subjectsJson.data.map((s: any) => ({
              id: s.id,
              name: s.name,
              level_id: s.level_id,
              class_id: s.class_id,
            }))
          : []
        const normalized = list.map((item: any, idx: number) => normalizeTeacher(item, idx))
        setLevels(levelList)
        setSubjects(subjectList)
        setTeachers(normalized)
        setSelectedTeacher((prev) => prev ?? normalized[0] ?? null)
        setMessage(null)
      } catch (error) {
        console.error("فشل جلب المعلمين", error)
        setMessage({ text: "تعذر تحميل بيانات المعلمين.", variant: "error" })
        setTeachers([])
      }
    }
    void load()
  }, [apiRoot])

  useEffect(() => {
    setSelectedTeacher((prev) => {
      if (!prev) return teachers[0] ?? null
      return teachers.find((teacher) => teacher.id === prev.id) ?? teachers[0] ?? null
    })
  }, [teachers])

  const handleFormChange = <K extends keyof EditTeacherForm>(key: K, value: EditTeacherForm[K]) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSpecChange = (id: string, key: keyof SpecRow, value: number | "") => {
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
  const removeSpecRow = (id: string) => setSpecs((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows))

  const filteredClasses = (levelId: number | "") => {
    if (!levelId) return []
    return levels.find((level) => level.id === levelId)?.classes ?? []
  }

  const filteredSubjects = (levelId: number | "", classId: number | "") =>
    subjects.filter((subject) => (levelId ? subject.level_id === levelId : true) && (classId ? subject.class_id === classId : true))

  const openEditDialog = (teacher: TeacherRow) => {
    setMessage(null)
    setTeacherToEdit(teacher)
    setEditForm({
      full_name: teacher.full_name ?? "",
      user_name: teacher.user_name ?? "",
      email: teacher.email ?? "",
      phone_number: teacher.phone_number ?? "",
      gender: teacher.gender === "Female" ? "Female" : "Male",
      date_of_birth: teacher.date_of_birth ?? "",
      country: teacher.country ?? "",
      state: teacher.state ?? "",
      city: teacher.city ?? "",
      password: "",
    })
    setShowPassword(false)
    setEditPersonalImage(null)
    setSpecs(
      teacher.specializations?.length
        ? teacher.specializations.map((spec) => ({
            id: String(spec.id ?? crypto.randomUUID()),
            level_id: spec.level_id ?? "",
            class_id: spec.class_id ?? "",
            subject_id: spec.subject_id ?? "",
          }))
        : [{ id: crypto.randomUUID(), level_id: "", class_id: "", subject_id: "" }],
    )
  }

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherToEdit) return

    const validSpecs = specs.filter((spec) => spec.level_id && spec.class_id && spec.subject_id)
    if (validSpecs.length === 0) {
      setMessage({ text: "الرجاء إضافة تخصص واحد على الأقل.", variant: "error" })
      return
    }

    setSavePending(true)
    try {
      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("full_name", editForm.full_name)
      formData.append("user_name", editForm.user_name)
      formData.append("email", editForm.email)
      formData.append("phone_number", editForm.phone_number)
      formData.append("gender", editForm.gender)
      formData.append("date_of_birth", editForm.date_of_birth)
      formData.append("country", editForm.country)
      formData.append("state", editForm.state)
      formData.append("city", editForm.city)
      if (editForm.password.trim()) {
        formData.append("password", editForm.password)
      }
      if (editPersonalImage) {
        formData.append("personal_image", editPersonalImage)
      }
      validSpecs.forEach((spec, index) => {
        formData.append(`specializations[${index}][level_id]`, String(spec.level_id))
        formData.append(`specializations[${index}][class_id]`, String(spec.class_id))
        formData.append(`specializations[${index}][subject_id]`, String(spec.subject_id))
      })

      const res = await fetch(`${apiRoot}/manager/teachers/${teacherToEdit.id}`, {
        method: "POST",
        body: formData,
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "فشل تحديث المعلم")
      }

      const updatedTeacher = normalizeTeacher(json?.data ?? {}, 0)
      setTeachers((prev) => prev.map((teacher) => (teacher.id === updatedTeacher.id ? { ...teacher, ...updatedTeacher } : teacher)))
      setSelectedTeacher((prev) => (prev?.id === updatedTeacher.id ? { ...prev, ...updatedTeacher } : prev))
      setTeacherToEdit(null)
      setShowPassword(false)
      setEditPersonalImage(null)
      setMessage({ text: "تم تحديث بيانات المعلم والتخصصات بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error("فشل تحديث المعلم", error)
      setMessage({ text: error?.message || "حدث خطأ أثناء تحديث المعلم.", variant: "error" })
    } finally {
      setSavePending(false)
    }
  }

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return

    setDeletePending(true)
    try {
      const res = await fetch(`${apiRoot}/manager/teachers/${teacherToDelete.id}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "فشل حذف المعلم")
      }

      setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherToDelete.id))
      setTeacherToDelete(null)
      setMessage({ text: "تم حذف المعلم بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error("فشل حذف المعلم", error)
      setMessage({ text: error?.message || "حدث خطأ أثناء حذف المعلم.", variant: "error" })
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col px-4 lg:px-6 py-4 md:py-6 gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">المعلمين</h2>
          <span className="text-sm text-muted-foreground">عرض وإدارة المعلمين</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/manager/teachers/add"
            className="inline-flex h-10 items-center rounded-md bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
          >
            إضافة معلم
          </Link>
        </div>
      </div>
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.variant === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

          <div className="w-full">
            <DataTable
              data={teachers}
              paginate
              pageSize={PAGE_SIZE}
              maxHeight="50vh"
              selectedId={selectedTeacher?.id ?? null}
              onSelectRow={setSelectedTeacher}
              showFinanceColumns={false}
              showLevelClassColumns={false}
              title="قائمة المعلمين"
            />
          </div>
          {selectedTeacher && (
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <AvatarTile src={selectedTeacher.personal_image_path} name={selectedTeacher.full_name} baseUrl={apiBase} />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openEditDialog(selectedTeacher)}
                    className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-black hover:bg-slate-50"
                  >
                    تعديل البيانات
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage(null)
                      setTeacherToDelete(selectedTeacher)
                    }}
                    className="inline-flex h-10 items-center rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                  >
                    حذف المعلم
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <InfoTile title="الاسم الكامل" value={selectedTeacher.full_name} />
                <InfoTile title="اسم المستخدم" value={selectedTeacher.user_name || "—"} />
                <InfoTile title="البريد الإلكتروني" value={selectedTeacher.email || "—"} />
                <InfoTile title="رقم الهاتف" value={selectedTeacher.phone_number || "—"} />
                <InfoTile title="الجنس" value={selectedTeacher.gender || "—"} />
                <InfoTile title="تاريخ الميلاد" value={selectedTeacher.date_of_birth || "—"} />
                <InfoTile title="تاريخ التسجيل" value={selectedTeacher.created_at || "—"} />
                <InfoTile title="الدولة" value={selectedTeacher.country || "—"} />
                <InfoTile title="الولاية / المنطقة" value={selectedTeacher.state || "—"} />
                <InfoTile title="المدينة" value={selectedTeacher.city || "—"} />
                <InfoTile
                  title="الوثائق الرسمية"
                  value={
                    selectedTeacher.certificate_path ? (
                      <a
                        href={resolveStorageUrl(selectedTeacher.certificate_path, apiBase)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-white"
                      >
                        عرض الوثيقة
                      </a>
                    ) : (
                      "لا توجد وثائق"
                    )
                  }
                  className="md:col-span-3"
                />
                <InfoTile
                  title="السيرة الذاتية"
                  value={
                    selectedTeacher.cv_path ? (
                      <a
                        href={resolveStorageUrl(selectedTeacher.cv_path, apiBase)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-white"
                      >
                        عرض السيرة الذاتية
                      </a>
                    ) : (
                      "لا يوجد ملف"
                    )
                  }
                  className="md:col-span-3"
                />
                <InfoTile
                  title="التخصصات"
                  value={
                    selectedTeacher.specializations?.length ? (
                      <div className="flex flex-col gap-1">
                        {selectedTeacher.specializations.map((spec, index) => (
                          <span key={spec.id ?? index}>
                            {spec.level_name || "—"} / {spec.class_name || "—"} / {spec.subject_name || "—"}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "لا توجد تخصصات"
                    )
                  }
                  className="md:col-span-3"
                />
              </div>
            </div>
          )}
      <Dialog
        open={teacherToEdit !== null}
        onOpenChange={(open) => {
          if (!open && !savePending) {
            setTeacherToEdit(null)
            setShowPassword(false)
            setEditPersonalImage(null)
          }
        }}
      >
        <DialogContent dir="rtl" className="sm:max-w-4xl">
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle>تعديل بيانات المعلم</DialogTitle>
            <DialogDescription>يمكنك تعديل بيانات المعلم والتخصصات المرتبطة به.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTeacher} className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label>الاسم الكامل</Label>
                <Input value={editForm.full_name} onChange={(e) => handleFormChange("full_name", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>اسم المستخدم</Label>
                <Input value={editForm.user_name} onChange={(e) => handleFormChange("user_name", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={editForm.email} onChange={(e) => handleFormChange("email", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>رقم الهاتف</Label>
                <Input value={editForm.phone_number} onChange={(e) => handleFormChange("phone_number", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>كلمة مرور جديدة (اختياري)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={editForm.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                    placeholder="اتركها فارغة بدون تغيير"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-black hover:bg-slate-50"
                  >
                    {showPassword ? "إخفاء" : "إظهار"}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label>كلمة المرور الحالية</Label>
                <Input value="غير متاحة لأسباب أمنية" readOnly />
              </div>
              <div className="flex flex-col gap-1">
                <Label>صورة شخصية جديدة (اختياري)</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setEditPersonalImage(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>الصورة الحالية</Label>
                <div className="h-20 w-20 rounded-md overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {(teacherToEdit?.personal_image_path || selectedTeacher?.personal_image_path) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveStorageUrl(teacherToEdit?.personal_image_path || selectedTeacher?.personal_image_path, apiBase)}
                      alt={teacherToEdit?.full_name || selectedTeacher?.full_name || "teacher"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">لا توجد صورة</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label>الجنس</Label>
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={editForm.gender}
                  onChange={(e) => handleFormChange("gender", e.target.value as EditTeacherForm["gender"])}
                >
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>تاريخ الميلاد</Label>
                <Input type="date" value={editForm.date_of_birth} onChange={(e) => handleFormChange("date_of_birth", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>الدولة</Label>
                <Input value={editForm.country} onChange={(e) => handleFormChange("country", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>الولاية / المنطقة</Label>
                <Input value={editForm.state} onChange={(e) => handleFormChange("state", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>المدينة</Label>
                <Input value={editForm.city} onChange={(e) => handleFormChange("city", e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">التخصصات</h3>
                <button
                  type="button"
                  onClick={addSpecRow}
                  className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"
                >
                  إضافة تخصص
                </button>
              </div>
              <div className="grid gap-3">
                {specs.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-2 md:grid-cols-[1fr,1fr,1fr,auto] items-end rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <Label>المستوى</Label>
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={row.level_id}
                        onChange={(e) => handleSpecChange(row.id, "level_id", e.target.value ? Number(e.target.value) : "")}
                      >
                        <option value="">اختر المستوى</option>
                        {levels.map((level) => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label>الفصل</Label>
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
                      <Label>المادة</Label>
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={row.subject_id}
                        onChange={(e) => handleSpecChange(row.id, "subject_id", e.target.value ? Number(e.target.value) : "")}
                        disabled={!row.class_id}
                      >
                        <option value="">اختر المادة</option>
                        {filteredSubjects(row.level_id, row.class_id).map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeSpecRow(row.id)}
                        disabled={specs.length === 1}
                        className="inline-flex h-10 items-center rounded-md px-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="sm:justify-start">
              <button
                type="button"
                onClick={() => setTeacherToEdit(null)}
                disabled={savePending}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={savePending}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {savePending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={teacherToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletePending) setTeacherToDelete(null)
        }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader className="text-right sm:text-right">
            <AlertDialogTitle>تأكيد حذف المعلم</AlertDialogTitle>
            <AlertDialogDescription>
              {teacherToDelete
                ? `سيتم حذف بيانات المعلم "${teacherToDelete.full_name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : "سيتم حذف المعلم نهائياً."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel disabled={deletePending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeacher}
              disabled={deletePending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletePending ? "جارٍ الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InfoTile({
  title,
  value,
  className,
}: {
  title: string
  value: ReactNode
  className?: string
}) {
  return (
    <div className={className ?? ""}>
      <div className="text-xs font-semibold mb-1 text-black">{title}</div>
      <div className="rounded-xl bg-[var(--color-sidebar-bg)] px-4 py-3 text-right text-sm text-white shadow-sm">
        <div className="text-[13px] leading-relaxed">{value}</div>
      </div>
    </div>
  )
}

function AvatarTile({ src, name, baseUrl }: { src?: string | null; name: string; baseUrl: string }) {
  const initial = name?.[0] ?? "?"
  const safeSrc = src && typeof src === "string" ? src : null
  const resolved = resolveStorageUrl(safeSrc, baseUrl)
  return (
    <div className="flex flex-col">
      <div className="text-xs font-semibold mb-1 text-black">صورة المعلم</div>
      <div className="h-32 w-32 rounded-xl bg-[var(--color-sidebar-bg)] text-white shadow-sm overflow-hidden flex items-center justify-center">
        {safeSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolved}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-lg font-semibold">{initial}</span>
        )}
      </div>
    </div>
  )
}

function resolveStorageUrl(path: string | null | undefined, base: string) {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
