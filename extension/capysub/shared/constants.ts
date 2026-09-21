/** Số phút dịch miễn phí cho tài khoản mới (dùng thử). Hết → paywall. */
export const TRIAL_MINUTES_CAP = 10;

/** Version prompt/cache cho bản dịch. Đổi version để bỏ qua cache chất lượng cũ. */
export const TRANSLATION_PROMPT_VERSION = "v3";

/** Version cách tạo brief video; bump khi đổi schema/logic suy luận domain. */
export const VIDEO_PROFILE_VERSION = "v1";

/** Số caption ngoài batch/chunk gửi làm ngữ cảnh ở mỗi phía. */
export const TRANSLATION_CONTEXT_LINES = 6;

/**
 * Lazy windowed translation (M6): video dài (1–4h) được băm thành các "chunk"
 * cố định theo LƯỚI thời gian, mỗi chunk = CHUNK_SECONDS giây. Segment thuộc chunk
 * `floor(start / CHUNK_SECONDS)`. Vì lưới xác định (deterministic), MỌI client đều
 * xin chunk 0,1,2… với biên y hệt nhau → cache dùng chung trùng khớp 100% (không
 * vỡ mô hình chi phí như khi mỗi client tự chọn cửa sổ theo currentTime của mình).
 */
export const CHUNK_SECONDS = 120; // 2 phút/chunk — giảm phần dịch dư khi user rời video sớm.

/** Dịch trước bao nhiêu giây so với playhead (buffer để không giật khi phát tới). */
export const PREFETCH_AHEAD_SECONDS = 45;

/** Chờ user tua xong (ngừng seek) bao lâu mới xin chunk ở vị trí mới. */
export const SEEK_DEBOUNCE_MS = 800;

/** Chunk index của một mốc thời gian (giây). Thuần → dễ test, dùng chung client/server. */
export function chunkIndexOf(startSeconds: number): number {
  return Math.max(0, Math.floor(startSeconds / CHUNK_SECONDS));
}
