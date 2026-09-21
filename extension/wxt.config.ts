import { defineConfig } from "wxt";

// WXT lo manifest V3, hot-reload, cross-browser.
//
// Backend thật: WXT_WEB_ORIGIN=https://x.app WXT_API_BASE_URL=https://x.app npm run build
// Không đặt → gọi backend ở localhost (demo).
const WEB_ORIGIN = process.env.WXT_WEB_ORIGIN?.trim();

// Chỉ cần quyền gọi backend; chụp tab dùng activeTab (cấp khi bấm phím tắt/popup).
const hostPermissions = [WEB_ORIGIN ? `${WEB_ORIGIN}/*` : "http://localhost/*"];

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    envPrefix: ["WXT_", "NEXT_PUBLIC_"],
  }),
  // Dev server riêng của WXT (HMR) — đổi cổng để khỏi đá nhau với Next.js
  // (apps/web cũng mặc định chạy ở 3000).
  dev: {
    server: {
      port: 3001,
    },
  },
  manifest: {
    name: "Capy – Đọc slide cuộc họp",
    description: "Đọc slide đang chia sẻ trong cuộc họp trực tuyến cho người khiếm thị, qua screen reader.",
    // Permission tối thiểu. host_permissions chỉ YouTube + backend.
    permissions: ["activeTab", "scripting", "storage", "contextMenus"],
    // Phím tắt đọc slide. Người dùng đổi được ở chrome://extensions/shortcuts.
    commands: {
      _execute_action: { suggested_key: { default: "Alt+Shift+Q" }, description: "Hỏi về slide đang chiếu" },
      describe: { suggested_key: { default: "Alt+Shift+S" }, description: "Đọc slide đang chiếu" },
      detail: { suggested_key: { default: "Alt+Shift+D" }, description: "Đọc chi tiết slide vừa rồi" },
      "toggle-auto": { suggested_key: { default: "Alt+Shift+A" }, description: "Bật/tắt tự động đọc khi đổi slide" },
      // Chrome chỉ cho gợi ý tối đa 4 phím; lệnh này người dùng tự gán ở chrome://extensions/shortcuts.
      "open-history": { description: "Mở lịch sử slide của cuộc họp" },
    },
    host_permissions: hostPermissions,
    icons: {
      16: "icon-16.png",
      32: "icon-32.png",
      48: "icon-48.png",
      128: "icon-128.png",
    },
    action: {
      default_title: "Capy – Đọc slide",
      default_popup: "popup.html",
      default_icon: {
        16: "icon-16.png",
        32: "icon-32.png",
        48: "icon-48.png",
      },
    },
  },
});
