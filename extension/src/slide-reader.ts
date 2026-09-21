import { browser } from "wxt/browser";
import { API_BASE } from "./config";

// Chụp vùng đang chia sẻ màn hình trong tab họp (Meet...), gửi server mô tả,
// rồi đưa nguyên câu vào vùng aria-live để screen reader của người dùng đọc.
// Không tự làm TTS, không stream (CLAUDE.md).

const AUTO_INTERVAL_MS = 5000;
// ponytail: so ảnh 32x18 xám, ngưỡng cố định. Server còn lọc lần hai (changed=false).
// Đọc nhầm/lỡ slide thì chỉnh số này.
const CHANGE_THRESHOLD = 6;
// Khung video lớn nhất phải chiếm ít nhất ngần này diện tích tab mới coi là màn hình chia sẻ.
const MIN_SHARE_AREA = 0.2;

type Slide = { summary: string; detail: string };

/** Lịch sử (chỉ chữ, không ảnh) trong storage.session: chỉ nằm trong RAM, mất khi đóng trình duyệt. */
export type HistoryEntry = {
  kind: "slide" | "question" | "image";
  time: number;
  page: string;
  summary: string; // slide: tóm tắt · question: câu hỏi · image: mô tả
  detail: string; // slide: chi tiết · question: câu trả lời
};

async function record(tabId: number, e: Omit<HistoryEntry, "time" | "page">) {
  const page = (await browser.tabs.get(tabId).catch(() => null))?.title ?? "";
  const { history = [] } = (await browser.storage.session.get("history")) as { history?: HistoryEntry[] };
  await browser.storage.session.set({ history: [...history, { ...e, time: Date.now(), page }] });
}

type TabState = { timer?: ReturnType<typeof setInterval>; thumb?: Uint8ClampedArray; last?: Slide; busy?: boolean };
const tabs = new Map<number, TabState>();
const state = (id: number) => tabs.get(id) ?? tabs.set(id, {}).get(id)!;

browser.tabs.onRemoved.addListener((id) => {
  clearInterval(tabs.get(id)?.timer);
  tabs.delete(id);
});

export async function describeNow(tabId: number, windowId: number) {
  await announce(tabId, "Đang đọc slide…");
  await run(tabId, windowId, state(tabId), true);
}

export function readDetail(tabId: number) {
  const last = state(tabId).last;
  return announce(tabId, !last ? "Chưa có slide nào được đọc." : last.detail || last.summary);
}

export function isAuto(tabId: number) {
  return Boolean(tabs.get(tabId)?.timer);
}

export async function toggleAuto(tabId: number, windowId: number) {
  const s = state(tabId);
  if (s.timer) {
    clearInterval(s.timer);
    s.timer = undefined;
    await announce(tabId, "Đã tắt tự động đọc slide.");
    return false;
  }
  s.thumb = undefined;
  // Mỗi lần gọi captureVisibleTab cũng giữ service worker sống.
  s.timer = setInterval(() => void run(tabId, windowId, s, false), AUTO_INTERVAL_MS);
  await announce(tabId, "Đã bật tự động đọc khi slide thay đổi.");
  return true;
}

/** Hỏi về slide đang chiếu. Trả câu trả lời để popup hiển thị/đọc. */
export async function ask(tabId: number, windowId: number, question: string): Promise<string> {
  try {
    const { image } = await capture(tabId, windowId);
    const res = await post({ image, question });
    if (!res.answer) return res.error ?? "Không trả lời được, thử lại nhé.";
    await record(tabId, { kind: "question", summary: question, detail: res.answer });
    return res.answer;
  } catch (e) {
    return `Không đọc được slide. ${(e as Error).message ?? ""}`.trim();
  }
}

/** Mô tả một ảnh/GIF trên trang (menu chuột phải → "Mô tả ảnh này"), đọc qua screen reader. */
export async function describeImage(tabId: number, windowId: number, src: string) {
  try {
    await announce(tabId, "Đang mô tả ảnh…");
    const { image } = await capture(tabId, windowId, src);
    const res = await post({ image, mode: "image" });
    if (!res.answer) throw new Error(res.error);
    await announce(tabId, res.answer);
    await record(tabId, { kind: "image", summary: res.answer, detail: "" });
  } catch (e) {
    await announce(tabId, `Không mô tả được ảnh. ${(e as Error).message ?? ""}`.trim());
  }
}

async function run(tabId: number, windowId: number, s: TabState, force: boolean) {
  if (s.busy) return;
  s.busy = true;
  try {
    const tab = await browser.tabs.get(tabId);
    if (!tab.active) return; // captureVisibleTab chỉ chụp được tab đang hiện
    const { image, thumb } = await capture(tabId, windowId);
    const changed = !s.thumb || diff(s.thumb, thumb) > CHANGE_THRESHOLD;
    s.thumb = thumb;
    if (!force && !changed) return;

    const res = await post({ image, previous: force ? undefined : s.last });
    if (res.error) throw new Error(res.error);
    if (res.changed === false || !res.summary) {
      if (force) await announce(tabId, s.last?.summary ?? "Không có gì mới.");
      return;
    }
    s.last = { summary: res.summary, detail: res.detail ?? "" };
    await announce(tabId, res.summary);
    await record(tabId, { kind: "slide", ...s.last });
  } catch (e) {
    if (force) await announce(tabId, `Không đọc được slide. ${(e as Error).message ?? ""}`.trim());
    else console.warn("[slide-reader]", e);
  } finally {
    s.busy = false;
  }
}

type ApiRes = { changed?: boolean; summary?: string; detail?: string; answer?: string; error?: string };

async function post(body: object): Promise<ApiRes> {
  const res = await fetch(`${API_BASE}/api/slide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * Chụp tab rồi cắt theo khung video/canvas lớn nhất (màn hình đang chia sẻ; Zoom web vẽ lên canvas).
 * Không thấy khung nào đủ lớn (vd. đang mở thẳng Google Slides) → dùng cả tab.
 * Có imgSrc → cắt đúng ảnh đó (ảnh trong chat).
 * Cắt để đọc chính xác hơn và không gửi mặt đồng nghiệp đi.
 */
async function capture(tabId: number, windowId: number, imgSrc?: string) {
  const [{ result: rect }] = await browser.scripting.executeScript({
    target: { tabId },
    args: [MIN_SHARE_AREA, imgSrc ?? null],
    func: async (minArea: number, src: string | null) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const clip = (el: Element) => {
        const r = el.getBoundingClientRect();
        const x = Math.max(0, r.left);
        const y = Math.max(0, r.top);
        return { x, y, w: Math.min(vw, r.right) - x, h: Math.min(vh, r.bottom) - y, vw };
      };
      if (src) {
        const img = [...document.images].find((i) => i.currentSrc === src || i.src === src);
        if (!img) return null;
        img.scrollIntoView({ block: "center" });
        await new Promise((r) => setTimeout(r, 150)); // chờ cuộn xong mới chụp
        return clip(img);
      }
      let best: ReturnType<typeof clip> | null = null;
      for (const el of document.querySelectorAll("video, canvas")) {
        const c = clip(el);
        if (c.w > 0 && c.h > 0 && (!best || c.w * c.h > best.w * best.h)) best = c;
      }
      return best && (best.w * best.h) / (vw * vh) >= minArea ? best : null;
    },
  });
  if (imgSrc && !rect) throw new Error("Không tìm thấy ảnh trên trang.");
  const shot = await browser.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 85 });

  const bmp = await createImageBitmap(await (await fetch(shot)).blob());
  const k = rect ? bmp.width / rect.vw : 1; // CSS px → pixel ảnh (DPR, zoom)
  const [sx, sy, sw, sh] = rect
    ? [rect.x * k, rect.y * k, rect.w * k, rect.h * k]
    : [0, 0, bmp.width, bmp.height];

  const crop = new OffscreenCanvas(Math.round(sw), Math.round(sh));
  crop.getContext("2d")!.drawImage(bmp, sx, sy, sw, sh, 0, 0, crop.width, crop.height);
  const small = new OffscreenCanvas(32, 18);
  const ctx = small.getContext("2d")!;
  ctx.drawImage(crop, 0, 0, 32, 18);

  const blob = await crop.convertToBlob({ type: "image/jpeg", quality: 0.85 });
  return { image: await toDataUrl(blob), thumb: ctx.getImageData(0, 0, 32, 18).data };
}

async function toDataUrl(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${blob.type};base64,${btoa(bin)}`;
}

/** Chênh lệch trung bình (0–255) giữa hai ảnh RGBA cùng kích thước. */
export function diff(a: Uint8ClampedArray, b: Uint8ClampedArray) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 4) {
    sum += Math.abs(a[i] + a[i + 1] + a[i + 2] - b[i] - b[i + 1] - b[i + 2]) / 3;
  }
  return sum / (a.length / 4);
}

/** Đặt cả câu vào một vùng role=status trên trang → screen reader đọc. */
function announce(tabId: number, text: string) {
  return browser.scripting
    .executeScript({
      target: { tabId },
      args: [text],
      func: (msg: string) => {
        let el = document.getElementById("capy-slide-live");
        if (!el) {
          el = document.createElement("div");
          el.id = "capy-slide-live";
          el.setAttribute("role", "status");
          el.setAttribute("aria-live", "polite");
          el.style.cssText =
            "position:fixed;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
          document.body.append(el);
        }
        // Xoá rồi đặt lại để screen reader đọc cả khi câu giống lần trước.
        el.textContent = "";
        setTimeout(() => (el!.textContent = msg), 100);
      },
    })
    .catch((e) => console.warn("[slide-reader] announce", e));
}
