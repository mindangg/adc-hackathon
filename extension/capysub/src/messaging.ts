/**
 * Lệnh từ popup → content script. Không kèm targetLang/displayMode nữa —
 * content script tự đọc CaptionSettings (đồng bộ qua storage) khi dịch.
 */
export interface TranslateCommand {
  type: "capy:translate";
}

export interface StopCommand {
  type: "capy:stop";
}

export type PopupToContent = TranslateCommand | StopCommand;

/** Trạng thái content script → popup (phản hồi cho lệnh). */
export interface StatusResponse {
  type: "capy:status";
  state:
    | "idle"
    | "loading"
    | "translating"
    | "done"
    | "error"
    | "unsupported"
    | "unauthorized"
    | "paywall";
  message?: string;
  /** số segment đã dịch / tổng (nếu biết). */
  progress?: { done: number; total: number; translatedMinutes?: number };
}
