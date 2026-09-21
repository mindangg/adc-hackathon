import { browser } from "wxt/browser";
import type { Lang } from "@/shared";

const STORAGE_KEY = "capy:settings";

export type BoxPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface CaptionStyle {
  /** Hệ số nhân cỡ chữ, 1.0 = mặc định. */
  size: number;
  weight: number;
  color: string;
}

export interface CaptionBoxStyle {
  position: BoxPosition;
  /** Mã màu nền, hoặc "transparent" (không nền). */
  background: string;
  /** Độ đục nền khung, 0-100. */
  opacity: number;
  borderRadius: number;
  padding: number;
  /** % lề hai bên player. */
  horizontalMargin: number;
}

export interface CaptionSettings {
  targetLang: Lang;
  showCaptions: boolean;
  showOriginalCaptions: boolean;
  original: CaptionStyle;
  translated: CaptionStyle;
  box: CaptionBoxStyle;
}

export const DEFAULT_TRANSLATED_COLOR = "#3ea6ff";
export const ORIGINAL_COLORS = ["#ffffff", "#9e9e9e", "#ffd54f", "#4dd0e1", "#aed581", "#f48fb1"];
export const TRANSLATED_COLORS = [DEFAULT_TRANSLATED_COLOR, "#2979ff", "#ffffff", "#ffd54f", "#4dd0e1", "#aed581", "#f48fb1"];
export const BOX_BACKGROUNDS = ["#000000", "#333333", "#666666", "#152047", "transparent"];

export const DEFAULT_SETTINGS: CaptionSettings = {
  targetLang: "vi",
  showCaptions: true,
  showOriginalCaptions: true,
  original: { size: 1.0, weight: 400, color: ORIGINAL_COLORS[0]! },
  translated: { size: 1.0, weight: 500, color: DEFAULT_TRANSLATED_COLOR },
  box: {
    position: "bottom-center",
    background: BOX_BACKGROUNDS[0]!,
    opacity: 90,
    borderRadius: 10,
    padding: 8,
    horizontalMargin: 10,
  },
};

function merge(saved: Partial<CaptionSettings> | undefined): CaptionSettings {
  if (!saved) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    original: { ...DEFAULT_SETTINGS.original, ...saved.original },
    translated: { ...DEFAULT_SETTINGS.translated, ...saved.translated },
    box: { ...DEFAULT_SETTINGS.box, ...saved.box },
  };
}

export async function loadSettings(): Promise<CaptionSettings> {
  const obj = await browser.storage.local.get(STORAGE_KEY);
  return merge(obj[STORAGE_KEY] as Partial<CaptionSettings> | undefined);
}

export async function saveSettings(settings: CaptionSettings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
}

/** Theo dõi thay đổi settings (đồng bộ popup <-> content script đang chạy). */
export function onSettingsChange(cb: (settings: CaptionSettings) => void): () => void {
  const listener = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area === "local" && STORAGE_KEY in changes) {
      cb(merge(changes[STORAGE_KEY]?.newValue as Partial<CaptionSettings> | undefined));
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
