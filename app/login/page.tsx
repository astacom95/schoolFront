"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawApi = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
  const apiRoot = rawApi.endsWith("/api") ? rawApi : `${rawApi}/api`;
  const appRoot = rawApi.endsWith("/api") ? rawApi.slice(0, -4) : rawApi;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetch(`${appRoot}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch(`${apiRoot}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message ?? "Login failed");
      }

      router.push("/manager/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  // ✅ زر الدخول بالتوكن (للتطوير فقط)
  const onDevTokenLogin = async () => {
    setDevLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiRoot}/dev-token`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message ?? `Dev token failed (${res.status})`);
      }

      if (!data?.token) {
        throw new Error("Token not found in response");
      }

      localStorage.setItem("authToken", data.token);

      router.push("/manager/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to get token");
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 20 }}>
      {/* ✅ علامة تأكيد قوية جدًا */}
      <div
        style={{
          background: "yellow",
          padding: 10,
          fontWeight: 700,
          marginBottom: 12,
          border: "1px solid #999",
        }}
      >
        ✅ THIS IS app/login/page.tsx — زر التوكن موجود تحت زر Login
      </div>

      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Login</h1>

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Username أو Email
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            placeholder="username أو manager@test.com"
            autoComplete="username"
            required
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? (
          <div style={{ color: "crimson", margin: "10px 0" }}>{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={loading || devLoading}
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* خط فاصل واضح */}
        <div style={{ height: 12 }} />

        <button
          type="button"
          onClick={onDevTokenLogin}
          disabled={loading || devLoading}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 0,
            border: "1px solid #ccc",
            background: "#f7f7f7",
            fontWeight: 700,
          }}
        >
          {devLoading ? "Getting token..." : "دخول بالتوكن (تجريبي)"}
        </button>
      </form>
    </div>
  );
}
