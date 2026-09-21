Capy – dịch phụ đề YouTube (đang ẩn). Không nằm trong `entrypoints/` nên WXT không build.
Bật lại: chuyển `capysub/entrypoints/*` về `entrypoints/`, thêm lại host `*://*.youtube.com/*` và `web_accessible_resources` trong `wxt.config.ts`. Cần backend Capy (Supabase, /api/translate).
