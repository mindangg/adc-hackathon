import { defineContentScript } from "wxt/utils/define-content-script";
import { authSessionSchema } from "@/capysub/shared";
import { clearSession, setSession } from "../src/auth";

/**
 * Cầu nối token: chạy TRÊN origin của web Capy (login page). Trang login phát
 * session qua window.postMessage; script này (isolated world) bắt, validate rồi
 * lưu vào chrome.storage để các phần khác của extension dùng.
 *
 * An toàn: chỉ nhận message cùng origin (event.source === window) và có marker
 * "capy-web". Script chỉ được inject trên origin tin cậy khai báo ở matches.
 */
// Origin tin cậy để nhận token. Dev: localhost. Production: WXT_WEB_ORIGIN (domain
// thật) — bản production KHÔNG kèm localhost để giữ permission tối thiểu.
const WEB_ORIGIN = import.meta.env.WXT_WEB_ORIGIN as string | undefined;
const isProd = import.meta.env.MODE === "production";
const bridgeMatches = [
  ...(isProd ? [] : ["http://localhost/*", "http://127.0.0.1/*"]),
  ...(WEB_ORIGIN ? [`${WEB_ORIGIN}/*`] : []),
];
// Fallback an toàn: build production quên set WXT_WEB_ORIGIN → giữ localhost để
// tránh matches rỗng (WXT lỗi). Nhắc trong checklist phải set env khi publish.
// Lưu ý: match pattern không hỗ trợ port, nên "http://localhost/*" khớp mọi port.
if (bridgeMatches.length === 0) bridgeMatches.push("http://localhost/*");

export default defineContentScript({
  matches: bridgeMatches,
  runAt: "document_start",

  main() {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;

      const data = event.data as { source?: string; type?: string; session?: unknown };
      if (data?.source !== "capy-web") return;

      if (data.type === "capy:logout") {
        void clearSession();
        return;
      }

      if (data.type === "capy:auth") {
        const parsed = authSessionSchema.safeParse(data.session);
        if (parsed.success) void setSession(parsed.data);
      }
    });
  },
});
