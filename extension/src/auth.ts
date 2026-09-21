import { browser } from "wxt/browser";
import type { AuthSession } from "@/shared";
import { API_BASE } from "./config";

const STORAGE_KEY = "capy:session";

/** Đọc session đã lưu (null nếu chưa đăng nhập). */
export async function getSession(): Promise<AuthSession | null> {
  const obj = await browser.storage.local.get(STORAGE_KEY);
  return (obj[STORAGE_KEY] as AuthSession | undefined) ?? null;
}

export async function setSession(session: AuthSession): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: session });
}

export async function clearSession(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY);
}

/** Còn hạn nếu access_token sống thêm > 60s (buffer tránh hết hạn giữa chừng). */
function isFresh(session: AuthSession): boolean {
  return session.expiresAt * 1000 - Date.now() > 60_000;
}

/**
 * Lấy access_token còn hạn để gắn vào request. Nếu sắp hết hạn → refresh qua
 * backend. Thất bại (refresh_token hết hạn) → xoá session, trả null → UI yêu
 * cầu đăng nhập lại.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  if (isFresh(session)) return session.accessToken;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!res.ok) {
      await clearSession();
      return null;
    }
    const next = (await res.json()) as AuthSession;
    await setSession(next);
    return next.accessToken;
  } catch {
    // Lỗi mạng: giữ session, trả token cũ để thử (server sẽ trả 401 nếu hỏng).
    return session.accessToken;
  }
}

/** Theo dõi thay đổi session (đăng nhập/đăng xuất) để popup cập nhật UI. */
export function onSessionChange(cb: (session: AuthSession | null) => void): () => void {
  const listener = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area === "local" && STORAGE_KEY in changes) {
      cb((changes[STORAGE_KEY]?.newValue as AuthSession | undefined) ?? null);
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
