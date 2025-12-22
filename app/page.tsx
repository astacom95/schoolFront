"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api/client";
import { apiRoutes } from "../lib/routes";
import { colors } from "../lib/theme";
import { normalizeRole, rememberRole, roleFriendlyNames, roleRoutes, type UserRole } from "../lib/userRole";

type LoginResponse = {
  token?: string;
  user?: {
    role?: string;
    full_name?: string;
  };
};

type Credentials = {
  userName: string;
  password: string;
};

const initialCredentials: Credentials = { userName: "", password: "" };

export default function HomePage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credentials>(initialCredentials);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirectRole, setRedirectRole] = useState<UserRole | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    if (!credentials.userName.trim() || !credentials.password.trim()) {
      setError("من فضلك أدخل اسم المستخدم وكلمة المرور.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        user_name: credentials.userName.trim(),
        password: credentials.password
      };

      const response = (await apiFetch(apiRoutes.auth.login, {
        method: "POST",
        body: JSON.stringify(payload)
      })) as LoginResponse;

      const role = normalizeRole(response?.user?.role);
      if (!role) {
        throw new Error("تعذر تحديد الدور الخاص بك. تأكد من بيانات الدخول.");
      }

      rememberRole(role);
      setRedirectRole(role);
      router.replace(roleRoutes[role]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء تسجيل الدخول.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login-layout">

      <Illustration />


      <div style={{ height: "100vh", width: "50vw", background: "var(--color-surface-alt)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {redirectRole ? (
          <>
            <p style={{ marginTop: 0 }}>جارٍ تحويلك إلى {roleFriendlyNames[redirectRole]}...</p>
            <p style={{ fontSize: 14, opacity: 0.8 }}>سيتم فتح لوحة التحكم حالاً.</p>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ marginBottom: 6, marginTop: 0 }}>تسجيل الدخول</h2>
              <p style={{ margin: 0, color: "var(--color-muted-text)" }}>
                ادخل بيانات الحساب للوصول إلى لوحتك المخصصة.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600 }}>
                <span>اسم المستخدم</span>
                <input
                  name="userName"
                  dir="ltr"
                  value={credentials.userName}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, userName: event.target.value }))}
                  style={inputStyle}
                  placeholder="system.manager"
                  autoComplete="username"
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600 }}>
                <span>كلمة المرور</span>
                <input
                  type="password"
                  name="password"
                  dir="ltr"
                  value={credentials.password}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              {error && (
                <p style={{ color: "#f87171", margin: 0, fontWeight: 600 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "120%",
                  height: "68px",
                  borderRadius: "15px",
                  border: "none",
                  background: submitting ? "rgba(140, 169, 255, 0.7)" : "#8CA9FF",
                  color: "#FFFFFF",
                  fontSize: "24px",
                  fontWeight: 500,
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "transform 0.2s ease, background 0.2s ease",
                  boxShadow: "0 15px 30px rgba(140, 169, 255, 0.35)",
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                {submitting ? "جارٍ التحقق..." : "دخول"}
              </button>
            </form>

            <p style={{ marginTop: 20, fontSize: 13, color: "var(--color-muted-text)" }}>
              بالضغط على دخول فإنك توافق على سياسات الاستخدام وحماية البيانات للمنصة.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

const inputStyle: CSSProperties = {
  width: "120%",
  height: "77px",
  padding: "0 24px",
  borderRadius: "15px",
  border: "2px solid #8CA9FF",
  background: "#F5F7FD",
  color: "#676B84",
  fontSize: "24px",
  fontWeight: 500,
  fontFamily: "Roboto, sans-serif",
  boxShadow: "none",
  outline: "none",
  textAlign: "right"
};

function Illustration() {
  return (
    <div
      style={{
        position: "relative",
        width: "50vw",
        height: "100vh",
        background: "var(--color-primary)",


        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* undraw_notebook_8ihb.svg - Top center/right area */}
      <img
        src="/assets/logo.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          width: "240px",
          height: "auto",
        }}
      />



    </div>
  );
}
