import { useEffect, useState, type CSSProperties } from "react";
import { browser } from "wxt/browser";
import type { SlideMessage } from "../background";

type Cmd = Exclude<SlideMessage["type"], "ask">;

async function activeTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.id != null ? { tabId: tab.id, windowId: tab.windowId } : null;
}

async function send(type: Cmd) {
  const t = await activeTab();
  return t && browser.runtime.sendMessage({ type, ...t } satisfies SlideMessage);
}

/** Popup: hỏi về slide (mở bằng Alt+Shift+Q, ô hỏi được focus sẵn) + các lệnh đọc. */
export function App() {
  const [auto, setAuto] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    void send("status").then((on) => setAuto(Boolean(on)));
  }, []);

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    const t = await activeTab();
    if (!q || !t || asking) return;
    setAsking(true);
    setAnswer("Đang hỏi…");
    const a = (await browser.runtime.sendMessage({ type: "ask", question: q, ...t } satisfies SlideMessage)) as string;
    setAnswer(a); // cả câu một lần, không stream
    setAsking(false);
  }

  return (
    <main style={s.wrap}>
      <h1 style={s.h1}>Capy – Đọc slide</h1>

      <form onSubmit={onAsk} style={s.col}>
        <label htmlFor="q" style={s.label}>
          Hỏi về slide đang chiếu
        </label>
        <input
          id="q"
          autoFocus
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Vd: Tháng nào doanh thu thấp nhất?"
          style={s.input}
        />
        <button type="submit" aria-disabled={asking} style={{ ...s.btn, ...s.primary }}>
          Hỏi
        </button>
      </form>
      <div role="status" style={s.answer}>
        {answer}
      </div>

      <h2 style={s.h2}>Đọc slide</h2>
      <div style={s.col}>
        <button style={s.btn} onClick={() => void send("describe").then(() => window.close())}>
          Đọc slide ngay (Alt+Shift+S)
        </button>
        <button style={s.btn} onClick={() => void send("detail").then(() => window.close())}>
          Đọc chi tiết slide vừa rồi (Alt+Shift+D)
        </button>
        <button
          style={s.btn}
          aria-pressed={auto}
          onClick={() => void send("toggle-auto").then((on) => setAuto(Boolean(on)))}
        >
          Tự động đọc khi đổi slide (Alt+Shift+A): {auto ? "Bật" : "Tắt"}
        </button>
      </div>
      <button style={{ ...s.btn, marginTop: 8 }} onClick={() => void send("open-history").then(() => window.close())}>
        Xem lại các slide, tải file Word
      </button>
      <p style={s.note}>Chuột phải (hoặc phím Menu) lên ảnh/GIF trong chat → "Capy: Mô tả ảnh này". Kết quả được đọc trên trang qua screen reader. Không lưu ảnh.</p>
    </main>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { width: 320, padding: 16, fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#111" },
  h1: { fontSize: 16, margin: "0 0 12px" },
  h2: { fontSize: 14, margin: "16px 0 8px" },
  col: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontWeight: 600 },
  input: { padding: 8, fontSize: 14, border: "1px solid #666", borderRadius: 6 },
  btn: { padding: "8px 12px", fontSize: 14, borderRadius: 6, border: "1px solid #666", background: "#fff", cursor: "pointer", textAlign: "left" },
  primary: { background: "#1a56db", color: "#fff", borderColor: "#1a56db", textAlign: "center" },
  answer: { marginTop: 8, whiteSpace: "pre-wrap" },
  note: { marginTop: 16, fontSize: 12, color: "#444" },
};
