import { defineConfig } from "wxt";

// WXT lo manifest V3, hot-reload, cross-browser.
//
// Publish (M8): đặt WXT_WEB_ORIGIN = domain backend thật khi build production, vd
//   WXT_WEB_ORIGIN=https://capy.app WXT_API_BASE_URL=https://capy.app npm run build:ext
// Bản production KHÔNG kèm localhost (permission tối thiểu để qua review Store).
const WEB_ORIGIN = process.env.WXT_WEB_ORIGIN?.trim();
// WXT/Vite đặt NODE_ENV=production khi build. Bản production bỏ localhost.
const isProd = process.env.NODE_ENV === "production";

const hostPermissions = ["*://*.youtube.com/*"];
if (!isProd) hostPermissions.push("http://localhost/*");
if (WEB_ORIGIN) hostPermissions.push(`${WEB_ORIGIN}/*`);

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
    name: "Capy",
    description: "Đọc slide trong cuộc họp cho người khiếm thị qua screen reader, và dịch phụ đề YouTube Anh–Việt.",
    // Permission tối thiểu. host_permissions chỉ YouTube + backend.
    permissions: ["activeTab", "storage", "scripting"],
    // Phím tắt đọc slide. Người dùng đổi được ở chrome://extensions/shortcuts.
    commands: {
      describe: { suggested_key: { default: "Alt+Shift+S" }, description: "Đọc slide đang chiếu" },
      "toggle-auto": { suggested_key: { default: "Alt+Shift+A" }, description: "Bật/tắt tự động đọc khi đổi slide" },
      repeat: { suggested_key: { default: "Alt+Shift+R" }, description: "Đọc lại slide vừa rồi" },
    },
    host_permissions: hostPermissions,
    icons: {
      16: "icon-16.png",
      32: "icon-32.png",
      48: "icon-48.png",
      128: "icon-128.png",
    },
    action: {
      default_title: "Capy",
      default_popup: "popup.html",
      default_icon: {
        16: "icon-16.png",
        32: "icon-32.png",
        48: "icon-48.png",
      },
    },
    // Content script chèn <img> logo vào trang YouTube → phải khai báo
    // web-accessible, nếu không Chrome chặn request chrome-extension://.
    web_accessible_resources: [
      {
        resources: ["icon-32.png", "icon-48.png", "logo.png"],
        matches: ["*://*.youtube.com/*"],
      },
    ],
  },
});
