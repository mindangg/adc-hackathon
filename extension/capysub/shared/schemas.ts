import { z } from "zod";

/** Ngôn ngữ hợp lệ. */
export const langSchema = z.enum(["en", "vi"]);

/** Một segment caption. */
export const segmentSchema = z.object({
  start: z.number().nonnegative(),
  dur: z.number().nonnegative(),
  text: z.string(),
});

const contextLineSchema = z.string().trim().min(1).max(500);

export const videoContextSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  channel: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  captionSample: z.array(contextLineSchema).max(60).optional(),
});

/**
 * Body của POST /api/translate. Giới hạn số segment/độ dài để chống payload
 * lạm dụng (một video dài chia nhiều request phía client nếu cần).
 */
export const translateRequestSchema = z.object({
  videoId: z.string().min(1).max(32),
  sourceLang: langSchema,
  targetLang: langSchema,
  segments: z.array(segmentSchema).min(1).max(2000),
  contextBefore: z.array(contextLineSchema).max(12).optional(),
  contextAfter: z.array(contextLineSchema).max(12).optional(),
  videoContext: videoContextSchema.optional(),
  /**
   * Lazy windowed translation: mỗi request dịch đúng 1 chunk trên lưới cố định
   * `CHUNK_SECONDS`; `segments` phải là đúng các dòng của chunk đó. Cache +
   * quota + replay tính theo (video, lang, chunkIndex).
   */
  chunkIndex: z.number().int().nonnegative(),
});

export type TranslateRequestInput = z.infer<typeof translateRequestSchema>;

/** Body của POST /api/auth/refresh — đổi refresh_token lấy session mới. */
export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshRequestInput = z.infer<typeof refreshRequestSchema>;

/**
 * Session mà login page gửi qua postMessage cho extension bridge.
 * Validate trước khi lưu để không nhận rác từ trang.
 */
export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.number().positive(),
  user: z.object({
    id: z.string().min(1),
    email: z.string().email().nullable(),
  }),
});

// ── Payment (M5) ───────────────────────────────────────────────

export const planCodeSchema = z.enum(["week", "month", "quarter"]);

/** Body của POST /api/order/create. */
export const createOrderSchema = z.object({
  planCode: planCodeSchema,
});

/**
 * Payload webhook SePay (chỉ các field ta dùng; cho phép field lạ đi qua).
 * `transferAmount` số tiền, `transferType` in/out, `content` nội dung CK,
 * `id` mã giao dịch SePay (dùng làm khoá idempotency).
 * Nguồn: docs.sepay.vn/lap-trinh-webhooks.html
 */
export const sepayWebhookSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    transferType: z.string(),
    transferAmount: z.number(),
    content: z.string().optional().default(""),
    referenceCode: z.string().optional(),
    gateway: z.string().optional(),
    accountNumber: z.string().optional(),
  })
  .passthrough();

export type SepayWebhookPayload = z.infer<typeof sepayWebhookSchema>;
