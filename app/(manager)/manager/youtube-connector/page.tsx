"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"

const statusCopy: Record<string, string> = {
  connected: "تم ربط يوتيوب بنجاح.",
  error: "حدث خطأ أثناء التفويض.",
  missing_code: "لم يتم استلام رمز التفويض من جوجل.",
  token_error: "تعذر الحصول على رمز الوصول من جوجل.",
  missing_refresh_token: "لم يتم استلام رمز التحديث. يرجى إعادة المحاولة.",
}

export default function YouTubeConnectorPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status") ?? ""
  const statusMessage = statusCopy[status]

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
    []
  )

  const handleConnect = () => {
    window.location.href = `${apiBase}/youtube/connect`
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">موصل يوتيوب</h1>
          <p className="mt-2 text-sm text-slate-600">
            اربط قناة المدرسة على يوتيوب لتمكين البث المباشر تلقائيا.
          </p>
        </div>
            {statusMessage ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {statusMessage}
              </div>
            ) : null}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-start gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">ربط حساب يوتيوب</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    سيتم تحويلك إلى جوجل للموافقة على الوصول، ثم نعود تلقائيا.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleConnect}
                  className="bg-[var(--color-sidebar-bg)] text-white hover:opacity-90"
                >
                  Connect YouTube
                </Button>
              </div>
            </div>
      </div>
    </div>
  )
}
