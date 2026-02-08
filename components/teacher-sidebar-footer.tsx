"use client"

import { useEffect, useState } from "react"

import { apiFetch } from "@/lib/api/client"
import { NavUser } from "@/components/nav-user"

export function TeacherSidebarFooter() {
  const [profile, setProfile] = useState<{
    full_name?: string | null
    email?: string | null
    personal_image_url?: string | null
  } | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = (await apiFetch("/teacher/profile")) as {
          data?: { full_name?: string; email?: string; personal_image_url?: string }
        }
        setProfile(res?.data ?? null)
      } catch {
        setProfile(null)
      }
    }
    void loadProfile()
  }, [])

  return (
    <NavUser
      user={{
        name: profile?.full_name ?? "معلم",
        email: profile?.email ?? "—",
        avatar: profile?.personal_image_url ?? "",
      }}
    />
  )
}
