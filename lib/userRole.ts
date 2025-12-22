export type UserRole = "manager" | "teacher" | "student";

export const roleRoutes: Record<UserRole, string> = {
  manager: "/manager/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard"
};

export const roleFriendlyNames: Record<UserRole, string> = {
  manager: "لوحة المدير",
  teacher: "لوحة المعلم",
  student: "لوحة الطالب"
};

export function normalizeRole(value?: string | null): UserRole | null {
  if (!value) {
    return null;
  }

  const lower = value.toLowerCase();

  if (lower === "manager" || lower === "teacher" || lower === "student") {
    return lower as UserRole;
  }

  return null;
}

export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizeRole(window.localStorage.getItem("userRole"));
}

export function rememberRole(role: UserRole): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("userRole", role);
}

export function roleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith("/manager")) {
    return "manager";
  }

  if (pathname.startsWith("/teacher")) {
    return "teacher";
  }

  if (pathname.startsWith("/student")) {
    return "student";
  }

  return null;
}
