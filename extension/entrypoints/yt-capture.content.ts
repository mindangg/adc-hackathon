import { defineContentScript } from "wxt/utils/define-content-script";
import { parseJson3, pickTrack, type CaptionTrackLike } from "../src/youtube/timedtext";
import {
  CAPY_MSG,
  type GetCaptionsRequest,
  type GetCaptionsResponse,
} from "../src/youtube/yt-bridge";

/**
 * Content script chạy ở MAIN world (cùng ngữ cảnh với player YouTube) để:
 *  1. Hook XMLHttpRequest → bắt response timedtext do CHÍNH player phát ra
 *     (request này mới có token `pot` hợp lệ; baseUrl tự trích thì bị chặn rỗng).
 *  2. Bật CC cho track nguồn qua player API để buộc player nạp timedtext.
 * Trả kết quả về isolated content script qua window.postMessage.
 *
 * (Kỹ thuật này đã kiểm chứng live trên video thật — bắt đúng 286 dòng json3.)
 */
export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  world: "MAIN",
  runAt: "document_start",

  main() {
    // Cache responseText timedtext mới nhất theo languageCode.
    const latestByLang = new Map<string, string>();
    const TIMEDTEXT_EVENT = "capy:timedtext";

    installXhrHook(latestByLang, TIMEDTEXT_EVENT);

    window.addEventListener("message", (ev: MessageEvent) => {
      const data = ev.data as GetCaptionsRequest | undefined;
      if (!data || data.channel !== CAPY_MSG || data.dir !== "to-mw") return;
      if (data.cmd === "get-captions") {
        void handleGetCaptions(data, latestByLang, TIMEDTEXT_EVENT);
      }
    });
  },
});

function installXhrHook(latestByLang: Map<string, string>, evName: string): void {
  const proto = XMLHttpRequest.prototype;
  const origOpen = proto.open;
  const origSend = proto.send;

  type AnyFn = (...a: unknown[]) => unknown;

  proto.open = function (this: XMLHttpRequest, ...args: unknown[]) {
    (this as unknown as { __capyUrl?: string }).__capyUrl = String(args[1] ?? "");
    return (origOpen as unknown as AnyFn).apply(this, args);
  };

  proto.send = function (this: XMLHttpRequest, ...args: unknown[]) {
    const url = (this as unknown as { __capyUrl?: string }).__capyUrl ?? "";
    if (url.includes("/api/timedtext") && url.includes("pot=")) {
      this.addEventListener("load", () => {
        try {
          const lang = new URL(url, location.origin).searchParams.get("lang") ?? "";
          if (lang && this.responseText) {
            latestByLang.set(lang, this.responseText);
            window.dispatchEvent(new CustomEvent(evName, { detail: { lang } }));
          }
        } catch {
          /* bỏ qua */
        }
      });
    }
    return (origSend as unknown as AnyFn).apply(this, args);
  };
}

interface PlayerResponseCaptions {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrackLike[];
    };
  };
}

interface YtPlayer {
  getOption?: (module: string, option: string) => unknown;
  setOption?: (module: string, option: string, value: unknown) => void;
  loadModule?: (module: string) => void;
  getPlayerResponse?: () => PlayerResponseCaptions | undefined;
}

/**
 * `getOption("captions","tracklist")` không đáng tin (thường trả [] nếu CC
 * chưa từng được bật thủ công, kể cả sau loadModule). `getPlayerResponse()`
 * trả captionTracks ngay lập tức, đọc từ dữ liệu video — dùng làm nguồn
 * chính, chỉ fallback sang tracklist API nếu vì lý do gì đó thiếu.
 */
function readTracklist(player: YtPlayer): CaptionTrackLike[] {
  const fromResponse =
    player.getPlayerResponse?.()?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (fromResponse && fromResponse.length > 0) return fromResponse;
  return (player.getOption?.("captions", "tracklist") as CaptionTrackLike[]) ?? [];
}

async function handleGetCaptions(
  req: GetCaptionsRequest,
  latestByLang: Map<string, string>,
  evName: string,
): Promise<void> {
  const res = await loadCaptions(req, latestByLang, evName);
  const msg: GetCaptionsResponse = { channel: CAPY_MSG, dir: "to-cs", reqId: req.reqId, ...res };
  window.postMessage(msg, "*");
}

type LoadResult =
  | { ok: true; sourceLang: GetCaptionsRequest["preferred"]; segments: ReturnType<typeof parseJson3> }
  | { ok: false; reason: "no_player" | "no_captions" | "no_matching_lang" | "fetch_failed" };

async function loadCaptions(
  req: GetCaptionsRequest,
  latestByLang: Map<string, string>,
  evName: string,
): Promise<LoadResult> {
  const player = document.getElementById("movie_player") as (HTMLElement & YtPlayer) | null;
  if (!player?.getOption || !player.setOption) return { ok: false, reason: "no_player" };

  try {
    player.loadModule?.("captions");
  } catch {
    /* ignore */
  }

  let tracklist: CaptionTrackLike[] = readTracklist(player);
  for (let attempt = 0; attempt < 5 && tracklist.length === 0; attempt++) {
    await delay(400);
    tracklist = readTracklist(player);
  }
  if (tracklist.length === 0) return { ok: false, reason: "no_captions" };

  const picked = pickTrack(tracklist, req.preferred);
  if (!picked) return { ok: false, reason: "no_matching_lang" };

  const rawLang = picked.track.languageCode ?? "";

  // Buộc player nạp lại: tắt rồi bật track → phát request timedtext có pot.
  try {
    player.setOption("captions", "track", {});
  } catch {
    /* ignore */
  }
  await delay(250);
  const waiting = waitForLang(rawLang, evName, latestByLang, 8000);
  try {
    player.setOption("captions", "track", picked.track);
  } catch {
    /* ignore */
  }

  const text = latestByLang.get(rawLang) ?? (await waiting);
  if (!text) return { ok: false, reason: "fetch_failed" };

  try {
    const segments = parseJson3(JSON.parse(text));
    if (segments.length === 0) return { ok: false, reason: "no_captions" };
    return { ok: true, sourceLang: picked.lang, segments };
  } catch {
    return { ok: false, reason: "fetch_failed" };
  }
}

function waitForLang(
  lang: string,
  evName: string,
  latestByLang: Map<string, string>,
  timeoutMs: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<{ lang: string }>).detail?.lang === lang) {
        cleanup();
        resolve(latestByLang.get(lang) ?? null);
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve(latestByLang.get(lang) ?? null);
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener(evName, handler);
    }
    window.addEventListener(evName, handler);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
