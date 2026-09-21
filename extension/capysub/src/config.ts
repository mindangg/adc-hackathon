/** Base URL của backend Capy. Đổi qua env WXT_API_BASE_URL khi build. */
export const API_BASE =
  (import.meta.env.WXT_API_BASE_URL as string | undefined) ?? "http://localhost:3000";

/** Supabase anon config dùng cho OAuth trực tiếp trong extension. */
export const SUPABASE_URL =
  (import.meta.env.WXT_SUPABASE_URL as string | undefined) ??
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined);
export const SUPABASE_ANON_KEY =
  (import.meta.env.WXT_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined);
