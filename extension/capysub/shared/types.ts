/** Ngôn ngữ hỗ trợ ở MVP (chỉ En↔Vi). */
export type Lang = "en" | "vi";

/**
 * Một dòng caption từ YouTube.
 * `start` và `dur` tính bằng GIÂY (khớp với video.currentTime).
 */
export interface Segment {
  start: number;
  dur: number;
  text: string;
}

/**
 * Segment đã dịch: `text` là bản dịch, `original` giữ lại bản gốc để hiển thị
 * chế độ song song (dual).
 */
export interface TranslatedSegment extends Segment {
  original: string;
}

/** Metadata ngắn giúp model suy luận đúng lĩnh vực và giọng điệu của video. */
export interface VideoContext {
  title?: string;
  channel?: string;
  description?: string;
  /** Một mẫu caption đầu video; chỉ dùng làm ngữ cảnh, không dịch trực tiếp. */
  captionSample?: string[];
}

/** Brief dịch dùng chung cho mọi chunk của cùng một video. */
export interface VideoProfile {
  topic: string;
  tone: string;
  audience: string;
  glossary: Array<{
    source: string;
    target: string;
  }>;
}

/** Body gửi lên POST /api/translate. */
export interface TranslateRequest {
  videoId: string;
  sourceLang: Lang;
  targetLang: Lang;
  segments: Segment[];
  /** Ngữ cảnh nằm ngoài chunk hiện tại, không tính quota và không dịch. */
  contextBefore?: string[];
  contextAfter?: string[];
  videoContext?: VideoContext;
  /** Chunk cần dịch trên lưới `CHUNK_SECONDS`. */
  chunkIndex: number;
}

/**
 * Message trong stream trả về (NDJSON — mỗi dòng một JSON object).
 * Cho phép hiển thị dần khi dịch xong từng batch (UX mượt).
 */
export type TranslateStreamMessage =
  | { type: "batch"; startIndex: number; segments: TranslatedSegment[] }
  | { type: "done"; total: number }
  | { type: "error"; message: string };

// ── Auth (M3) ──────────────────────────────────────────────────

/** Người dùng đã xác thực (rút gọn từ Supabase Auth user). */
export interface AuthUser {
  id: string;
  email: string | null;
}

/**
 * Session Supabase mà extension lưu lại (chrome.storage) và gắn vào request.
 * `expiresAt` là epoch GIÂY (khớp field `expires_at` của Supabase).
 */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

/** Loại gói. M3 mới có 'trial'; M4 điền 'paid'/'expired' theo bảng users. */
export type PlanType = "trial" | "paid" | "expired";

/**
 * Trạng thái tài khoản trả cho extension (GET /api/me).
 * M3: giá trị quota là PLACEHOLDER (chưa có bảng users) — M4 điền số thật.
 */
export interface MeResponse {
  userId: string;
  email: string | null;
  planType: PlanType;
  trialMinutesUsed: number;
  trialMinutesCap: number;
  quotaMinutesTotal: number;
  quotaMinutesUsed: number;
  planExpiresAt: string | null;
}

// ── Payment (M5) ───────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "canceled" | "expired";

/** Trả về của POST /api/order/create — đủ để client hiện QR + hướng dẫn CK. */
export interface CreateOrderResponse {
  orderId: string;
  planCode: import("./plans").PlanCode;
  amount: number;
  /** Nội dung chuyển khoản DUY NHẤT để webhook khớp đúng order. */
  transferContent: string;
  qrUrl: string;
  bankAccount: string | null;
  bankName: string | null;
}

/** Trả về của GET /api/order/status — client poll tới khi 'paid'. */
export interface OrderStatusResponse {
  orderId: string;
  status: OrderStatus;
}

/** Một dòng lịch sử đơn hàng (GET /api/orders). */
export interface OrderSummary {
  id: string;
  planCode: import("./plans").PlanCode;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
}
