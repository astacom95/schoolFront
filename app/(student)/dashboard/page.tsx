import Link from "next/link"

import { cards } from "../../../lib/routes"

export default function StudentDashboard() {
  return (
    <div className="card">
      <h2>لوحة الطالب</h2>
      <p style={{ opacity: 0.8 }}>بوابة واحدة لمتابعة الجدول، متابعة الدروس، المهام، والاختبارات.</p>
      <ul>
        {cards.student.map((item) => (
          <li key={item.title}>
            {item.title} - {item.description}
          </li>
        ))}
      </ul>
      <Link
        href="/student/lessons"
        className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
      >
        مشغل الدروس
      </Link>
    </div>
  )
}
