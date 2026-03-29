const RAW_API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/api") ? RAW_API_BASE_URL : `${RAW_API_BASE_URL}/api`;

export class ApiError extends Error {
  status: number
  code?: string
  payload?: Record<string, unknown>

  constructor(message: string, status: number, code?: string, payload?: Record<string, unknown>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.payload = payload
  }
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null;
  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    let errorCode: string | undefined;
    let payload: Record<string, unknown> | undefined;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object") {
        payload = errorData as Record<string, unknown>;
      }
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      if (typeof errorData.code === "string") {
        errorCode = errorData.code;
      }
    } catch (e) {
      // If parsing fails, use the default message
    }
    throw new ApiError(errorMessage, response.status, errorCode, payload);
  }

  return response.json();
}
