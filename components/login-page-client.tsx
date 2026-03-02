"use client";

import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api/client";
import { apiRoutes } from "@/lib/routes";
import { normalizeRole, rememberRole, roleFriendlyNames, roleRoutes, type UserRole } from "@/lib/userRole";

export type SchoolBranding = {
  school_name?: string | null;
  slogan?: string | null;
  school_logo_url?: string | null;
  school_color?: string | null;
};

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

type LoginPageClientProps = {
  initialBranding: Required<SchoolBranding>;
};

const DEFAULT_LOGO = "/assets/logo.png";
const initialCredentials: Credentials = { userName: "", password: "" };

function hexToRgb(color: string): string {
  const value = color.replace("#", "");
  const normalized = value.length === 6 ? value : "5783af";
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `${red}, ${green}, ${blue}`;
}

export function LoginPageClient({ initialBranding }: LoginPageClientProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credentials>(initialCredentials);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirectRole, setRedirectRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [logoSrc, setLogoSrc] = useState(initialBranding.school_logo_url);

  useEffect(() => {
    setLogoSrc(initialBranding.school_logo_url);
    document.documentElement.style.setProperty("--color-sidebar-bg", initialBranding.school_color);
  }, [initialBranding]);

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

      if (response?.token) {
        window.localStorage.setItem("authToken", response.token);
      }

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

  const loginStyle = {
    "--login-brand-color": initialBranding.school_color,
    "--login-brand-color-rgb": hexToRgb(initialBranding.school_color),
    "--color-sidebar-bg": initialBranding.school_color
  } as CSSProperties;

  return (
    <section className="login-screen" style={loginStyle}>
      <div className="login-shell">
        <aside className="login-hero" aria-hidden="true">
          <div className="login-hero-media">
            <div className="login-hero-glow login-hero-glow--one" />
            <div className="login-hero-glow login-hero-glow--two" />
            <div className="login-hero-grid" />
          </div>

          <div className="login-hero-overlay">
            <div className="login-hero-branding">
              <div className="login-brand-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt={initialBranding.school_name}
                  className="login-brand-logo"
                  onError={() => setLogoSrc(DEFAULT_LOGO)}
                />
              </div>

              <h1 className="login-hero-title">{initialBranding.school_name}</h1>
              <p className="login-hero-slogan">{initialBranding.slogan}</p>
            </div>

            <div className="login-hero-quote">
              <p className="login-hero-quote-text">"التعليم هو أقوى سلاح يمكنك استخدامه لتغيير العالم."</p>
            </div>
          </div>
        </aside>

        <div className="login-form-side">
          <div className="login-mobile-branding">
            <div className="login-mobile-brand-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={initialBranding.school_name}
                className="login-mobile-brand-logo"
                onError={() => setLogoSrc(DEFAULT_LOGO)}
              />
            </div>
            <h1 className="login-mobile-title">{initialBranding.school_name}</h1>
            <p className="login-mobile-slogan">{initialBranding.slogan}</p>
          </div>

          <div className="login-form-wrap">
            {redirectRole ? (
              <div className="login-redirect">
                <div className="login-form-header">
                  <h2 className="login-form-title">تسجيل الدخول</h2>
                </div>
                <p className="login-redirect-text">جارٍ تحويلك إلى {roleFriendlyNames[redirectRole]}...</p>
                <p className="login-redirect-subtext">سيتم فتح لوحة التحكم حالاً.</p>
              </div>
            ) : (
              <div className="login-stack">
                <div className="login-form-header">
                  <h2 className="login-form-title">تسجيل الدخول</h2>
                  <p className="login-form-subtitle">مرحباً بك مجدداً، يرجى إدخال بياناتك</p>
                </div>

                <form className="login-form-panel" onSubmit={handleSubmit}>
                  <label className="login-field">
                    <span className="login-field-label">اسم المستخدم</span>
                    <div className="login-field-control">
                      <span className="login-field-icon login-field-icon--end" aria-hidden="true">
                        <UserIcon />
                      </span>
                      <input
                        className="login-input"
                        name="userName"
                        dir="ltr"
                        value={credentials.userName}
                        onChange={(event) => setCredentials((prev) => ({ ...prev, userName: event.target.value }))}
                        placeholder="system.manager"
                        autoComplete="username"
                      />
                    </div>
                  </label>

                  <label className="login-field">
                    <span className="login-field-label">كلمة المرور</span>
                    <div className="login-field-control">
                      <span className="login-field-icon login-field-icon--end" aria-hidden="true">
                        <LockIcon />
                      </span>
                      <button
                        type="button"
                        className="login-field-toggle"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                      <input
                        className="login-input"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        dir="ltr"
                        value={credentials.password}
                        onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                      />
                    </div>
                  </label>

                  {error ? <p className="login-error">{error}</p> : null}

                  <button className="login-submit" type="submit" disabled={submitting}>
                    {submitting ? "جارٍ التحقق..." : "دخول"}
                  </button>
                </form>

                <div className="login-footer-note">
                  <p className="login-footer-text">
                    ليس لديك حساب؟
                    {" "}
                    <span className="login-footer-link">تواصل مع الإدارة</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Zm0 11.2c4.3 0 7.8 2.5 8.7 5.8a1 1 0 0 1-.97 1.25H4.27a1 1 0 0 1-.97-1.25c.9-3.3 4.4-5.8 8.7-5.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 1 1 10 0v2m-9 0h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm4 4v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 6a9.55 9.55 0 0 1 1.4-.1C18 5.9 21.5 12 21.5 12a17.8 17.8 0 0 1-4.06 4.68M6.28 8.3A17.56 17.56 0 0 0 2.5 12s3.5 6.1 9.5 6.1c1.1 0 2.12-.2 3.05-.56M9.88 9.88A3 3 0 0 0 12 15a2.98 2.98 0 0 0 2.12-.88"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
