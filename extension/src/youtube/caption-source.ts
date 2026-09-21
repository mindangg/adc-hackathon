import type { Lang, Segment } from "@/shared";
import {
  CAPY_MSG,
  type GetCaptionsRequest,
  type GetCaptionsResponse,
} from "./yt-bridge";

/**
 * Client (isolated world) lấy caption qua MAIN-world bridge (yt-capture).
 * KHÔNG fetch timedtext trực tiếp — YouTube chặn bằng token pot (xem timedtext.ts).
 */

export type CaptionResult =
  | { ok: true; sourceLang: Lang; segments: Segment[] }
  | { ok: false; reason: "no_captions" | "no_matching_lang" | "fetch_failed" | "no_player" | "timeout" };

let reqCounter = 0;

/**
 * Yêu cầu caption cho video hiện tại. `preferred` = ngôn ngữ GỐC ưu tiên
 * (thường "en" cho video tech tiếng Anh khi dịch sang Việt).
 */
export function getCaptions(preferred: Lang = "en", timeoutMs = 12000): Promise<CaptionResult> {
  const reqId = `capy-${Date.now()}-${reqCounter++}`;

  return new Promise((resolve) => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as GetCaptionsResponse | undefined;
      if (!data || data.channel !== CAPY_MSG || data.dir !== "to-cs" || data.reqId !== reqId) return;
      cleanup();
      if (data.ok) resolve({ ok: true, sourceLang: data.sourceLang, segments: data.segments });
      else resolve({ ok: false, reason: data.reason });
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({ ok: false, reason: "timeout" });
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
    }

    window.addEventListener("message", onMessage);

    const req: GetCaptionsRequest = {
      channel: CAPY_MSG,
      dir: "to-mw",
      cmd: "get-captions",
      reqId,
      preferred,
    };
    window.postMessage(req, "*");
  });
}
