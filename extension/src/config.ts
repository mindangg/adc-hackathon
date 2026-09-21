/** Base URL của backend (Next.js, /api/slide). Đổi qua env WXT_API_BASE_URL khi build. */
export const API_BASE =
  (import.meta.env.WXT_API_BASE_URL as string | undefined) ?? "http://localhost:3000";
