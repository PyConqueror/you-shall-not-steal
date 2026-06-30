const API_BASE_URL_ENV_KEY = "VITE_API_BASE_URL";

export function getApiBaseUrl() {
  const env = import.meta.env as Record<string, string | undefined>;
  const apiBaseUrl = env[API_BASE_URL_ENV_KEY]?.trim();

  if (!apiBaseUrl) {
    throw new Error(`${API_BASE_URL_ENV_KEY} is not configured.`);
  }

  return apiBaseUrl.replace(/\/+$/, "");
}
