import type { MeResponse } from "./types";

/**
 * Số phút dịch còn lại theo gói hiện tại.
 *   - trial:  cap − đã dùng
 *   - paid:   total − đã dùng (0 nếu đã hết hạn)
 *   - expired: 0
 * Không bao giờ trả số âm.
 */
export function remainingMinutes(me: MeResponse): number {
  if (me.planType === "expired") return 0;
  const raw =
    me.planType === "paid"
      ? me.quotaMinutesTotal - me.quotaMinutesUsed
      : me.trialMinutesCap - me.trialMinutesUsed;
  return Math.max(0, raw);
}

export interface AccountFlags {
  remainingMinutes: number;
  /** Đã hết lượt (paywall). */
  exhausted: boolean;
  /** Sắp hết lượt (≤15% dung lượng) — nhắc gia hạn/mua thêm. */
  lowQuota: boolean;
  /** Gói trả phí sắp hết hạn (≤3 ngày). */
  expiringSoon: boolean;
  /** Số ngày còn lại của gói trả phí (null nếu không có hạn). */
  daysLeft: number | null;
}

/** Cờ trạng thái tài khoản để UI nhắc gia hạn/hết quota. Thuần → có test. */
export function accountFlags(me: MeResponse, now: number = Date.now()): AccountFlags {
  const remaining = remainingMinutes(me);
  const capacity =
    me.planType === "paid" ? me.quotaMinutesTotal : me.trialMinutesCap;

  let daysLeft: number | null = null;
  if (me.planExpiresAt) {
    const ms = new Date(me.planExpiresAt).getTime() - now;
    daysLeft = Math.max(0, Math.ceil(ms / 86_400_000));
  }

  const exhausted = me.planType === "expired" || remaining <= 0;
  const lowQuota = !exhausted && capacity > 0 && remaining <= capacity * 0.15;
  const expiringSoon =
    me.planType === "paid" && daysLeft != null && daysLeft <= 3;

  return { remainingMinutes: remaining, exhausted, lowQuota, expiringSoon, daysLeft };
}

/** Định dạng "X giờ Y phút" / "Y phút" cho hiển thị. */
export function formatMinutes(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h > 0) return rem > 0 ? `${h} giờ ${rem} phút` : `${h} giờ`;
  return `${rem} phút`;
}
