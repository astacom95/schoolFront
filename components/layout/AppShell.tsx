import Link from "next/link";
import { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
};

type AppShellProps = {
  navItems: NavItem[];
  children: ReactNode;
};

export default function AppShell({ navItems, children }: AppShellProps) {
  const hasNav = navItems.length > 0;

  return (
    <div
      style={{
        display: hasNav ? "grid" : "block",
        gridTemplateColumns: hasNav ? "1fr 260px" : undefined,
        minHeight: "100vh",
        background: "transparent"
      }}
    >
      <main style={{ padding: 0 }}>
        {children}
      </main>
      {hasNav && (
        <aside
          style={{
            borderLeft: "1px solid rgba(15, 23, 42, 0.08)",
            padding: 24,
            textAlign: "right",
            background: "var(--color-surface)",
            boxShadow: "-10px 0 30px rgba(15, 23, 42, 0.05)"
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: 18, fontSize: 22 }}>منصة المدرسة الإلكترونية</h1>
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--color-highlight)",
                  textAlign: "right",
                  border: "1px solid rgba(15, 23, 42, 0.05)",
                  color: "var(--color-text)",
                  fontWeight: 600
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      )}
    </div>
  );
}
