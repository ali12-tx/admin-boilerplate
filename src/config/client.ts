/* ==================== API CLIENT ==================== */

import { API_BASE_URL, API_ENDPOINTS } from "./config";
import type { ApiError, ApiResponse } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Check if we're in development mode
 */
const isDev = true;

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return useAuthStore.getState().accessToken;
}

function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}

/**
 * Set auth token to localStorage
 */
export function setAuthToken(token: string): void {
  useAuthStore.getState().setCredentials({ accessToken: token });
}

/**
 * Set refresh token to localStorage
 */
export function setRefreshToken(token: string): void {
  useAuthStore.getState().setCredentials({ refreshToken: token });
}

/**
 * Clear auth tokens from localStorage
 */
export function clearAuthTokens(): void {
  useAuthStore.getState().logout();
}

let refreshAccessTokenPromise: Promise<string | null> | null = null;

const extractTokenValue = (
  payload: unknown,
  key: "accessToken" | "refreshToken"
): string | null => {
  if (!payload || typeof payload !== "object") return null;

  const rootValue = (payload as Record<string, unknown>)[key];
  if (typeof rootValue === "string" && rootValue.trim()) return rootValue;

  const data = (payload as { data?: unknown }).data;
  if (data && typeof data === "object") {
    const nestedValue = (data as Record<string, unknown>)[key];
    if (typeof nestedValue === "string" && nestedValue.trim()) {
      return nestedValue;
    }
  }

  return null;
};

async function refreshAccessToken(): Promise<string | null> {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  refreshAccessTokenPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await apiClient<unknown>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: "POST",
        requiresAuth: false,
        retryOnAuthError: false,
        body: JSON.stringify({ refreshToken }),
      });

      const nextAccessToken = extractTokenValue(response, "accessToken");
      if (!nextAccessToken) {
        clearAuthTokens();
        return null;
      }

      setAuthToken(nextAccessToken);

      const nextRefreshToken = extractTokenValue(response, "refreshToken");
      if (nextRefreshToken) {
        setRefreshToken(nextRefreshToken);
      }

      return nextAccessToken;
    } catch {
      clearAuthTokens();
      return null;
    } finally {
      refreshAccessTokenPromise = null;
    }
  })();

  return refreshAccessTokenPromise;
}

/**
 * Main API client using fetch
 */
export async function apiClient<TResponse = unknown>(
  endpoint: string,
  options: RequestInit & {
    requiresAuth?: boolean;
    retryOnAuthError?: boolean;
  } = {}
): Promise<TResponse> {
  const {
    requiresAuth = true,
    retryOnAuthError = true,
    headers = {},
    ...fetchOptions
  } = options;

  // Check if body is FormData to avoid setting Content-Type
  const isFormData = fetchOptions.body instanceof FormData;

  // Build request headers
  const requestHeaders: Record<string, string> = {
    // Only set Content-Type if not FormData (browser will set it with boundary)
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(headers as Record<string, string>),
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // Build full URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // Log request in dev mode
  if (isDev) {
    console.group(
      `🌐 API Request: ${fetchOptions.method || "GET"} ${endpoint}`
    );
    console.log("📤 URL:", url);
    console.log("📋 Headers:", requestHeaders);
    if (fetchOptions.body) {
      try {
        console.log("📦 Body:", JSON.parse(fetchOptions.body as string));
      } catch {
        console.log("📦 Body:", fetchOptions.body);
      }
    }
    console.groupEnd();
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle non-OK responses
    if (!response.ok) {
      if (response.status === 401 && requiresAuth && retryOnAuthError) {
        const nextAccessToken = await refreshAccessToken();

        if (nextAccessToken) {
          const retryHeaders = {
            ...requestHeaders,
            Authorization: `Bearer ${nextAccessToken}`,
          };
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
          });

          if (retryResponse.ok) {
            const retryData: ApiResponse<TResponse> = await retryResponse.json();

            if (isDev) {
              console.group(
                `✅ API Response (retried): ${
                  fetchOptions.method || "GET"
                } ${endpoint}`
              );
              console.log("Status:", retryResponse.status);
              console.log("📥 Data:", retryData);
              console.groupEnd();
            }

            return retryData as TResponse;
          }

          const retryErrorData: ApiError = await retryResponse
            .json()
            .catch(() => ({
              success: false,
              message: retryResponse.statusText || "An error occurred",
              statusCode: retryResponse.status,
            }));

          throw new ApiClientError(
            retryResponse.status,
            retryErrorData.message || "Request failed",
            retryErrorData.errors
          );
        }
      }

      const errorData: ApiError = await response.json().catch(() => ({
        success: false,
        message: response.statusText || "An error occurred",
        statusCode: response.status,
      }));

      // Log error in dev mode
      if (isDev) {
        console.group(
          `❌ API Error: ${fetchOptions.method || "GET"} ${endpoint}`
        );
        console.log("Status:", response.status);
        console.log("Error Data:", errorData);
        console.groupEnd();
      }

      throw new ApiClientError(
        response.status,
        errorData.message || "Request failed",
        errorData.errors
      );
    }

    // Parse response
    const data: ApiResponse<TResponse> = await response.json();

    // Log successful response in dev mode
    if (isDev) {
      console.group(
        `✅ API Response: ${fetchOptions.method || "GET"} ${endpoint}`
      );
      console.log("Status:", response.status);
      console.log("📥 Data:", data);
      console.groupEnd();
    }

    return data as TResponse;
  } catch (error) {
    // Re-throw ApiClientError
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      if (isDev) {
        console.error(
          `🔴 Network Error: ${fetchOptions.method || "GET"} ${endpoint}`,
          error
        );
      }
      throw new ApiClientError(
        0,
        "Network error. Please check your connection."
      );
    }

    // Handle unknown errors
    if (isDev) {
      console.error(
        `🔴 Unexpected Error: ${fetchOptions.method || "GET"} ${endpoint}`,
        error
      );
    }
    throw new ApiClientError(500, "An unexpected error occurred");
  }
}

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: <T>(
    endpoint: string,
    options?: RequestInit & {
      requiresAuth?: boolean;
      retryOnAuthError?: boolean;
    }
  ) => apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit & {
      requiresAuth?: boolean;
      retryOnAuthError?: boolean;
    }
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body:
        data instanceof FormData
          ? data
          : data
          ? JSON.stringify(data)
          : undefined,
    }),

  put: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit & {
      requiresAuth?: boolean;
      retryOnAuthError?: boolean;
    }
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit & {
      requiresAuth?: boolean;
      retryOnAuthError?: boolean;
    }
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(
    endpoint: string,
    options?: RequestInit & {
      requiresAuth?: boolean;
      retryOnAuthError?: boolean;
    }
  ) => apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
