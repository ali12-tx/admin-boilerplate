/* ==================== API CONFIGURATION ==================== */

/**
 * Base API URL - Update this with your actual backend URL
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/signin",
    LOGOUT: "/user/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_OTP: "/auth/verify-otp-forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESEND_OTP: "/auth/forgot-password",
    UPDATE_PASSWORD: "/auth/update-password",
    UPLOAD: "/auth/upload",
  },
  S3: {
    SIGNED_URL: "/s3/signed-upload-url",
  },
  ABOUT_APP: {
    ROOT: "/about-app",
  },
  USER: {
    GET_USER: (id: string) => `/users/${id}`,
    GET_ALL: "/users",
    DELETE_USER: (userId: string) => `/users/${userId}`,
    ADMIN_BLOCK_USER: (userId: string) => `/users/${userId}/admin-block`,
  },
  PRIVACY_POLICY: {
    ROOT: "/privacy-policy",
  },
  TERMS: {
    ROOT: "/terms-and-conditions",
  },
} as const;

/**
 * Token storage keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;
