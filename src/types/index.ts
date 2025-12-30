export type ApiResponse<T = unknown> = {
  data: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
};

export type ApiError = {
  message: string;
  statusCode: number;
  success?: false;
  errors?: Record<string, string[]>;
};

export * from "./auth";
export * from "./terms";
export * from "./about-app";
export * from "./privacy-policy";
