import { defineBackground } from "wxt/utils/define-background";
import { browser } from "wxt/browser";
import { ask, describeImage, describeNow, isAuto, readDetail, toggleAuto } from "../src/slide-reader";

export type SlideMessage =
  | { type: "describe" | "detail" | "toggle-auto" | "status" | "open-history"; tabId: number; windowId: number }
  | { type: "ask"; tabId: number; windowId: number; question: string };

function handle(m: SlideMessage) {
  if (m.type === "describe") return describeNow(m.tabId, m.windowId);
  if (m.type === "detail") return readDetail(m.tabId);
  if (m.type === "toggle-auto") return toggleAuto(m.tabId, m.windowId);
  if (m.type === "status") return Promise.resolve(isAuto(m.tabId));
  if (m.type === "ask") return ask(m.tabId, m.windowId, m.question);
  if (m.type === "open-history") return browser.tabs.create({ url: browser.runtime.getURL("/history.html") });
}

export default defineBackground(() => {
  // Menu chuột phải / phím Menu trên ảnh (ảnh, GIF trong chat Meet/Teams/Slack).
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({ id: "describe-image", title: "Capy: Mô tả ảnh này", contexts: ["image"] });
  });
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "describe-image" && tab?.id != null && info.srcUrl) {
      void describeImage(tab.id, tab.windowId, info.srcUrl);
    }
  });

  // Phím tắt (wxt.config.ts). Gọi phím tắt cũng cấp activeTab để chụp tab.
  browser.commands.onCommand.addListener(async (command) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) void handle({ type: command, tabId: tab.id, windowId: tab.windowId } as SlideMessage);
  });

  browser.runtime.onMessage.addListener((raw: unknown) => {
    const m = raw as SlideMessage;
    const p = handle(m);
    // describe/detail đọc trên trang (popup đóng ngay); chỉ các lệnh cần kết quả mới trả lời.
    return m.type === "toggle-auto" || m.type === "status" || m.type === "ask" ? p : undefined;
  });
});
