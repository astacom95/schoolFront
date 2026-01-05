import "./globals.css";
import { ReactNode } from "react";
import AppShell from "../components/layout/AppShell";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell navItems={[]}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
