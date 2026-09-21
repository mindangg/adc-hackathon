import type { Lang, Segment } from "@/shared";

/**
 * Giao thức postMessage giữa isolated content script và MAIN-world capture.
 * Dùng window.postMessage (cùng trang). Đánh dấu __capy để lọc nhiễu.
 */
export const CAPY_MSG = "__capy_yt_bridge";

export type CaptionFailReason =
  | "no_player"
  | "no_captions"
  | "no_matching_lang"
  | "fetch_failed"
  | "timeout";

/** isolated → MAIN: yêu cầu lấy caption cho ngôn ngữ nguồn ưu tiên. */
export interface GetCaptionsRequest {
  channel: typeof CAPY_MSG;
  dir: "to-mw";
  cmd: "get-captions";
  reqId: string;
  preferred: Lang;
}

/** MAIN → isolated: kết quả. */
export type GetCaptionsResponse =
  | {
      channel: typeof CAPY_MSG;
      dir: "to-cs";
      reqId: string;
      ok: true;
      sourceLang: Lang;
      segments: Segment[];
    }
  | {
      channel: typeof CAPY_MSG;
      dir: "to-cs";
      reqId: string;
      ok: false;
      reason: CaptionFailReason;
    };
