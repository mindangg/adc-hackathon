import type { Lang, Segment } from "@/shared";

/**
 * Tiện ích timedtext dùng chung cho cả 2 world (isolated + MAIN).
 * parseJson3: chuyển json3 → Segment[]. pickTrack: chọn track phù hợp.
 *
 * LƯU Ý (đã kiểm chứng live 2026-07): YouTube đòi token `pot` (proof-of-origin)
 * trên request timedtext — baseUrl trích từ HTML/playerResponse KHÔNG có pot nên
 * trả rỗng. Chỉ request do chính player phát ra (khi bật CC) mới có pot hợp lệ.
 * Vì vậy caption được lấy bằng cách hook XHR ở MAIN world (xem yt-capture).
 */

export interface CaptionTrackLike {
  languageCode?: string;
  kind?: string; // "asr" nếu auto-generated
  baseUrl?: string;
}

interface Json3Event {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: { utf8?: string }[];
}

const NON_SPEECH_CAPTION_RE =
  /^(?:[\s♪♫♬♩]*|\[(?:music|applause|laughter|laughs|silence|sound|noise|cheering|clapping|instrumental|foreign language|speaking foreign language)\][\s♪♫♬♩]*)$/i;

function hasSpeechText(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return false;
  if (NON_SPEECH_CAPTION_RE.test(normalized)) return false;
  return /[\p{L}\p{N}]/u.test(normalized);
}

/** Map language code YouTube → Lang MVP. null nếu không hỗ trợ. */
export function toLang(code: string | undefined): Lang | null {
  if (!code) return null;
  const base = code.toLowerCase().split("-")[0];
  if (base === "en") return "en";
  if (base === "vi") return "vi";
  return null;
}

/** Parse timedtext json3 → Segment[] (giây). */
export function parseJson3(data: unknown): Segment[] {
  const events = (data as { events?: Json3Event[] })?.events ?? [];
  const out: Segment[] = [];
  for (const ev of events) {
    if (!ev.segs || ev.tStartMs == null) continue;
    const text = ev.segs
      .map((s) => s.utf8 ?? "")
      .join("")
      .replace(/\n/g, " ")
      .trim();
    if (!hasSpeechText(text)) continue;
    out.push({
      start: ev.tStartMs / 1000,
      dur: (ev.dDurationMs ?? 0) / 1000,
      text,
    });
  }
  return out;
}

export interface PickedTrack {
  track: CaptionTrackLike;
  lang: Lang;
}

/**
 * Chọn track: ưu tiên đúng ngôn ngữ mong muốn, ưu tiên track người upload
 * (không ASR) hơn ASR. Bỏ qua ngôn ngữ ngoài En/Vi.
 */
export function pickTrack(
  tracks: CaptionTrackLike[],
  preferred: Lang,
): PickedTrack | null {
  const mapped = tracks
    .map((track): PickedTrack | null => {
      const lang = toLang(track.languageCode);
      return lang ? { track, lang } : null;
    })
    .filter((t): t is PickedTrack => t !== null);

  if (mapped.length === 0) return null;

  const sorted = [...mapped].sort((a, b) => {
    if (a.lang === preferred && b.lang !== preferred) return -1;
    if (b.lang === preferred && a.lang !== preferred) return 1;
    const aAsr = a.track.kind === "asr";
    const bAsr = b.track.kind === "asr";
    if (aAsr !== bAsr) return aAsr ? 1 : -1;
    return 0;
  });

  return sorted[0] ?? null;
}
