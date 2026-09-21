/** Gói trả phí — một tầng, khác nhau ở thời hạn + quota. */
export type PlanCode = "week" | "month" | "quarter";

export interface Plan {
  code: PlanCode;
  label: string;
  /** Thời hạn (ngày) kể từ lúc thanh toán. */
  days: number;
  /** Quota dịch (phút) cấp cho gói. */
  minutes: number;
  /** Giá (VND). Giá ra mắt — điều chỉnh theo tỷ lệ mua thực tế (validate qua TikTok). */
  amount: number;
}

export const PLANS: Record<PlanCode, Plan> = {
  week: { code: "week", label: "Gói Tuần", days: 7, minutes: 120, amount: 29000 },
  month: { code: "month", label: "Gói Tháng", days: 30, minutes: 600, amount: 79000 },
  quarter: { code: "quarter", label: "Gói 3 Tháng", days: 90, minutes: 1800, amount: 199000 },
};

export const PLAN_CODES = Object.keys(PLANS) as PlanCode[];
