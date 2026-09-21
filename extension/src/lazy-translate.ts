import {
  CHUNK_SECONDS,
  PREFETCH_AHEAD_SECONDS,
  SEEK_DEBOUNCE_MS,
  TRANSLATION_CONTEXT_LINES,
  chunkIndexOf,
  type Lang,
  type Segment,
  type TranslatedSegment,
  type VideoContext,
} from "@/shared";
import { translateSegments } from "./api";

type ChunkState = "idle" | "loading" | "done" | "blocked" | "error";
export type FatalKind = "unauthorized" | "error";

export interface LazyTranslatorOptions {
  video: HTMLVideoElement;
  videoId: string;
  sourceLang: Lang;
  targetLang: Lang;
  videoContext?: VideoContext;
  /** Toàn bộ caption gốc của video (client đã có sẵn từ getCaptions). */
  segments: Segment[];
  /** Batch dịch xong → đẩy vào overlay. */
  onSegments: (segs: TranslatedSegment[]) => void;
  /** Tiến độ + số phút đã có thể xem lại trong video hiện tại. */
  onProgress: (done: number, total: number, loading: number, blocked: number, translatedMinutes: number) => void;
  /** Chunk mới bị chặn; giữ translator chạy để user vẫn tua về chunk đã dịch. */
  onQuotaExceeded: () => void;
  /** Lỗi phải dừng hẳn (chưa đăng nhập / lỗi khác). */
  onFatal: (kind: FatalKind) => void;
}

/**
 * Lazy windowed translation (M6): thay vì dịch cả video khi bấm nút, chỉ dịch các
 * CHUNK (lưới CHUNK_SECONDS) quanh vị trí đang phát + buffer trước một đoạn. Theo
 * dõi `currentTime`, xin thêm chunk khi phát tới; debounce khi user tua. Nhờ vậy:
 * trial 10' dùng đúng "xem thử 10 phút đầu", né timeout serverless, chỉ tốn OpenAI
 * cho phần thực xem. Cache/quota theo chunk nên xem lại chunk cũ là free.
 */
export class LazyTranslator {
  private readonly opts: LazyTranslatorOptions;
  private readonly chunks = new Map<number, Segment[]>();
  private readonly segmentPositions = new Map<Segment, number>();
  private readonly state = new Map<number, ChunkState>();
  private readonly controllers = new Map<number, AbortController>();
  private readonly tries = new Map<number, number>();
  private stopped = false;
  private lastDriveAt = 0;
  private seekTimer: ReturnType<typeof setTimeout> | null = null;
  private inFlight = 0;

  private static readonly MAX_CONCURRENT = 2;
  private static readonly MAX_TRIES = 3;
  private static readonly THROTTLE_MS = 400;

  constructor(opts: LazyTranslatorOptions) {
    this.opts = opts;
    // Nhóm segment theo chunk cố định (deterministic → cache dùng chung trùng khớp).
    for (const [position, s] of opts.segments.entries()) {
      this.segmentPositions.set(s, position);
      const idx = chunkIndexOf(s.start);
      let arr = this.chunks.get(idx);
      if (!arr) {
        arr = [];
        this.chunks.set(idx, arr);
        this.state.set(idx, "idle");
      }
      arr.push(s);
    }
  }

  start(): void {
    this.opts.video.addEventListener("timeupdate", this.onTime);
    this.opts.video.addEventListener("seeking", this.onSeek);
    this.drive();
    this.report();
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.opts.video.removeEventListener("timeupdate", this.onTime);
    this.opts.video.removeEventListener("seeking", this.onSeek);
    if (this.seekTimer) clearTimeout(this.seekTimer);
    for (const c of this.controllers.values()) c.abort();
    this.controllers.clear();
  }

  private onTime = (): void => {
    const now = Date.now();
    if (now - this.lastDriveAt < LazyTranslator.THROTTLE_MS) return;
    this.lastDriveAt = now;
    this.drive();
  };

  // Tua: 'seeking' có thể bắn liên tục khi kéo thanh → debounce, chỉ xin chunk khi
  // user đã dừng ở vị trí mới (tránh xin loạn các đoạn bị lướt qua).
  private onSeek = (): void => {
    if (this.seekTimer) clearTimeout(this.seekTimer);
    this.seekTimer = setTimeout(() => this.drive(), SEEK_DEBOUNCE_MS);
  };

  /** Đảm bảo các chunk phủ [currentTime, currentTime + prefetch] đã/đang được dịch. */
  private drive(): void {
    if (this.stopped) return;
    const t = this.opts.video.currentTime;
    const from = Math.floor(t / CHUNK_SECONDS);
    const to = Math.floor((t + PREFETCH_AHEAD_SECONDS) / CHUNK_SECONDS);
    for (let idx = Math.max(0, from); idx <= to; idx++) {
      const st = this.state.get(idx);
      if (st === "idle") this.ensureChunk(idx);
    }
  }

  private ensureChunk(idx: number): void {
    if (this.stopped || this.state.get(idx) !== "idle") return;
    if (this.inFlight >= LazyTranslator.MAX_CONCURRENT) return; // sẽ thử lại ở drive() sau
    const segs = this.chunks.get(idx);
    if (!segs || segs.length === 0) {
      this.state.set(idx, "done");
      return;
    }

    this.state.set(idx, "loading");
    this.inFlight++;
    const controller = new AbortController();
    this.controllers.set(idx, controller);
    this.report();
    const firstPosition = this.segmentPositions.get(segs[0]!) ?? 0;
    const lastPosition = this.segmentPositions.get(segs.at(-1)!) ?? firstPosition;
    const contextBefore = this.opts.segments
      .slice(Math.max(0, firstPosition - TRANSLATION_CONTEXT_LINES), firstPosition)
      .map((segment) => segment.text);
    const contextAfter = this.opts.segments
      .slice(lastPosition + 1, lastPosition + 1 + TRANSLATION_CONTEXT_LINES)
      .map((segment) => segment.text);

    void translateSegments(
      {
        videoId: this.opts.videoId,
        sourceLang: this.opts.sourceLang,
        targetLang: this.opts.targetLang,
        segments: segs,
        contextBefore,
        contextAfter,
        videoContext: this.opts.videoContext,
        chunkIndex: idx,
      },
      (msg) => {
        if (this.stopped) return;
        if (msg.type === "batch") {
          this.opts.onSegments(msg.segments);
        } else if (msg.type === "done") {
          this.state.set(idx, "done");
        } else if (msg.type === "error") {
          if (msg.message === "unauthorized") return this.fail("unauthorized");
          if (msg.message === "quota_exceeded") {
            this.state.set(idx, "blocked");
            this.opts.onQuotaExceeded();
            return;
          }
          // Lỗi tạm (mạng/HTTP) → cho thử lại vài lần rồi mới bỏ cuộc chunk đó.
          const n = (this.tries.get(idx) ?? 0) + 1;
          this.tries.set(idx, n);
          this.state.set(idx, n < LazyTranslator.MAX_TRIES ? "idle" : "error");
        }
      },
      controller.signal,
    ).finally(() => {
      this.inFlight--;
      this.controllers.delete(idx);
      // Không nhận done/error (vd. abort do stop) mà vẫn 'loading' → trả 'idle'.
      if (this.state.get(idx) === "loading") this.state.set(idx, "idle");
      if (!this.stopped) {
        this.report();
        this.drive(); // slot vừa trống → kéo tiếp chunk còn thiếu trong cửa sổ
      }
    });
  }

  private fail(kind: FatalKind): void {
    if (this.stopped) return;
    this.stop();
    this.opts.onFatal(kind);
  }

  private report(): void {
    let doneSegs = 0;
    let loading = 0;
    let blocked = 0;
    let translatedMinutes = 0;
    for (const [idx, st] of this.state) {
      if (st === "done") {
        const segs = this.chunks.get(idx) ?? [];
        doneSegs += segs.length;
        if (segs.length > 0) {
          const start = Math.min(...segs.map((s) => s.start));
          const end = Math.max(...segs.map((s) => s.start + s.dur));
          translatedMinutes += Math.max(0, end - start) / 60;
        }
      }
      else if (st === "loading") loading++;
      else if (st === "blocked") blocked++;
    }
    this.opts.onProgress(doneSegs, this.opts.segments.length, loading, blocked, translatedMinutes);
  }
}
