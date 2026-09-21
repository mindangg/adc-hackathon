/**
 * Lớp tách các selector/DOM của YouTube — nơi DỄ VỠ nhất khi YouTube đổi layout.
 * Mọi truy cập DOM YouTube đi qua đây để chỉ sửa một chỗ.
 */

import type { VideoContext } from "@/capysub/shared";

function cleanText(value: string | null | undefined, maxLength: number): string | undefined {
  const text = value?.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, maxLength) : undefined;
}

export function getVideoId(): string | null {
  const url = new URL(location.href);
  // Trang xem thường: /watch?v=ID
  const v = url.searchParams.get("v");
  if (v) return v;
  // Shorts: /shorts/ID
  const m = url.pathname.match(/^\/shorts\/([\w-]{6,})/);
  return m ? m[1]! : null;
}

export function isWatchPage(): boolean {
  return getVideoId() !== null;
}

export function getVideoElement(): HTMLVideoElement | null {
  return (
    document.querySelector<HTMLVideoElement>("video.html5-main-video") ??
    document.querySelector<HTMLVideoElement>("#movie_player video") ??
    document.querySelector<HTMLVideoElement>("video")
  );
}

export function getPlayerContainer(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>("#movie_player") ??
    document.querySelector<HTMLElement>(".html5-video-player")
  );
}

/** Metadata công khai của video dùng làm brief dịch; không chứa dữ liệu người dùng. */
export function getVideoContext(captionSample: string[]): VideoContext {
  const title =
    cleanText(
      document.querySelector<HTMLElement>(
        "ytd-watch-metadata h1 yt-formatted-string, h1.title yt-formatted-string",
      )?.textContent,
      300,
    ) ??
    cleanText(document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content, 300) ??
    cleanText(document.title.replace(/\s*-\s*YouTube\s*$/i, ""), 300);
  const channel =
    cleanText(
      document.querySelector<HTMLElement>(
        "ytd-watch-metadata ytd-channel-name yt-formatted-string, #owner-name a",
      )?.textContent,
      200,
    ) ??
    cleanText(
      document.querySelector<HTMLElement>('[itemprop="author"] [itemprop="name"]')
        ?.getAttribute("content"),
      200,
    );
  const description = cleanText(
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content,
    2000,
  );

  return {
    title,
    channel,
    description,
    captionSample: captionSample.slice(0, 40),
  };
}
