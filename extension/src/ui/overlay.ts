import type { TranslatedSegment } from "@/shared";
import type { CaptionSettings } from "../settings";

const MAX_AUTO_LINGER_SECONDS = 0.35;
const READABLE_CHARS_PER_SECOND = 18;

function withOpacity(color: string, opacity: number): string {
  if (color === "transparent") return "transparent";
  const percent = Math.max(0, Math.min(100, opacity));
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * Overlay phụ đề: render trên player, đồng bộ theo video.currentTime.
 * Nhận segment dần (streaming) qua addSegments(). Không che video (mặc định
 * gần đáy, trên thanh điều khiển), pointer-events none để không chặn player.
 * Giao diện (cỡ chữ, màu, vị trí, nền khung...) lấy từ CaptionSettings và có
 * thể cập nhật nóng qua updateSettings() khi người dùng đổi trong popup.
 */
export class SubtitleOverlay {
  private readonly root: HTMLElement;
  private readonly box: HTMLElement;
  private readonly originalEl: HTMLElement;
  private readonly translatedEl: HTMLElement;
  private readonly video: HTMLVideoElement;
  private segments: TranslatedSegment[] = [];
  private rafId: number | null = null;
  private lastIndex = -1;
  private showOriginal = true;

  constructor(container: HTMLElement, video: HTMLVideoElement, settings: CaptionSettings) {
    this.video = video;

    this.root = document.createElement("div");
    this.root.className = "capy-subtitle-overlay";
    Object.assign(this.root.style, {
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      pointerEvents: "none",
      zIndex: "60",
      boxSizing: "border-box",
    } satisfies Partial<CSSStyleDeclaration>);

    this.box = document.createElement("div");
    Object.assign(this.box.style, {
      maxWidth: "100%",
      display: "none",
      boxSizing: "border-box",
    } satisfies Partial<CSSStyleDeclaration>);

    this.originalEl = document.createElement("div");
    this.translatedEl = document.createElement("div");
    Object.assign(this.originalEl.style, {
      whiteSpace: "pre-wrap",
      textShadow: "0 1px 2px rgba(0,0,0,0.6)",
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.translatedEl.style, {
      whiteSpace: "pre-wrap",
      textShadow: "0 1px 2px rgba(0,0,0,0.6)",
    } satisfies Partial<CSSStyleDeclaration>);

    this.box.append(this.originalEl, this.translatedEl);
    this.root.appendChild(this.box);
    container.appendChild(this.root);

    this.applySettings(settings);
    this.loop = this.loop.bind(this);
  }

  /** Đổi giao diện (vị trí, màu, cỡ chữ, nền khung...) không cần tạo lại overlay. */
  updateSettings(settings: CaptionSettings): void {
    this.applySettings(settings);
    this.lastIndex = -1;
    this.render(this.video.currentTime);
  }

  /** Thêm segment mới (đến từ stream). Giữ mảng sắp xếp theo start. */
  addSegments(incoming: TranslatedSegment[]): void {
    // Retry một chunk có thể phát lại batch đã hoàn tất trước khi lỗi. Replace
    // theo identity nguồn để overlay không tích lũy segment trùng timestamp.
    const keyOf = (segment: TranslatedSegment) =>
      `${segment.start}\u0000${segment.dur}\u0000${segment.original}`;
    const incomingKeys = new Set(incoming.map(keyOf));
    this.segments = this.segments.filter((segment) => !incomingKeys.has(keyOf(segment)));
    this.segments.push(...incoming);
    this.segments.sort((a, b) => a.start - b.start);
    this.lastIndex = -1;
  }

  start(): void {
    if (this.rafId == null) this.rafId = requestAnimationFrame(this.loop);
  }

  private loop(): void {
    this.render(this.video.currentTime);
    this.rafId = requestAnimationFrame(this.loop);
  }

  private findActiveIndex(t: number): number {
    // Segment cuối có start <= t
    let lo = 0;
    let hi = this.segments.length - 1;
    let idx = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.segments[mid]!.start <= t) {
        idx = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    if (idx === -1) return -1;

    const seg = this.segments[idx]!;
    const next = this.segments[idx + 1];
    // Kết thúc hiệu dụng: min(start+dur, start của segment kế). dur=0 -> tới next.
    const durEnd = seg.dur > 0 ? seg.start + seg.dur : Number.POSITIVE_INFINITY;
    const linger = this.computeAutoLinger(seg);
    const nextStart = next ? next.start : Number.POSITIVE_INFINITY;
    const end = Math.min(durEnd + linger, nextStart);
    return t < end ? idx : -1;
  }

  private computeAutoLinger(seg: TranslatedSegment): number {
    if (seg.dur <= 0) return 0;
    const readableSeconds = Math.max(seg.text.length, seg.original.length) / READABLE_CHARS_PER_SECOND;
    return Math.min(MAX_AUTO_LINGER_SECONDS, Math.max(0, readableSeconds - seg.dur));
  }

  private applySettings(s: CaptionSettings): void {
    const vertical = s.box.position.startsWith("top")
      ? "top"
      : s.box.position.startsWith("middle")
        ? "middle"
        : "bottom";
    const horizontal = s.box.position.endsWith("left")
      ? "left"
      : s.box.position.endsWith("right")
        ? "right"
        : "center";

    Object.assign(this.root.style, {
      left: "0",
      right: "0",
      top: vertical === "top" ? "6%" : vertical === "middle" ? "50%" : "auto",
      bottom: vertical === "bottom" ? "9%" : "auto",
      transform: vertical === "middle" ? "translateY(-50%)" : "none",
      alignItems: horizontal === "left" ? "flex-start" : horizontal === "right" ? "flex-end" : "center",
      padding: `0 ${s.box.horizontalMargin}%`,
      visibility: s.showCaptions ? "visible" : "hidden",
    } satisfies Partial<CSSStyleDeclaration>);

    Object.assign(this.box.style, {
      background: withOpacity(s.box.background, s.box.opacity),
      borderRadius: `${s.box.borderRadius}px`,
      padding: `${s.box.padding}px ${s.box.padding + 8}px`,
      textAlign: horizontal,
    } satisfies Partial<CSSStyleDeclaration>);

    Object.assign(this.originalEl.style, {
      fontSize: `${1.4 * s.original.size}vw`,
      fontWeight: String(s.original.weight),
      color: s.original.color,
      marginBottom: "2px",
    } satisfies Partial<CSSStyleDeclaration>);

    Object.assign(this.translatedEl.style, {
      fontSize: `${1.8 * s.translated.size}vw`,
      fontWeight: String(s.translated.weight),
      color: s.translated.color,
    } satisfies Partial<CSSStyleDeclaration>);

    this.showOriginal = s.showOriginalCaptions;
  }

  private render(t: number): void {
    const idx = this.findActiveIndex(t);
    if (idx === this.lastIndex) return;
    this.lastIndex = idx;

    if (idx === -1) {
      this.box.style.display = "none";
      return;
    }
    const seg = this.segments[idx]!;
    const showOriginal = this.showOriginal && !!seg.original;

    this.originalEl.style.display = showOriginal ? "block" : "none";
    this.originalEl.textContent = showOriginal ? seg.original : "";
    this.translatedEl.textContent = seg.text;
    this.box.style.display = "block";
  }

  destroy(): void {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.root.remove();
  }
}
