import { LoginPageClient, type SchoolBranding } from "@/components/login-page-client";

const DEFAULT_SIDEBAR_COLOR = "#5783af";
const DEFAULT_SCHOOL_NAME = "Online School";
const DEFAULT_SLOGAN = "A smarter way to manage your school";
const DEFAULT_LOGO = "/assets/logo.png";

type SettingsResponse = {
  data?: SchoolBranding | null;
};

function resolveSchoolColor(color?: string | null): string {
  return typeof color === "string" && /^#([A-Fa-f0-9]{6})$/.test(color) ? color : DEFAULT_SIDEBAR_COLOR;
}

function normalizeBranding(branding?: SchoolBranding | null): Required<SchoolBranding> {
  return {
    school_name: branding?.school_name?.trim() || DEFAULT_SCHOOL_NAME,
    slogan: branding?.slogan?.trim() || DEFAULT_SLOGAN,
    school_logo_url: branding?.school_logo_url?.trim() || DEFAULT_LOGO,
    school_color: resolveSchoolColor(branding?.school_color)
  };
}

async function getInitialBranding(): Promise<Required<SchoolBranding>> {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
    const apiRoot = base.endsWith("/api") ? base : `${base}/api`;
    const res = await fetch(`${apiRoot}/manager/settings`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      throw new Error("Failed to load settings");
    }

    const json = (await res.json()) as SettingsResponse;
    return normalizeBranding(json?.data ?? null);
  } catch {
    return normalizeBranding(null);
  }
}

export default async function HomePage() {
  const initialBranding = await getInitialBranding();

  return <LoginPageClient initialBranding={initialBranding} />;
}
