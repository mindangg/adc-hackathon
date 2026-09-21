import { defineContentScript } from "wxt/utils/define-content-script";
import { browser } from "wxt/browser";
import type { Lang } from "@/capysub/shared";
import { getCaptions } from "../src/youtube/caption-source";
import {
  getPlayerContainer,
  getVideoContext,
  getVideoElement,
  getVideoId,
} from "../src/youtube/dom-adapter";
import { SubtitleOverlay } from "../src/ui/overlay";
import { ToggleButton, type ToggleButtonState } from "../src/ui/toggle-button";
import { LazyTranslator } from "../src/lazy-translate";
import { loadSettings, onSettingsChange, type CaptionSettings } from "../src/settings";
import type { PopupToContent, StatusResponse } from "../src/messaging";

const STATE_MAP: Record<StatusResponse["state"], ToggleButtonState> = {
  idle: "idle",
  loading: "loading",
  translating: "translating",
  done: "done",
  error: "error",
  unsupported: "error",
  unauthorized: "error",
  paywall: "error",
};

export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  runAt: "document_idle",

  main() {
    let overlay: SubtitleOverlay | null = null;
    let toggle: ToggleButton | null = null;
    let lazy: LazyTranslator | null = null;

    function sendStatus(status: Omit<StatusResponse, "type">): void {
      const msg: StatusResponse = { type: "capy:status", ...status };
      browser.runtime.sendMessage(msg).catch(() => {
        /* popup có thể đã đóng — bỏ qua */
      });
      toggle?.setState(STATE_MAP[status.state], status.message);
    }

    function teardown(): void {
      lazy?.stop();
      lazy = null;
      overlay?.destroy();
      overlay = null;
    }

    function mountButton(): void {
      const container = getPlayerContainer();
      if (!container) return;
      if (toggle && !toggle.isMounted(container)) {
        toggle.destroy();
        toggle = null;
      }
      if (!toggle) {
        // Bấm nút trên player → mở action popup thật của extension, giống các
        // extension dịch phụ đề khác. Popup tự gửi lệnh dịch về content script.
        toggle = new ToggleButton(container, () => {
          void browser.runtime.sendMessage({ type: "capy:open-popup" });
        });
      }
    }

    async function handleTranslate(): Promise<void> {
      teardown();
      sendStatus({ state: "loading" });

      const settings = await loadSettings();
      const targetLang = settings.targetLang;

      const videoId = getVideoId();
      if (!videoId) {
        sendStatus({ state: "unsupported", message: "Hãy mở một video YouTube." });
        return;
      }

      // Nguồn caption: ưu tiên ngôn ngữ đối diện với đích (dịch en→vi thì tìm caption en).
      const preferred: Lang = targetLang === "vi" ? "en" : "vi";
      const captions = await getCaptions(preferred);
      if (!captions.ok) {
        const message =
          captions.reason === "no_captions"
            ? "Video này chưa hỗ trợ dịch (không có phụ đề gốc)."
            : captions.reason === "no_matching_lang"
              ? "Không tìm thấy phụ đề En/Vi cho video này."
              : "Không lấy được phụ đề. Thử phát video rồi bấm lại.";
        sendStatus({ state: "unsupported", message });
        return;
      }

      const video = getVideoElement();
      const container = getPlayerContainer();
      if (!video || !container) {
        sendStatus({ state: "error", message: "Không tìm thấy trình phát video." });
        return;
      }

      overlay = new SubtitleOverlay(container, video, settings);
      overlay.start();

      sendStatus({ state: "translating", progress: { done: 0, total: captions.segments.length } });
      const videoContext = getVideoContext(captions.segments.map((segment) => segment.text));

      // M6: dịch LƯỜI theo chunk quanh vị trí đang phát, không dịch cả video 1 lần.
      lazy = new LazyTranslator({
        video,
        videoId,
        sourceLang: captions.sourceLang,
        targetLang,
        videoContext,
        segments: captions.segments,
        onSegments: (segs) => overlay?.addSegments(segs),
        onProgress: (done, total, loading, blocked, translatedMinutes) => {
          // Còn chunk đang tải → "đang dịch"; đã kịp phần quanh playhead → "xong".
          sendStatus({
            state: loading > 0 ? "translating" : blocked > 0 ? "paywall" : "done",
            message: blocked > 0 ? "Phần đã dịch vẫn xem lại được. Nâng cấp để dịch phần mới." : undefined,
            progress: { done, total, translatedMinutes },
          });
        },
        onQuotaExceeded: () => {
          // Không teardown overlay: phụ đề đã dịch vẫn phải xem lại được.
          sendStatus({
            state: "paywall",
            message: "Phần đã dịch vẫn xem lại được. Nâng cấp để dịch phần mới.",
          });
        },
        onFatal: (kind) => {
          teardown();
          if (kind === "unauthorized") {
            // Popup có nút "Đăng nhập" → không tự mở tab, để người dùng chủ động.
            sendStatus({ state: "unauthorized", message: "Bạn cần đăng nhập Capy để dịch." });
          } else {
            sendStatus({ state: "error", message: "Dịch thất bại. Thử lại sau." });
          }
        },
      });
      lazy.start();
    }

    browser.runtime.onMessage.addListener((raw: unknown) => {
      const cmd = raw as PopupToContent;
      if (cmd?.type === "capy:translate") {
        void handleTranslate();
      } else if (cmd?.type === "capy:stop") {
        teardown();
        sendStatus({ state: "idle" });
      }
    });

    // Đổi giao diện caption trong popup (cỡ chữ, màu, vị trí...) áp dụng ngay
    // lên overlay đang chạy, không cần dịch lại.
    onSettingsChange((settings: CaptionSettings) => {
      overlay?.updateSettings(settings);
    });

    // Nút bật/tắt dịch đè lên player. YouTube là SPA (chuyển video không reload
    // trang) nên phải: mount lại nếu #movie_player bị thay thế, và tắt dịch cũ
    // khi người dùng chuyển sang video khác.
    let currentVideoId = getVideoId();
    mountButton();

    const onNavigate = (): void => {
      const videoId = getVideoId();
      if (videoId !== currentVideoId) {
        currentVideoId = videoId;
        teardown();
        sendStatus({ state: "idle" });
      }
      mountButton();
    };
    document.addEventListener("yt-navigate-finish", onNavigate);
    setInterval(mountButton, 2000);
  },
});
