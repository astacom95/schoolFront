"use client"

import { useEffect } from "react"

const DEFAULT_SIDEBAR_COLOR = "#5783af"

type SettingsResponse = {
  data?: {
    school_color?: string | null
  } | null
}

function applySchoolColor(color?: string | null) {
  const resolvedColor = typeof color === "string" && /^#([A-Fa-f0-9]{6})$/.test(color) ? color : DEFAULT_SIDEBAR_COLOR
  document.documentElement.style.setProperty("--color-sidebar-bg", resolvedColor)
}

export function SchoolThemeProvider() {
  useEffect(() => {
    let cancelled = false

    const loadTheme = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "")
        const apiRoot = base.endsWith("/api") ? base : `${base}/api`
        const res = await fetch(`${apiRoot}/manager/settings`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          throw new Error("Failed to load settings")
        }

        const json = (await res.json()) as SettingsResponse
        if (!cancelled) {
          applySchoolColor(json?.data?.school_color ?? null)
        }
      } catch {
        if (!cancelled) {
          applySchoolColor(null)
        }
      }
    }

    void loadTheme()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
