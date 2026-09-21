import { createRoot } from "react-dom/client";
import { useEffect, useState, type CSSProperties } from "react";
import { browser } from "wxt/browser";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import type { HistoryEntry } from "../../src/slide-reader";

const time = (t: number) => new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

/** Mỗi mục là một heading → duyệt nhanh bằng phím H của NVDA/VoiceOver. */
function heading(e: HistoryEntry, slideNo: number) {
  if (e.kind === "slide") return `Slide ${slideNo}, lúc ${time(e.time)}: ${e.summary}`;
  if (e.kind === "question") return `Câu hỏi lúc ${time(e.time)}: ${e.summary}`;
  return `Ảnh lúc ${time(e.time)}`;
}

function withSlideNo(list: HistoryEntry[]) {
  let n = 0;
  return list.map((e) => ({ e, title: heading(e, e.kind === "slide" ? ++n : n), body: e.kind === "image" ? e.summary : e.detail }));
}

async function downloadWord(list: HistoryEntry[]) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: `Ghi chú cuộc họp ${new Date().toLocaleDateString("vi-VN")}`, heading: HeadingLevel.HEADING_1 }),
          ...withSlideNo(list).flatMap(({ title, body }) => [
            new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }),
            ...(body ? [new Paragraph(body)] : []),
          ]),
        ],
      },
    ],
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(await Packer.toBlob(doc));
  a.download = `ghi-chu-cuoc-hop-${new Date().toISOString().slice(0, 10)}.docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function History() {
  const [list, setList] = useState<HistoryEntry[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = () =>
      void browser.storage.session.get("history").then((r) => setList((r.history as HistoryEntry[]) ?? []));
    load();
    // Cập nhật lặng lẽ khi có slide mới (không aria-live để khỏi đọc đè cuộc họp).
    browser.storage.session.onChanged.addListener(load);
    return () => browser.storage.session.onChanged.removeListener(load);
  }, []);

  async function clear() {
    if (!confirm("Xoá toàn bộ lịch sử slide?")) return;
    await browser.storage.session.remove("history");
    setStatus("Đã xoá lịch sử.");
  }

  return (
    <main style={s.wrap}>
      <h1>Lịch sử slide</h1>
      <p>Chỉ lưu chữ, không lưu ảnh. Lịch sử tự mất khi đóng trình duyệt.</p>
      <div style={s.row}>
        <button style={s.btn} disabled={!list.length} onClick={() => void downloadWord(list).then(() => setStatus("Đã tải file Word, xem trong thư mục Tải về."))}>
          Tải file Word
        </button>
        <button style={s.btn} disabled={!list.length} onClick={() => void clear()}>
          Xoá lịch sử
        </button>
      </div>
      <p role="status">{status}</p>
      {!list.length && <p>Chưa có slide nào. Vào cuộc họp và bấm Alt+Shift+S hoặc Alt+Shift+A.</p>}
      {withSlideNo(list).map(({ e, title, body }) => (
        <section key={e.time}>
          <h2 style={s.h2}>{title}</h2>
          {e.page && <p style={s.meta}>{e.page}</p>}
          {body && <p>{body}</p>}
        </section>
      ))}
    </main>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif", lineHeight: 1.6, color: "#111" },
  row: { display: "flex", gap: 8, margin: "16px 0" },
  btn: { padding: "8px 14px", fontSize: 15, borderRadius: 6, border: "1px solid #444", background: "#fff", cursor: "pointer" },
  h2: { fontSize: 18, marginBottom: 4 },
  meta: { color: "#444", fontSize: 13, margin: 0 },
};

createRoot(document.getElementById("root")!).render(<History />);
