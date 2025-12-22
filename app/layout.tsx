"use client";

import "./globals.css";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppShell from "../components/layout/AppShell";
import { getStoredRole, rememberRole, roleFromPathname, type UserRole } from "../lib/userRole";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("manager");

  useEffect(() => {
    const derived = pathname ? roleFromPathname(pathname) : null;
    const stored = getStoredRole();
    const nextRole: UserRole = derived ?? stored ?? "manager";
    setRole(nextRole);
    rememberRole(nextRole);
  }, [pathname]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <AppShell navItems={[]}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
