import { browser } from "wxt/browser";

export type ToggleButtonState = "idle" | "loading" | "translating" | "done" | "error";

const TITLE: Record<ToggleButtonState, string> = {
  idle: "Mở bảng điều khiển Capy",
  loading: "Capy đang lấy phụ đề",
  translating: "Capy đang dịch",
  done: "Capy đã dịch xong",
  error: "Capy có lỗi",
};

const PULSE_STYLE_ID = "capy-toggle-btn-pulse-style";

function ensurePulseKeyframes(): void {
  if (document.getElementById(PULSE_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes capy-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
    .capy-toggle-btn {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: 0 !important;
      outline: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      appearance: none !important;
      -webkit-appearance: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Nút tròn nhỏ đè lên góc phải trên của player, giống nút bật/tắt của các
 * extension dịch khác. Bấm để bật/tắt dịch mà không cần mở popup.
 */
export class ToggleButton {
  private readonly el: HTMLButtonElement;
  private readonly icon: HTMLImageElement;
  private readonly onClick: () => void;
  private readonly docListener: (e: MouseEvent) => void;
  private state: ToggleButtonState = "idle";

  constructor(container: HTMLElement, onClick: () => void) {
    ensurePulseKeyframes();
    this.onClick = onClick;
    this.el = document.createElement("button");
    this.el.type = "button";
    this.el.className = "capy-toggle-btn";
    Object.assign(this.el.style, {
      position: "absolute",
      top: "14px",
      right: "14px",
      zIndex: "70",
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      border: "none",
      padding: "0",
      margin: "0",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      boxShadow: "none",
      pointerEvents: "auto",
      transition: "filter 0.15s",
      appearance: "none",
      lineHeight: "0",
    } satisfies Partial<CSSStyleDeclaration>);

    this.icon = document.createElement("img");
    this.icon.src = browser.runtime.getURL("/logo.png");
    this.icon.alt = "Capy";
    Object.assign(this.icon.style, {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    this.el.appendChild(this.icon);

    // YouTube gắn listener click/pointerdown ở tầng document (capture) cho
    // player của họ và có thể stopPropagation trước khi sự kiện lan tới nút
    // của mình (dù mình append sau, nằm trên về z-index). Gắn listener ngay ở
    // document với capture:true để chắc chắn bắt được click bất kể YouTube
    // có chặn propagation ở #movie_player/video hay không.
    this.docListener = (e: MouseEvent) => {
      if (e.target === this.el || this.el.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        this.onClick();
      }
    };
    document.addEventListener("click", this.docListener, true);

    container.appendChild(this.el);
    this.render();
  }

  /** `message` (nếu có) thay cho tiêu đề mặc định — hiện lý do lỗi cụ thể khi hover. */
  setState(state: ToggleButtonState, message?: string): void {
    this.state = state;
    this.render(message);
  }

  isMounted(container: HTMLElement): boolean {
    return this.el.parentElement === container;
  }

  private render(message?: string): void {
    this.el.title = message ?? TITLE[this.state];
    const busy = this.state === "loading" || this.state === "translating";
    this.icon.style.animation = busy ? "capy-pulse 1s ease-in-out infinite" : "none";
  }

  destroy(): void {
    document.removeEventListener("click", this.docListener, true);
    this.el.remove();
  }
}
