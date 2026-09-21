import { useCallback, useEffect, useRef, useState } from "react";
import { browser } from "wxt/browser";
import {
  accountFlags,
  formatMinutes,
  PLANS,
  type AuthSession,
  type Lang,
  type MeResponse,
} from "@/capysub/shared";
import type { PopupToContent, StatusResponse } from "../../src/messaging";
import { API_BASE } from "../../src/config";
import { clearSession, getSession, getValidAccessToken, onSessionChange } from "../../src/auth";
import {
  BOX_BACKGROUNDS,
  DEFAULT_SETTINGS,
  ORIGINAL_COLORS,
  TRANSLATED_COLORS,
  loadSettings,
  saveSettings,
  type BoxPosition,
  type CaptionSettings,
} from "../../src/settings";

const STATUS_LABEL: Record<StatusResponse["state"], string> = {
  idle: "Sẵn sàng",
  loading: "Đang lấy phụ đề…",
  translating: "Đang dịch…",
  done: "Đã dịch xong",
  error: "Có lỗi xảy ra",
  unsupported: "Chưa hỗ trợ",
  unauthorized: "Cần đăng nhập",
  paywall: "Đã hết lượt dịch",
};

const PLAN_LABEL: Record<MeResponse["planType"], string> = {
  trial: "Dùng thử",
  paid: "Trả phí",
  expired: "Hết hạn",
};

const vnd = (n: number) => n.toLocaleString("vi-VN") + "đ";
const MIN_PLAN_PRICE = Math.min(...Object.values(PLANS).map((p) => p.amount));

const POSITION_GRID: BoxPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export function App() {
  const [screen, setScreen] = useState<"main" | "settings">("main");
  const [settings, setSettings] = useState<CaptionSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [meLoadFailed, setMeLoadFailed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const cancelLogoutRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  function update(patch: Partial<CaptionSettings>): void {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }

  function updateOriginal(patch: Partial<CaptionSettings["original"]>): void {
    setSettings((prev) => {
      const next = { ...prev, original: { ...prev.original, ...patch } };
      void saveSettings(next);
      return next;
    });
  }

  function updateTranslated(patch: Partial<CaptionSettings["translated"]>): void {
    setSettings((prev) => {
      const next = { ...prev, translated: { ...prev.translated, ...patch } };
      void saveSettings(next);
      return next;
    });
  }

  function updateBox(patch: Partial<CaptionSettings["box"]>): void {
    setSettings((prev) => {
      const next = { ...prev, box: { ...prev.box, ...patch } };
      void saveSettings(next);
      return next;
    });
  }

  function resetDefaults(): void {
    setSettings(DEFAULT_SETTINGS);
    void saveSettings(DEFAULT_SETTINGS);
  }

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setAuthReady(true);
    });
    const off = onSessionChange((s) => {
      setSession(s);
      if (!s) {
        setMe(null);
        setMeLoading(false);
        setMeLoadFailed(false);
        setShowLogoutConfirm(false);
      }
    });
    return off;
  }, []);

  useEffect(() => {
    if (!showLogoutConfirm) return;
    cancelLogoutRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowLogoutConfirm(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showLogoutConfirm]);

  const loadMe = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) {
      setMe(null);
      setMeLoading(false);
      setMeLoadFailed(false);
      return;
    }
    setMeLoading(true);
    setMeLoadFailed(false);
    try {
      const res = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setMe((await res.json()) as MeResponse);
      } else {
        setMe(null);
        setMeLoadFailed(true);
      }
    } catch {
      setMe(null);
      setMeLoadFailed(true);
    } finally {
      setMeLoading(false);
    }
  }, []);

  // Có session → lấy trạng thái tài khoản (gói/quota).
  useEffect(() => {
    if (session) void loadMe();
  }, [session, loadMe]);

  useEffect(() => {
    const listener = (raw: unknown) => {
      const msg = raw as StatusResponse;
      if (msg?.type !== "capy:status") return;
      setStatus(msg);
      // Dịch xong → quota đã thay đổi ở backend, làm mới để hiện số còn lại đúng.
      if (msg.state === "done") void loadMe();
    };
    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, [loadMe]);

  async function sendToActiveTab(cmd: PopupToContent) {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    try {
      await browser.tabs.sendMessage(tab.id, cmd);
    } catch {
      setStatus({
        type: "capy:status",
        state: "unsupported",
        message: "Hãy mở một trang video YouTube rồi thử lại.",
      });
    }
  }

  const openTab = (path: string) => () => {
    void browser.tabs.create({ url: `${API_BASE}${path}` });
  };
  const openPricing = openTab("/pricing");
  const openAccount = openTab("/account");
  const openSupport = openTab("/support");
  const openLogin = openTab("/login");

  const flags = me ? accountFlags(me) : null;
  const accountPending = Boolean(session && meLoading && !me);
  const translateDisabled = !session || accountPending;
  const usedMinutes = me
    ? me.planType === "trial"
      ? me.trialMinutesUsed
      : me.quotaMinutesUsed
    : 0;
  const totalMinutes = me
    ? me.planType === "trial"
      ? me.trialMinutesCap
      : me.quotaMinutesTotal
    : 0;

  if (screen === "settings") {
    return (
      <div style={styles.wrap}>
        <header style={styles.settingsHeader}>
          <button style={styles.back} onClick={() => setScreen("main")} aria-label="Quay lại">
            Quay lại
          </button>
          <span style={styles.settingsTitle}>Cài đặt</span>
        </header>

        <Section title="Ngôn ngữ đích">
          <select
            value={settings.targetLang}
            onChange={(e) => update({ targetLang: e.target.value as Lang })}
            style={styles.select}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </Section>

        <ToggleRow
          label="Hiện phụ đề"
          checked={settings.showCaptions}
          onChange={(v) => update({ showCaptions: v })}
        />
        <ToggleRow
          label="Hiện phụ đề gốc"
          checked={settings.showOriginalCaptions}
          onChange={(v) => update({ showOriginalCaptions: v })}
        />
        <div style={styles.divider}>GIAO DIỆN PHỤ ĐỀ</div>

        <Section title="Phụ đề gốc">
          <LabeledSlider
            label="Cỡ chữ"
            value={settings.original.size}
            min={0.5}
            max={2}
            step={0.1}
            format={(v) => `${v.toFixed(1)}x`}
            onChange={(v) => updateOriginal({ size: v })}
          />
          <LabeledSlider
            label="Độ đậm"
            value={settings.original.weight}
            min={300}
            max={700}
            step={100}
            format={(v) => String(v)}
            onChange={(v) => updateOriginal({ weight: v })}
          />
          <ColorSwatches
            colors={ORIGINAL_COLORS}
            value={settings.original.color}
            onChange={(c) => updateOriginal({ color: c })}
          />
        </Section>

        <Section title="Phụ đề dịch">
          <LabeledSlider
            label="Cỡ chữ"
            value={settings.translated.size}
            min={0.5}
            max={2}
            step={0.1}
            format={(v) => `${v.toFixed(1)}x`}
            onChange={(v) => updateTranslated({ size: v })}
          />
          <LabeledSlider
            label="Độ đậm"
            value={settings.translated.weight}
            min={300}
            max={700}
            step={100}
            format={(v) => String(v)}
            onChange={(v) => updateTranslated({ weight: v })}
          />
          <ColorSwatches
            colors={TRANSLATED_COLORS}
            value={settings.translated.color}
            onChange={(c) => updateTranslated({ color: c })}
          />
        </Section>

        <Section title="Khung phụ đề">
          <span style={styles.subLabel}>Vị trí</span>
          <div style={styles.posGrid}>
            {POSITION_GRID.map((pos) => {
              const active = settings.box.position === pos;
              return (
                <button
                  key={pos}
                  style={styles.posCell}
                  onClick={() => updateBox({ position: pos })}
                  aria-label={pos}
                >
                  <span
                    style={{
                      ...styles.posDot,
                      background: active ? "#0a58ca" : "#ccc",
                      boxShadow: active ? "0 0 0 3px rgba(10,88,202,0.25)" : "none",
                    }}
                  />
                </button>
              );
            })}
          </div>

          <span style={styles.subLabel}>Màu nền</span>
          <div style={styles.swatchRow}>
            {BOX_BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                onClick={() => updateBox({ background: bg })}
                style={{
                  ...styles.swatch,
                  background: bg === "transparent" ? "#fff" : bg,
                  border:
                    settings.box.background === bg
                      ? "2px solid #0a58ca"
                      : bg === "transparent"
                        ? "1px solid #ccc"
                        : "1px solid transparent",
                }}
                aria-label={bg}
              />
            ))}
          </div>

          <LabeledSlider
            label="Độ mờ nền"
            value={settings.box.opacity}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v}%`}
            onChange={(v) => updateBox({ opacity: v })}
          />
          <LabeledSlider
            label="Bo góc"
            value={settings.box.borderRadius}
            min={0}
            max={24}
            step={1}
            format={(v) => `${v}px`}
            onChange={(v) => updateBox({ borderRadius: v })}
          />
          <LabeledSlider
            label="Đệm"
            value={settings.box.padding}
            min={0}
            max={24}
            step={1}
            format={(v) => `${v}px`}
            onChange={(v) => updateBox({ padding: v })}
          />
          <LabeledSlider
            label="Lề ngang"
            value={settings.box.horizontalMargin}
            min={0}
            max={30}
            step={1}
            format={(v) => `${v}%`}
            onChange={(v) => updateBox({ horizontalMargin: v })}
          />
        </Section>

        <button style={styles.button} onClick={resetDefaults}>
          Khôi phục mặc định
        </button>
        <button style={styles.link} onClick={openSupport}>
          ✉ Liên hệ hỗ trợ
        </button>
      </div>
    );
  }

  const subtitleOn = status != null && status.state !== "idle" && status.state !== "error";

  function toggleSubtitle(): void {
    if (subtitleOn) {
      sendToActiveTab({ type: "capy:stop" });
    } else {
      sendToActiveTab({ type: "capy:translate" });
    }
  }

  async function confirmLogout(): Promise<void> {
    await clearSession();
    setSession(null);
    setShowLogoutConfirm(false);
  }

  return (
    <div style={styles.wrap}>
      <style>
        {`
          @keyframes capy-skeleton-pulse {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}
      </style>
      <header style={styles.header}>
        <span style={styles.logo}>
          <img src="/icon-32.png" alt="Capy" style={styles.logoIcon} />
          Capy
        </span>
      </header>

      <SlideReader />

      {!authReady ? (
        <PopupSkeleton />
      ) : !session ? (
        <div style={styles.authBox}>
          <p style={styles.authMsg}>Đăng nhập để dùng Capy dịch phụ đề.</p>
          <button style={{ ...styles.button, ...styles.primary }} onClick={openLogin}>
            Đăng nhập trên Capy
          </button>
        </div>
      ) : (
        <>
          {accountPending ? (
            <AccountSkeleton />
          ) : (
            <div style={styles.accountRow}>
              <span style={styles.email}>{session.user.email ?? "Đã đăng nhập"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={styles.planBadge}>{me ? PLAN_LABEL[me.planType] : "Không rõ"}</span>
                <button style={styles.iconBtn} onClick={() => setShowLogoutConfirm(true)} aria-label="Đăng xuất">
                  ⏻
                </button>
              </div>
            </div>
          )}

          {accountPending && <QuotaSkeleton />}

          {!accountPending && meLoadFailed && (
            <div style={styles.status}>
              <strong>Chưa tải được tài khoản</strong>
              <div style={styles.statusMsg}>Kiểm tra mạng rồi mở lại popup. Bạn vẫn có thể thử dịch video hiện tại.</div>
            </div>
          )}

          {me && flags && (
            <div style={styles.quotaLine}>
              Đã dùng {formatMinutes(usedMinutes)}/{formatMinutes(totalMinutes)}
              {" · "}Còn {formatMinutes(flags.remainingMinutes)}
              {me.planType === "paid" && flags.daysLeft != null && ` · ${flags.daysLeft} ngày`}
              {" · "}
              <button style={styles.link} onClick={openAccount}>
                Tài khoản
              </button>
            </div>
          )}

          {/* Nhắc gia hạn / sắp hết lượt (không chặn) */}
          {flags && !flags.exhausted && (flags.lowQuota || flags.expiringSoon) && (
            <div style={styles.remind}>
              <div>
                {flags.expiringSoon
                  ? `Gói sắp hết hạn (còn ${flags.daysLeft} ngày).`
                  : `Sắp hết lượt (còn ${formatMinutes(flags.remainingMinutes)}).`}
              </div>
              <button style={styles.remindBtn} onClick={openPricing}>
                {me?.planType === "trial" ? "Nâng cấp" : "Gia hạn"}
              </button>
            </div>
          )}

          {flags?.exhausted ? (
            <div style={styles.subscribeCard}>
              <div style={styles.subscribeTitle}>Bạn đã dùng hết lượt dịch</div>
              <div style={styles.subscribeDesc}>
                Bạn vẫn có thể xem lại phần đã dịch. Nâng cấp để dịch phần mới.
              </div>
              <button style={styles.viewPlansBtn} onClick={openPricing}>
                Xem các gói — từ {vnd(MIN_PLAN_PRICE)}
              </button>
            </div>
          ) : null}

          <div style={styles.toggleCard}>
            <span>
              {accountPending
                ? "Đang kiểm tra tài khoản…"
                : flags?.exhausted
                  ? "Xem lại phần đã dịch"
                  : "Dịch phụ đề"}
            </span>
            <span
              role="switch"
              aria-checked={subtitleOn}
              aria-disabled={translateDisabled}
              onClick={() => !translateDisabled && toggleSubtitle()}
              style={{
                ...styles.switchTrack,
                background: subtitleOn ? "#0a58ca" : "#ccc",
                cursor: translateDisabled ? "not-allowed" : "pointer",
                opacity: translateDisabled ? 0.65 : 1,
              }}
            >
              <span style={{ ...styles.switchThumb, left: subtitleOn ? 18 : 2 }} />
            </span>
          </div>

          <button style={styles.settingsRow} onClick={() => setScreen("settings")}>
            Cài đặt
          </button>
        </>
      )}

      {status && (
        <div style={styles.status}>
          <strong>{STATUS_LABEL[status.state]}</strong>
          {status.progress && status.state === "translating" && (
            <span> · {status.progress.done}/{status.progress.total} dòng</span>
          )}
          {status.progress?.translatedMinutes != null && status.progress.translatedMinutes > 0 && (
            <div style={styles.statusMsg}>
              Video này đã dịch: {formatMinutes(status.progress.translatedMinutes)}
            </div>
          )}
          {status.message && <div style={styles.statusMsg}>{status.message}</div>}
          {status.state === "unauthorized" && (
            <button
              style={{ ...styles.button, ...styles.primary, marginTop: 8 }}
              onClick={openLogin}
            >
              Đăng nhập trên Capy
            </button>
          )}
          {status.state === "paywall" && (
            <button style={{ ...styles.button, ...styles.primary, marginTop: 8 }} onClick={openPricing}>
              Nâng cấp
            </button>
          )}
        </div>
      )}

      {showLogoutConfirm && (
        <div
          style={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowLogoutConfirm(false);
          }}
        >
          <div
            style={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="capy-logout-title"
            aria-describedby="capy-logout-desc"
          >
            <div style={styles.confirmTitle} id="capy-logout-title">
              Đăng xuất khỏi Capy?
            </div>
            <p style={styles.confirmDesc} id="capy-logout-desc">
              Bạn cần đăng nhập lại trước khi dịch phụ đề mới trên YouTube.
            </p>
            <div style={styles.confirmActions}>
              <button
                ref={cancelLogoutRef}
                style={styles.confirmCancelBtn}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Hủy
              </button>
              <button style={styles.confirmDangerBtn} onClick={() => void confirmLogout()}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Đọc slide cuộc họp. Không cần đăng nhập Capy. Kết quả được đọc trên trang qua screen reader. */
function SlideReader() {
  const [auto, setAuto] = useState(false);

  async function send(type: "slide:describe" | "slide:toggle-auto" | "slide:repeat" | "slide:status") {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id == null) return;
    return browser.runtime.sendMessage({ type, tabId: tab.id, windowId: tab.windowId });
  }

  useEffect(() => {
    void send("slide:status").then((on) => setAuto(Boolean(on)));
  }, []);

  return (
    <Section title="Đọc slide cuộc họp">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          style={{ ...styles.button, ...styles.primary }}
          // Đóng popup để focus về trang, nghe kết quả ở đó.
          onClick={() => void send("slide:describe").then(() => window.close())}
        >
          Đọc slide ngay (Alt+Shift+S)
        </button>
        <button
          style={styles.button}
          aria-pressed={auto}
          onClick={() => void send("slide:toggle-auto").then((on) => setAuto(Boolean(on)))}
        >
          Tự động đọc khi đổi slide (Alt+Shift+A): {auto ? "Bật" : "Tắt"}
        </button>
        <button style={styles.button} onClick={() => void send("slide:repeat").then(() => window.close())}>
          Đọc lại slide vừa rồi (Alt+Shift+R)
        </button>
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <h2 style={{ ...styles.sectionTitle, margin: 0 }}>{title}</h2>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={styles.toggleRow}>
      <span>{label}</span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{ ...styles.switchTrack, background: checked ? "#0a58ca" : "#ccc" }}
      >
        <span style={{ ...styles.switchThumb, left: checked ? 18 : 2 }} />
      </span>
    </label>
  );
}

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={styles.sliderRow}>
      <div style={styles.sliderTop}>
        <span>{label}</span>
        <span>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={styles.range}
      />
    </div>
  );
}

function ColorSwatches({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div style={styles.swatchRow}>
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            ...styles.swatch,
            background: c,
            border: value === c ? "2px solid #0a58ca" : "1px solid #ddd",
          }}
          aria-label={c}
        />
      ))}
    </div>
  );
}

function PopupSkeleton() {
  return (
    <>
      <AccountSkeleton />
      <QuotaSkeleton />
      <div style={styles.toggleCard}>
        <SkeletonLine width={108} />
        <SkeletonLine width={36} height={20} radius={999} />
      </div>
      <SkeletonLine width="100%" height={38} radius={8} />
    </>
  );
}

function AccountSkeleton() {
  return (
    <div style={styles.accountRow} aria-label="Đang tải thông tin tài khoản">
      <SkeletonLine width={142} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SkeletonLine width={58} height={22} radius={6} />
        <SkeletonLine width={26} height={26} radius={6} />
      </div>
    </div>
  );
}

function QuotaSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }} aria-label="Đang tải lượt dịch">
      <SkeletonLine width="86%" height={12} />
      <SkeletonLine width="56%" height={12} />
    </div>
  );
}

function SkeletonLine({
  width,
  height = 14,
  radius = 999,
}: {
  width: number | string;
  height?: number;
  radius?: number;
}) {
  return (
    <span
      style={{
        ...styles.skeleton,
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    width: 300,
    maxHeight: 560,
    overflowY: "auto",
    padding: 16,
    // Bao gồm padding trong maxHeight. Khi panel bị giới hạn bởi chiều cao
    // player, phần thao tác cuối vẫn nằm trong vùng cuộn thay vì bị iframe cắt.
    boxSizing: "border-box",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  logo: { fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 },
  logoIcon: { width: 20, height: 20, borderRadius: "50%" },
  settingsHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  back: { background: "none", border: "none", fontSize: 12, cursor: "pointer", padding: 0, lineHeight: 1, color: "#555" },
  settingsTitle: { fontSize: 16, fontWeight: 700 },
  authBox: { display: "flex", flexDirection: "column", gap: 10 },
  authMsg: { fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 },
  accountRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  email: { fontSize: 13, fontWeight: 600, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  planBadge: { fontSize: 11, color: "#333", border: "1px solid #ccc", borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" },
  iconBtn: { background: "none", border: "1px solid #ddd", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: "#555", lineHeight: 1 },
  quotaLine: { fontSize: 12, color: "#555" },
  link: { background: "none", border: "none", color: "#0a58ca", fontSize: 12, cursor: "pointer", flexShrink: 0, textAlign: "left", padding: 0 },
  subscribeCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center", background: "#f5f5f5", borderRadius: 8, padding: "16px 12px" },
  subscribeTitle: { fontSize: 15, fontWeight: 700, color: "#111" },
  subscribeDesc: { fontSize: 12, color: "#666", lineHeight: 1.4 },
  viewPlansBtn: { width: "100%", marginTop: 6, background: "#0a58ca", color: "#fff", border: "none", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  toggleCard: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f5f5", borderRadius: 8, padding: "10px 12px", fontSize: 14 },
  settingsRow: { display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "9px 12px", fontSize: 14, cursor: "pointer", textAlign: "left" },
  remind: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 12,
    color: "#7a5b00",
    background: "#fff8e1",
    borderRadius: 6,
    padding: "8px 10px",
    lineHeight: 1.4,
  },
  remindBtn: { flexShrink: 0, background: "#111", color: "#fff", border: "none", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  select: { padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%" },
  button: { padding: "9px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#f5f5f5", fontSize: 14, cursor: "pointer" },
  primary: { background: "#111", color: "#fff", border: "1px solid #111", fontWeight: 600 },
  status: { fontSize: 13, color: "#333", background: "#f7f7f7", borderRadius: 6, padding: "8px 10px" },
  statusMsg: { marginTop: 4, color: "#666", fontSize: 12, lineHeight: 1.4 },
  skeleton: {
    display: "inline-block",
    flexShrink: 0,
    background: "linear-gradient(90deg, #eeeeee 25%, #f8f8f8 37%, #eeeeee 63%)",
    backgroundSize: "200% 100%",
    animation: "capy-skeleton-pulse 1.1s ease-in-out infinite",
  },

  divider: { fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.04em", borderTop: "1px solid #eee", paddingTop: 10, marginTop: 4 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#222" },
  subLabel: { fontSize: 12, color: "#555", marginTop: 2 },
  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#333", cursor: "pointer" },
  switchTrack: { position: "relative", width: 36, height: 20, borderRadius: 999, cursor: "pointer", flexShrink: 0, transition: "background 0.15s" },
  switchThumb: { position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" },
  sliderRow: { display: "flex", flexDirection: "column", gap: 2 },
  sliderTop: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555" },
  range: { width: "100%", accentColor: "#0a58ca" },
  swatchRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  swatch: { width: 22, height: 22, borderRadius: "50%", cursor: "pointer", padding: 0 },
  posGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, background: "#f5f5f5", borderRadius: 6, padding: 10 },
  posCell: { display: "flex", alignItems: "center", justifyContent: "center", height: 26, border: "none", background: "transparent", cursor: "pointer" },
  posDot: { width: 10, height: 10, borderRadius: "50%", transition: "background 0.15s" },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "rgba(0,0,0,0.35)",
    boxSizing: "border-box",
  },
  confirmDialog: {
    width: "100%",
    maxWidth: 268,
    background: "#fff",
    borderRadius: 8,
    padding: 16,
    boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
  },
  confirmTitle: { fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 6 },
  confirmDesc: { margin: 0, color: "#555", fontSize: 13, lineHeight: 1.45 },
  confirmActions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 },
  confirmCancelBtn: {
    border: "1px solid #d6d6d6",
    background: "#fff",
    color: "#222",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmDangerBtn: {
    border: "1px solid #c5221f",
    background: "#c5221f",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};
