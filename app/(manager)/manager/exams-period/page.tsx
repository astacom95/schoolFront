"use client"

import { useEffect, useState } from "react"

type ExamPeriodRow = {
  id: number
  exam_name: string
  exam_year: number
  exam_start_date: string
  exam_end_date: string
}

export default function ManagerExamPeriodsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
  const [rows, setRows] = useState<ExamPeriodRow[]>([])
  const [examName, setExamName] = useState("")
  const [examYear, setExamYear] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadPeriods = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/manager/exams-period`)
      const json = await res.json()
      const list = Array.isArray(json?.data) ? json.data : []
      setRows(list)
    } catch {
      setRows([])
    }
  }

  useEffect(() => {
    void loadPeriods()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`${apiBaseUrl}/api/manager/exams-period`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_name: examName.trim(),
          exam_year: Number(examYear),
          exam_start_date: startDate,
          exam_end_date: endDate,
        }),
      })

      if (!res.ok) {
        let message = "تعذر حفظ فترة الامتحان."
        try {
          const data = await res.json()
          if (data?.message) message = data.message
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      setExamName("")
      setExamYear("")
      setStartDate("")
      setEndDate("")
      setSuccess("تم حفظ فترة الامتحان بنجاح.")
      await loadPeriods()
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ فترة الامتحان.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-base font-semibold">فترات الامتحانات</h1>
                <span className="text-xs text-slate-500">إضافة فترة جديدة</span>
              </div>

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-500">اسم الامتحان</label>
                  <input
                    value={examName}
                    onChange={(event) => setExamName(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                    placeholder="امتحانات منتصف العام"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-500">سنة الامتحان</label>
                  <input
                    value={examYear}
                    onChange={(event) => setExamYear(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                    placeholder="2026"
                    type="number"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-500">تاريخ البداية</label>
                  <input
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                    type="date"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-slate-500">تاريخ النهاية</label>
                  <input
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[rgba(170,196,245,0.45)]"
                    type="date"
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-10 rounded-xl bg-[var(--color-sidebar-bg)] px-5 text-sm font-semibold text-white transition disabled:opacity-60"
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ الفترة"}
                  </button>
                  {error ? <span className="text-xs text-red-600">{error}</span> : null}
                  {success ? <span className="text-xs text-green-600">{success}</span> : null}
                </div>
              </form>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-semibold">كل فترات الامتحانات</div>
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#E9F0FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold">الامتحان</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">السنة</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">البداية</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">النهاية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length > 0 ? (
                      rows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-700">{row.exam_name}</td>
                          <td className="px-4 py-3 text-slate-600">{row.exam_year}</td>
                          <td className="px-4 py-3 text-slate-600">{row.exam_start_date}</td>
                          <td className="px-4 py-3 text-slate-600">{row.exam_end_date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                          لا توجد فترات امتحانات بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                جميع الحقول مطلوبة، وتاريخ النهاية يجب أن يكون بعد تاريخ البداية.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
