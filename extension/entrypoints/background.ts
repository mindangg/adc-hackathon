import { defineBackground } from "wxt/utils/define-background";
import { browser } from "wxt/browser";
import type { Runtime } from "webextension-polyfill";
import { describeNow, isAuto, repeatLast, toggleAuto } from "../src/slide-reader";

type BgMessage =
  | { type: "capy:open-popup" }
  | { type: "slide:describe" | "slide:toggle-auto" | "slide:repeat" | "slide:status"; tabId: number; windowId: number };

type ActionWithOpenPopup = typeof browser.action & {
  openPopup?: (options?: { windowId?: number }) => Promise<void>;
};

function slide(type: string, tabId: number, windowId: number) {
  if (type === "slide:describe") return describeNow(tabId, windowId);
  if (type === "slide:toggle-auto") return toggleAuto(tabId, windowId);
  if (type === "slide:repeat") return repeatLast(tabId);
  if (type === "slide:status") return Promise.resolve(isAuto(tabId));
}

export default defineBackground(() => {
  // Phím tắt (khai báo trong wxt.config.ts). Gọi phím tắt cũng cấp activeTab để chụp tab.
  browser.commands.onCommand.addListener(async (command) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) void slide(`slide:${command}`, tab.id, tab.windowId!);
  });

  browser.runtime.onMessage.addListener((raw: unknown, sender: Runtime.MessageSender) => {
    const msg = raw as BgMessage;
    if (msg?.type?.startsWith("slide:")) {
      const m = msg as Extract<BgMessage, { tabId: number }>;
      const p = slide(m.type, m.tabId, m.windowId);
      // describe/repeat chạy nền (popup đóng ngay); chỉ toggle/status cần trả lời.
      return m.type === "slide:toggle-auto" || m.type === "slide:status" ? p : undefined;
    }
    if (msg?.type !== "capy:open-popup") return;

    const action = browser.action as ActionWithOpenPopup;
    if (!action.openPopup) return;

    const options = sender.tab?.windowId ? { windowId: sender.tab.windowId } : undefined;
    void action.openPopup(options).catch(() => {
      // Chrome only allows opening the action popup from supported user gestures.
    });
  });
});
