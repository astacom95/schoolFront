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
  classes?: { id: number; name: string }[]
}

type EditStudentForm = {
  full_name: string
  user_name: string
  email: string
  phone_number: string
  gender: "Male" | "Female"
  guardian_name: string
  date_of_birth: string
  country: string
  state: string
  city: string
  password: string
}

export default function ManagerStudentsPage() {
  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""), [])
  const apiRoot = useMemo(() => (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`), [apiBase])

  const [levels, setLevels] = useState<LevelOption[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | "all">("all")
  const [studentToDelete, setStudentToDelete] = useState<StudentRow | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [studentToEdit, setStudentToEdit] = useState<StudentRow | null>(null)
  const [savePending, setSavePending] = useState(false)
  const [statusPendingId, setStatusPendingId] = useState<number | string | null>(null)
  const [studentForPayment, setStudentForPayment] = useState<StudentRow | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentPending, setPaymentPending] = useState(false)
  const [message, setMessage] = useState<{ text: string; variant: "success" | "error" } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [editForm, setEditForm] = useState<EditStudentForm>({
    full_name: "",
    user_name: "",
    email: "",
    phone_number: "",
    gender: "Male",
    guardian_name: "",
    date_of_birth: "",
    country: "",
    state: "",
    city: "",
    password: "",
  })
  const [editPersonalImage, setEditPersonalImage] = useState<File | null>(null)

  const normalizeStudent = (item: any, idx = 0): StudentRow => {
    const classIdRaw = item.class?.id ?? item.class_id ?? null
    const classId = typeof classIdRaw === "number" ? classIdRaw : Number(classIdRaw)
    const className =
      item.class?.name ??
      item.class_name ??
      (typeof item.class === "string" ? item.class : "")
    const levelName =
      item.level?.name ??
      item.level_name ??
      (typeof item.level === "string" ? item.level : "")

    return {
      id: item.id ?? item.student_id ?? idx,
      full_name: item.full_name ?? "",
      active: item.active !== false,
      user_name: item.user_name ?? item.user?.user_name ?? "",
      email: item.email ?? "",
      phone_number: item.phone_number ?? "",
      level: levelName,
      class: className,
      class_id: Number.isFinite(classId) ? classId : null,
      gender: item.gender ?? "",
      guardian_name: item.guardian_name ?? "",
      date_of_birth: item.date_of_birth ?? "",
      created_at: item.created_at ?? "",
      country: item.country ?? "",
      state: item.state ?? "",
      city: item.city ?? "",
      certificate_path: item.certificate_path ?? "",
      personal_image_path: item.personal_image_path ?? "",
      paid_amount: Number(item.paid_amount ?? 0),
      total_fee: Number(item.total_fee ?? 0),
      remaining_amount: Number(item.remaining_amount ?? 0),
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, levelsRes] = await Promise.all([
          fetch(`${apiRoot}/manager/students/public`, { cache: "no-store" }),
          fetch(`${apiRoot}/manager/levels`, { cache: "no-store" }),
        ])
        const studentsJson = await studentsRes.json()
        const levelsJson = await levelsRes.json()
        const studentList = Array.isArray(studentsJson?.data) ? studentsJson.data : Array.isArray(studentsJson) ? studentsJson : []
        const levelList = Array.isArray(levelsJson?.data) ? levelsJson.data : Array.isArray(levelsJson) ? levelsJson : []
        const normalizedStudents = studentList.map((item: any, idx: number) => normalizeStudent(item, idx))
        setMessage(null)
        setLevels(levelList)
        setStudents(normalizedStudents)
        setSelectedStudent((prev) => prev ?? normalizedStudents[0] ?? null)
      } catch (error) {
        console.error("فشل جلب بيانات الطلاب", error)
        setMessage({ text: "تعذر تحميل بيانات الطلاب.", variant: "error" })
        setLevels([])
        setStudents([])
      }
    }
    void load()
  }, [apiRoot])

  const classOptions = useMemo(() => {
    const options = levels.flatMap((level) =>
      (level.classes ?? []).map((cls) => ({
        id: cls.id,
        name: cls.name,
      })),
    )

    return options.filter((option, index, list) => list.findIndex((entry) => entry.id === option.id) === index)
  }, [levels])

  const selectedClassName = useMemo(() => {
    if (selectedClassId === "all") return "كل الفصول"
    return classOptions.find((option) => option.id === selectedClassId)?.name ?? "فصل غير معروف"
  }, [classOptions, selectedClassId])

  const filteredStudents = useMemo(() => {
    if (selectedClassId === "all") return students

    const normalizedSelectedClassName =
      classOptions.find((option) => option.id === selectedClassId)?.name.replace(/\s+/g, " ").trim().toLowerCase() ?? ""

    return students.filter((student) => {
      const normalizedStudentClassName = (student.class ?? "").replace(/\s+/g, " ").trim().toLowerCase()

      if (student.class_id != null && student.class_id === selectedClassId) return true
      if (!normalizedSelectedClassName) return false
      return normalizedStudentClassName === normalizedSelectedClassName
    })
  }, [classOptions, selectedClassId, students])

  useEffect(() => {
    setSelectedStudent((prev) => {
      if (!prev) return filteredStudents[0] ?? null
      return filteredStudents.find((student) => student.id === prev.id) ?? filteredStudents[0] ?? null
    })
  }, [filteredStudents])

  const handlePrint = () => {
    window.print()
  }

  const openEditDialog = (student: StudentRow) => {
    setMessage(null)
    setStudentToEdit(student)
    setEditForm({
      full_name: student.full_name ?? "",
      user_name: student.user_name ?? "",
      email: student.email ?? "",
      phone_number: student.phone_number ?? "",
      gender: student.gender === "Female" ? "Female" : "Male",
      guardian_name: student.guardian_name ?? "",
      date_of_birth: student.date_of_birth ?? "",
      country: student.country ?? "",
      state: student.state ?? "",
      city: student.city ?? "",
      password: "",
    })
    setEditPersonalImage(null)
    setShowPassword(false)
  }

  const handleEditFormChange = <K extends keyof EditStudentForm>(key: K, value: EditStudentForm[K]) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentToEdit) return

    setSavePending(true)
    try {
      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("full_name", editForm.full_name)
      formData.append("user_name", editForm.user_name)
      formData.append("email", editForm.email)
      formData.append("phone_number", editForm.phone_number)
      formData.append("gender", editForm.gender)
      formData.append("guardian_name", editForm.guardian_name)
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

      const res = await fetch(`${apiRoot}/manager/students/${studentToEdit.id}`, {
        method: "POST",
        body: formData,
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "فشل تحديث الطالب")
      }

      const updatedStudent = normalizeStudent(json?.data ?? {}, 0)
      setStudents((prev) =>
        prev.map((student) =>
          student.id === updatedStudent.id
            ? {
                ...student,
                ...updatedStudent,
              }
            : student,
        ),
      )
      setSelectedStudent((prev) => (prev?.id === updatedStudent.id ? { ...prev, ...updatedStudent } : prev))
      setStudentToEdit(null)
      setEditPersonalImage(null)
      setMessage({ text: "تم تحديث بيانات الطالب بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error("فشل تحديث الطالب", error)
      setMessage({ text: error?.message || "حدث خطأ أثناء تحديث الطالب.", variant: "error" })
    } finally {
      setSavePending(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return

    setDeletePending(true)
    try {
      const res = await fetch(`${apiRoot}/manager/students/${studentToDelete.id}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "فشل حذف الطالب")
      }

      setStudents((prev) => prev.filter((student) => student.id !== studentToDelete.id))
      setMessage({ text: "تم حذف الطالب بنجاح.", variant: "success" })
      setStudentToDelete(null)
    } catch (error: any) {
      console.error("فشل حذف الطالب", error)
      setMessage({ text: error?.message || "حدث خطأ أثناء حذف الطالب.", variant: "error" })
    } finally {
      setDeletePending(false)
    }
  }

  const handleToggleStudentStatus = async (student: StudentRow) => {
    setStatusPendingId(student.id)
    setMessage(null)

    try {
      const nextActive = !(student.active !== false)
      const res = await fetch(`${apiRoot}/manager/students/${student.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ active: nextActive }),
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "فشل تحديث حالة الطالب")
      }

      const updatedStudent = normalizeStudent(json?.data ?? student, 0)
      setStudents((prev) => prev.map((row) => (row.id === updatedStudent.id ? { ...row, ...updatedStudent } : row)))
      setSelectedStudent((prev) => (prev?.id === updatedStudent.id ? { ...prev, ...updatedStudent } : prev))
      setMessage({ text: nextActive ? "تم تفعيل الطالب بنجاح." : "تم تعطيل الطالب بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error("فشل تحديث حالة الطالب", error)
      setMessage({ text: error?.message || "حدث خطأ أثناء تحديث الحالة.", variant: "error" })
    } finally {
      setStatusPendingId(null)
    }
  }

  const openPaymentDialog = (student: StudentRow) => {
    setMessage(null)
    setStudentForPayment(student)
    setPaymentAmount(String(student.paid_amount ?? 0))
  }

  const handleUpdatePayment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!studentForPayment) return

    const parsedAmount = Number(paymentAmount)
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setMessage({ text: "الرجاء إدخال مبلغ صالح.", variant: "error" })
      return
    }

    setPaymentPending(true)
    setMessage(null)

    try {
      const res = await fetch(`${apiRoot}/manager/students/${studentForPayment.id}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ amount: parsedAmount }),
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "فشل تحديث مبلغ الدفع")
      }

      const updatedStudent = normalizeStudent(json?.data ?? studentForPayment, 0)
      setStudents((prev) => prev.map((row) => (row.id === updatedStudent.id ? { ...row, ...updatedStudent } : row)))
      setSelectedStudent((prev) => (prev?.id === updatedStudent.id ? { ...prev, ...updatedStudent } : prev))
      setStudentForPayment(null)
      setPaymentAmount("")
      setMessage({ text: "تم تحديث مبلغ الدفع بنجاح.", variant: "success" })
    } catch (error: any) {
      console.error("فشل تحديث مبلغ الدفع", error)
      setMessage({ text: error?.message || "حدث خطأ أثناء تحديث مبلغ الدفع.", variant: "error" })
    } finally {
      setPaymentPending(false)
    }
  }

  return (
    <div className="manager-students-page flex flex-1 flex-col px-4 lg:px-6 py-4 md:py-6 gap-6">
      <div className="manager-students-toolbar flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">الطلاب</h2>
          <span className="text-sm text-muted-foreground">عرض وإدارة الطلاب</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">كل الفصول</option>
            {classOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePrint}
            disabled={filteredStudents.length === 0}
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-black hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            طباعة الفصل
          </button>
          <Link
            href="/manager/students/add"
            className="inline-flex h-10 items-center rounded-md bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
          >
            إضافة طالب
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

          <div className="manager-students-print-area w-full">
            <div className="manager-students-print-header hidden">
              <div className="text-lg font-semibold">قائمة الطلاب</div>
              <div className="text-sm">الفصل: {selectedClassName}</div>
              <div className="text-sm">عدد الطلاب: {filteredStudents.length}</div>
            </div>
            <DataTable
              data={filteredStudents}
              paginate
              pageSize={PAGE_SIZE}
              maxHeight="50vh"
              printFriendly
              selectedId={selectedStudent?.id ?? null}
              onSelectRow={setSelectedStudent}
            />
          </div>
      {selectedStudent && (
        <div className="manager-students-details grid gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <AvatarTile src={selectedStudent.personal_image_path} name={selectedStudent.full_name} baseUrl={apiBase} />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => openEditDialog(selectedStudent)}
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-black hover:bg-slate-50"
              >
                تعديل البيانات
              </button>
              <button
                type="button"
                onClick={() => handleToggleStudentStatus(selectedStudent)}
                disabled={statusPendingId === selectedStudent.id}
                className={`inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedStudent.active === false ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {statusPendingId === selectedStudent.id
                  ? "جارٍ التحديث..."
                  : selectedStudent.active === false
                    ? "تفعيل الطالب"
                    : "تعطيل الطالب"}
              </button>
              <button
                type="button"
                onClick={() => openPaymentDialog(selectedStudent)}
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-black hover:bg-slate-50"
              >
                تعديل مبلغ الدفع
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessage(null)
                  setStudentToDelete(selectedStudent)
                }}
                className="inline-flex h-10 items-center rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                حذف الطالب
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoTile title="الاسم الكامل" value={selectedStudent.full_name} />
            <InfoTile title="اسم المستخدم" value={selectedStudent.user_name || "—"} />
            <InfoTile title="البريد الإلكتروني" value={selectedStudent.email || "—"} />
            <InfoTile title="رقم الهاتف" value={selectedStudent.phone_number || "—"} />
            <InfoTile title="المستوى" value={selectedStudent.level || "—"} />
            <InfoTile title="الفصل" value={selectedStudent.class || "—"} />
            <InfoTile title="الجنس" value={selectedStudent.gender || "—"} />
            <InfoTile
              title="الحالة"
              value={selectedStudent.active === false ? "غير نشط" : "نشط"}
            />
            <InfoTile title="ولي الأمر" value={selectedStudent.guardian_name || "—"} />
            <InfoTile title="تاريخ الميلاد" value={selectedStudent.date_of_birth || "—"} />
            <InfoTile title="تاريخ التسجيل" value={selectedStudent.created_at || "—"} />
            <InfoTile title="المبلغ المدفوع" value={String(selectedStudent.paid_amount ?? 0)} />
            <InfoTile title="إجمالي الرسوم" value={String(selectedStudent.total_fee ?? 0)} />
            <InfoTile title="المبلغ المتبقي" value={String(selectedStudent.remaining_amount ?? 0)} />
            <InfoTile title="الدولة" value={selectedStudent.country || "—"} />
            <InfoTile title="الولاية / المنطقة" value={selectedStudent.state || "—"} />
            <InfoTile title="المدينة" value={selectedStudent.city || "—"} />
            <InfoTile
              title="الوثائق الرسمية"
              value={
                selectedStudent.certificate_path ? (
                  <a
                    href={resolveStorageUrl(selectedStudent.certificate_path, apiBase)}
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
              title="ملاحظات"
              value="لا توجد ملاحظات مضافة"
              className="md:col-span-2"
            />
            <InfoTile
              title="ملف الطالب"
              value="يظهر هنا أي محتوى أو معلومات إضافية للطالب المختار."
              className="md:col-span-3 h-32"
            />
          </div>
        </div>
      )}
      <style jsx global>{`
        @media print {
          .manager-students-toolbar,
          .manager-students-details,
          .manager-students-page nav,
          .manager-students-page aside,
          .manager-students-page header {
            display: none !important;
          }

          .manager-students-page {
            padding: 0 !important;
            gap: 0 !important;
          }

          .manager-students-print-header {
            display: grid !important;
            gap: 0.25rem;
            margin-bottom: 1rem;
            text-align: right;
          }

          .manager-students-print-area .overflow-x-auto,
          .manager-students-print-area .overflow-y-auto {
            overflow: visible !important;
          }

          .manager-students-print-area [style*="max-height"] {
            max-height: none !important;
          }

          .manager-students-print-area button,
          .manager-students-print-area input {
            display: none !important;
          }

          .manager-students-print-area .shadow-sm,
          .manager-students-print-area .rounded-xl,
          .manager-students-print-area .border {
            box-shadow: none !important;
          }
        }
      `}</style>
      <AlertDialog open={studentToDelete !== null} onOpenChange={(open) => {
        if (!open && !deletePending) setStudentToDelete(null)
      }}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader className="text-right sm:text-right">
            <AlertDialogTitle>تأكيد حذف الطالب</AlertDialogTitle>
            <AlertDialogDescription>
              {studentToDelete
                ? `سيتم حذف بيانات الطالب "${studentToDelete.full_name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : "سيتم حذف الطالب نهائياً."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel disabled={deletePending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={deletePending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletePending ? "جارٍ الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={studentToEdit !== null}
        onOpenChange={(open) => {
          if (!open && !savePending) {
            setStudentToEdit(null)
            setEditPersonalImage(null)
            setShowPassword(false)
          }
        }}
      >
        <DialogContent dir="rtl" className="sm:max-w-3xl">
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle>تعديل بيانات الطالب</DialogTitle>
            <DialogDescription>
              يمكنك تعديل بيانات الطالب مع بقاء المستوى والفصل للعرض فقط.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-full-name">الاسم الكامل</Label>
                <Input
                  id="student-full-name"
                  value={editForm.full_name}
                  onChange={(e) => handleEditFormChange("full_name", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-email">البريد الإلكتروني</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditFormChange("email", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-username">اسم المستخدم</Label>
                <Input
                  id="student-username"
                  value={editForm.user_name}
                  onChange={(e) => handleEditFormChange("user_name", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-phone">رقم الهاتف</Label>
                <Input
                  id="student-phone"
                  value={editForm.phone_number}
                  onChange={(e) => handleEditFormChange("phone_number", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-password">كلمة مرور جديدة (اختياري)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="student-password"
                    type={showPassword ? "text" : "password"}
                    value={editForm.password}
                    onChange={(e) => handleEditFormChange("password", e.target.value)}
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
                <Label htmlFor="student-current-password">كلمة المرور الحالية</Label>
                <Input id="student-current-password" value="غير متاحة لأسباب أمنية" readOnly />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-personal-image">صورة شخصية جديدة (اختياري)</Label>
                <Input
                  id="student-personal-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setEditPersonalImage(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>الصورة الحالية</Label>
                <div className="h-20 w-20 rounded-md overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {(studentToEdit?.personal_image_path || selectedStudent?.personal_image_path) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveStorageUrl(studentToEdit?.personal_image_path || selectedStudent?.personal_image_path, apiBase)}
                      alt={studentToEdit?.full_name || selectedStudent?.full_name || "student"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">لا توجد صورة</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-guardian">ولي الأمر</Label>
                <Input
                  id="student-guardian"
                  value={editForm.guardian_name}
                  onChange={(e) => handleEditFormChange("guardian_name", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-gender">الجنس</Label>
                <select
                  id="student-gender"
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={editForm.gender}
                  onChange={(e) =>
                    handleEditFormChange("gender", e.target.value === "Female" ? "Female" : "Male")
                  }
                >
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-dob">تاريخ الميلاد</Label>
                <Input
                  id="student-dob"
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => handleEditFormChange("date_of_birth", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-country">الدولة</Label>
                <Input
                  id="student-country"
                  value={editForm.country}
                  onChange={(e) => handleEditFormChange("country", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-state">الولاية / المنطقة</Label>
                <Input
                  id="student-state"
                  value={editForm.state}
                  onChange={(e) => handleEditFormChange("state", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="student-city">المدينة</Label>
                <Input
                  id="student-city"
                  value={editForm.city}
                  onChange={(e) => handleEditFormChange("city", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>المستوى</Label>
                <Input value={studentToEdit?.level ?? ""} disabled />
              </div>
              <div className="flex flex-col gap-1">
                <Label>الفصل</Label>
                <Input value={studentToEdit?.class ?? ""} disabled />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <button
                type="button"
                onClick={() => setStudentToEdit(null)}
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
      <Dialog
        open={studentForPayment !== null}
        onOpenChange={(open) => {
          if (!open && !paymentPending) {
            setStudentForPayment(null)
            setPaymentAmount("")
          }
        }}
      >
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle>تعديل مبلغ الدفع</DialogTitle>
            <DialogDescription>
              {studentForPayment ? `تحديث مبلغ الدفع للطالب "${studentForPayment.full_name}".` : "تحديث مبلغ الدفع للطالب."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePayment} className="grid gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="student-payment-amount">المبلغ المدفوع</Label>
              <Input
                id="student-payment-amount"
                type="number"
                min={0}
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <DialogFooter className="sm:justify-start">
              <button
                type="button"
                onClick={() => {
                  setStudentForPayment(null)
                  setPaymentAmount("")
                }}
                disabled={paymentPending}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={paymentPending}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {paymentPending ? "جارٍ الحفظ..." : "حفظ المبلغ"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
      <div className="text-xs font-semibold mb-1 text-black">صورة الطالب</div>
      <div className="h-32 w-32 rounded-xl bg-[var(--color-sidebar-bg)] text-black shadow-sm overflow-hidden flex items-center justify-center">
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
