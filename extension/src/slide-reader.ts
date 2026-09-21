import { browser } from "wxt/browser";
import { API_BASE } from "./config";

// Chụp tab (Meet/Zoom/Teams web, Google Slides...), gửi Claude mô tả slide,
// rồi đưa nguyên câu vào vùng aria-live để screen reader của người dùng đọc.
// Không tự làm TTS, không stream (CLAUDE.md).

const AUTO_INTERVAL_MS = 5000;
// ponytail: so ảnh 32x18 xám, ngưỡng cố định. Webcam lớn / video chạy có thể
// kích hoạt nhầm → server còn lọc lần hai bằng "KHÔNG_ĐỔI". Chỉnh số này nếu cần.
const CHANGE_THRESHOLD = 6;

type TabState = { timer?: ReturnType<typeof setInterval>; thumb?: Uint8ClampedArray; last?: string; busy?: boolean };
const tabs = new Map<number, TabState>();
const state = (id: number) => tabs.get(id) ?? tabs.set(id, {}).get(id)!;

export async function describeNow(tabId: number, windowId: number) {
  const s = state(tabId);
  await announce(tabId, "Đang đọc slide…");
  await run(tabId, windowId, s, true);
}

export function repeatLast(tabId: number) {
  return announce(tabId, state(tabId).last ?? "Chưa có slide nào được đọc.");
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

browser.tabs.onRemoved.addListener((id) => {
  clearInterval(tabs.get(id)?.timer);
  tabs.delete(id);
});

async function run(tabId: number, windowId: number, s: TabState, force: boolean) {
  if (s.busy) return;
  s.busy = true;
  try {
    const tab = await browser.tabs.get(tabId);
    if (!tab.active) return; // captureVisibleTab chỉ chụp được tab đang hiện
    const image = await browser.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 70 });
    const thumb = await thumbnail(image);
    const changed = !s.thumb || diff(s.thumb, thumb) > CHANGE_THRESHOLD;
    s.thumb = thumb;
    if (!force && !changed) return;

    const res = await fetch(`${API_BASE}/api/slide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, previous: force ? undefined : s.last }),
    });
    const { text, error } = (await res.json()) as { text?: string; error?: string };
    if (!res.ok || !text) throw new Error(error);
    if (text === "KHÔNG_ĐỔI") return;
    s.last = text;
    await announce(tabId, text);
  } catch (e) {
    if (force) await announce(tabId, `Không đọc được slide. ${(e as Error).message ?? ""}`.trim());
    else console.warn("[slide-reader]", e);
  } finally {
    s.busy = false;
  }
}

async function thumbnail(dataUrl: string) {
  const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
  const c = new OffscreenCanvas(32, 18);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, 32, 18);
  return ctx.getImageData(0, 0, 32, 18).data;
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
