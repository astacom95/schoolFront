"use client"

import { useEffect, useMemo, useState } from "react"

type ExamPeriodOption = {
  id: number
  exam_name: string
  exam_year?: number | null
}

type LevelRow = {
  id: number
  name: string
  classes?: Array<{
    id: number
    name: string
  }>
}

type ClassOption = {
  id: number
  name: string
}

type ResultRow = {
  student_id: number
  student_name: string
  percentage: number
  earned_total: number
  max_total: number
  subjects_count: number
}

type ResultsResponse = {
  data?: ResultRow[]
}

export default function ManagerResultsPage() {
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
    [],
  )

  const [periods, setPeriods] = useState<ExamPeriodOption[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [rows, setRows] = useState<ResultRow[]>([])
  const [loadingFilters, setLoadingFilters] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFilters = async () => {
      setLoadingFilters(true)
      setError(null)

      try {
        const [periodsRes, levelsRes] = await Promise.all([
          fetch(`${apiBase}/api/manager/exams-period`, { cache: "no-store" }),
          fetch(`${apiBase}/api/manager/levels`, { cache: "no-store" }),
        ])

        if (!periodsRes.ok || !levelsRes.ok) {
          throw new Error("تعذر تحميل بيانات الفلاتر.")
        }

        const periodsJson = await periodsRes.json()
        const levelsJson = await levelsRes.json()

        const loadedPeriods = Array.isArray(periodsJson?.data) ? periodsJson.data : []
        const loadedLevels = Array.isArray(levelsJson?.data) ? (levelsJson.data as LevelRow[]) : []

        const classMap = new Map<number, string>()
        loadedLevels.forEach((level) => {
          ;(level.classes ?? []).forEach((classItem) => {
            if (typeof classItem.id === "number" && classItem.name) {
              classMap.set(classItem.id, classItem.name)
            }
          })
        })

        const classOptions = Array.from(classMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name, "ar"))

        setPeriods(loadedPeriods)
        setClasses(classOptions)
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الفلاتر.")
        setPeriods([])
        setClasses([])
      } finally {
        setLoadingFilters(false)
      }
    }

    void loadFilters()
  }, [apiBase])

  useEffect(() => {
    if (!selectedPeriodId || !selectedClassId) {
      setRows([])
      return
    }

    const loadResults = async () => {
      setLoadingResults(true)
      setError(null)

      try {
        const query = new URLSearchParams({
          exam_period_id: selectedPeriodId,
          class_id: selectedClassId,
        })
        const res = await fetch(`${apiBase}/api/manager/results?${query.toString()}`, {
          cache: "no-store",
        })
        if (!res.ok) {
          throw new Error("تعذر تحميل النتائج.")
        }

        const json = (await res.json()) as ResultsResponse
        setRows(Array.isArray(json?.data) ? json.data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل النتائج.")
        setRows([])
      } finally {
        setLoadingResults(false)
      }
    }

    void loadResults()
  }, [apiBase, selectedClassId, selectedPeriodId])

  const selectedPeriodLabel = useMemo(() => {
    const period = periods.find((item) => String(item.id) === selectedPeriodId)
    if (!period) {
      return ""
    }

    const yearPart = period.exam_year ? ` - ${period.exam_year}` : ""
    return `${period.exam_name}${yearPart}`
  }, [periods, selectedPeriodId])

  const selectedClassLabel = useMemo(() => {
    return classes.find((item) => String(item.id) === selectedClassId)?.name ?? ""
  }, [classes, selectedClassId])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-4">
                <div className="text-sm font-semibold">نتائج الطلاب</div>

                {loadingFilters ? (
                  <div className="text-sm text-slate-500">جارٍ تحميل الفلاتر...</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">فترة الامتحان</label>
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={selectedPeriodId}
                        onChange={(event) => {
                          setSelectedPeriodId(event.target.value)
                          setSelectedClassId("")
                        }}
                      >
                        <option value="">اختر فترة الامتحان</option>
                        {periods.map((period) => (
                          <option key={period.id} value={period.id}>
                            {period.exam_name}
                            {period.exam_year ? ` - ${period.exam_year}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">الصف</label>
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                        value={selectedClassId}
                        onChange={(event) => setSelectedClassId(event.target.value)}
                        disabled={!selectedPeriodId}
                      >
                        <option value="">اختر الصف</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}

              {!loadingFilters && periods.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  لا توجد فترات امتحانات مضافة حالياً.
                </div>
              ) : null}

              {!loadingFilters && periods.length > 0 && classes.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  لا توجد صفوف متاحة حالياً.
                </div>
              ) : null}

              {!loadingFilters && periods.length > 0 && classes.length > 0 ? (
                <>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>الفترة: {selectedPeriodLabel || "—"}</span>
                    <span>•</span>
                    <span>الصف: {selectedClassLabel || "—"}</span>
                  </div>

                  <div className="max-h-[640px] overflow-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-semibold">الطالب</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">النسبة</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">المجموع</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">عدد المواد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!selectedPeriodId || !selectedClassId ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                              اختر فترة الامتحان ثم الصف لعرض النتائج.
                            </td>
                          </tr>
                        ) : loadingResults ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                              جارٍ تحميل النتائج...
                            </td>
                          </tr>
                        ) : rows.length > 0 ? (
                          rows.map((row) => (
                            <tr key={row.student_id} className="border-b border-slate-200/80 hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-700">{row.student_name}</td>
                              <td className="px-4 py-3 text-slate-700">{row.percentage}%</td>
                              <td className="px-4 py-3 text-slate-600">
                                {row.earned_total} / {row.max_total}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{row.subjects_count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                              لا توجد نتائج مكتملة لهذا الصف خلال فترة الامتحان المحددة.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
