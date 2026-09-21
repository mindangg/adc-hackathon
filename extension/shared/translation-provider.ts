import type { Lang, VideoContext, VideoProfile } from "./types";

/** Dòng dịch có ID ổn định trong request; model không được tự tạo hoặc đổi ID. */
export interface TranslationLine {
  id: string;
  text: string;
}

export interface TranslatedLine {
  id: string;
  translation: string;
}

export interface TranslateBatchParams {
  sourceLang: Lang;
  targetLang: Lang;
  /** Các dòng caption gốc trong một batch (10–20 dòng). */
  lines: TranslationLine[];
  /** Dòng ngay trước batch, chỉ để hiểu ngữ cảnh; không dịch/trả về. */
  contextBefore?: string[];
  /** Dòng ngay sau batch, chỉ để hiểu ngữ cảnh; không dịch/trả về. */
  contextAfter?: string[];
  videoContext?: VideoContext;
  videoProfile?: VideoProfile;
}

export interface CreateVideoProfileParams {
  sourceLang: Lang;
  targetLang: Lang;
  videoContext: VideoContext;
}

/**
 * Adapter cho engine dịch. Tách interface để đổi model/provider mà không
 * đụng vào business logic. Caller luôn validate ID; không được tin thứ tự mảng.
 */
export interface TranslationProvider {
  readonly name: string;
  /** Định danh provider/model để cache không phát lại output của model cũ. */
  readonly cacheKey: string;
  translateBatch(params: TranslateBatchParams): Promise<TranslatedLine[]>;
  createVideoProfile?(params: CreateVideoProfileParams): Promise<VideoProfile>;
}

/** Kích thước batch mặc định (dòng/request) — cân bằng chi phí và ngữ cảnh. */
export const DEFAULT_BATCH_SIZE = 15;

/** Chia mảng thành các batch kích thước cố định. */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) throw new Error("batch size must be > 0");
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
