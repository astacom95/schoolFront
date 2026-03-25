const RAW_API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/api") ? RAW_API_BASE_URL : `${RAW_API_BASE_URL}/api`;

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
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If parsing fails, use the default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
