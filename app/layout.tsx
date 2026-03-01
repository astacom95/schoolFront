import "./globals.css";
import { ReactNode } from "react";
import { Cairo } from "next/font/google";
import AppShell from "../components/layout/AppShell";
import { SchoolThemeProvider } from "@/components/school-theme-provider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cairo",
});

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} ${cairo.variable}`} suppressHydrationWarning>
        <SchoolThemeProvider />
        <AppShell navItems={[]}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
