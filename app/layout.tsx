import "./globals.css";
import { ReactNode } from "react";
import AppShell from "../components/layout/AppShell";
import { SchoolThemeProvider } from "@/components/school-theme-provider";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SchoolThemeProvider />
        <AppShell navItems={[]}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
