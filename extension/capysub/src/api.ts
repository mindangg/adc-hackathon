import type {
  Lang,
  Segment,
  TranslateRequest,
  TranslateStreamMessage,
  VideoContext,
} from "@/capysub/shared";
import { API_BASE } from "./config";
import { getValidAccessToken } from "./auth";

/**
 * Gọi backend dịch, đọc stream NDJSON, gọi onMessage cho mỗi message.
 * Cho phép overlay hiển thị dần từng batch (không chờ dịch hết video).
 *
 * Gắn Bearer token (M3). Chưa đăng nhập / token hỏng → phát lỗi "unauthorized"
 * để content script nhắc người dùng đăng nhập.
 */
export async function translateSegments(
  params: {
    videoId: string;
    sourceLang: Lang;
    targetLang: Lang;
    segments: Segment[];
    contextBefore?: string[];
    contextAfter?: string[];
    videoContext?: VideoContext;
    /** Chunk cần dịch (lưới CHUNK_SECONDS); `segments` là đúng dòng của chunk. */
    chunkIndex: number;
  },
  onMessage: (msg: TranslateStreamMessage) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = await getValidAccessToken();
  if (!token) {
    onMessage({ type: "error", message: "unauthorized" });
    return;
  }

  const body: TranslateRequest = params;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    // Hủy chủ động (đổi video / tua / teardown) → im lặng. Lỗi mạng khác → báo.
    if (signal?.aborted) return;
    onMessage({ type: "error", message: e instanceof Error ? e.message : "network_error" });
    return;
  }

  if (res.status === 401) {
    onMessage({ type: "error", message: "unauthorized" });
    return;
  }

  if (res.status === 402) {
    onMessage({ type: "error", message: "quota_exceeded" });
    return;
  }

  if (!res.ok || !res.body) {
    onMessage({ type: "error", message: `http_${res.status}` });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        try {
          onMessage(JSON.parse(line) as TranslateStreamMessage);
        } catch {
          // bỏ qua dòng lỗi, tiếp tục stream
        }
      }
    }
  } catch (e) {
    // Stream bị hủy giữa chừng (abort) → im lặng; lỗi đọc khác → báo.
    if (signal?.aborted) return;
    onMessage({ type: "error", message: e instanceof Error ? e.message : "stream_error" });
  }
}
