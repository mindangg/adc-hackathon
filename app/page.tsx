"use client";

import { useState } from "react";
import type { Analysis } from "@/lib/schema";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING = "Chào bạn! Mình sẽ hỏi vài câu để hiểu năng lực của bạn. Bạn đang hoặc đã từng làm công việc gì?";

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [name, setName] = useState("");

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res;
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    // API yêu cầu bắt đầu bằng lượt user, nên bỏ lời chào khi gửi
    const next: Msg[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setAnnounce("Đang trả lời…");
    try {
      const { reply } = await (await post("/api/chat", { messages: next.slice(1) })).json();
      setMessages([...next, { role: "assistant", content: reply }]);
      setAnnounce(reply); // chỉ báo khi đã có câu trả lời đầy đủ
    } catch {
      setAnnounce("Có lỗi, bạn thử gửi lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    setBusy(true);
    setAnnounce("Đang tạo hồ sơ, vui lòng chờ…");
    try {
      const data: Analysis = await (await post("/api/analyze", { messages: messages.slice(1) })).json();
      setResult(data);
      setAnnounce("Đã tạo xong hồ sơ và 3 hướng đi. Dùng phím H để duyệt các mục.");
    } catch {
      setAnnounce("Không tạo được hồ sơ, bạn thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadCv() {
    const blob = await (await post("/api/cv", { profile: result!.profile, name })).blob();
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "CV.docx" });
    a.click();
    setAnnounce("Đã tải CV dạng Word.");
  }

  return (
    <>
      <h1>Career Navigator</h1>
      <div aria-live="polite" className="sr-only">{announce}</div>

      <section aria-labelledby="chat-h">
        <h2 id="chat-h">Trò chuyện</h2>
        <ol aria-label="Lịch sử trò chuyện">
          {messages.map((m, i) => (
            <li key={i}>
              <strong>{m.role === "user" ? "Bạn: " : "Trợ lý: "}</strong>
              {m.content}
            </li>
          ))}
        </ol>
        <form onSubmit={send}>
          <label htmlFor="msg">Câu trả lời của bạn</label>
          <textarea
            id="msg"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
          />
          <button type="submit" disabled={busy}>Gửi</button>{" "}
          <button type="button" onClick={analyze} disabled={busy || messages.length < 3}>Tạo hồ sơ</button>
        </form>
      </section>

      {result && (
        <section aria-labelledby="profile-h">
          <h2 id="profile-h">Hồ sơ của bạn</h2>
          <p>{result.profile.summary}</p>
          {result.missingInfo.length > 0 && (
            <>
              <h3>Cần bổ sung</h3>
              <ul>{result.missingInfo.map((q) => <li key={q}>{q}</li>)}</ul>
            </>
          )}

          <h2>3 hướng đi phù hợp</h2>
          {result.directions.map((d) => (
            <article key={d.title}>
              <h3>{d.title}</h3>
              <p>{d.why}</p>
              <h4>Kỹ năng đã có</h4>
              <ul>{d.skillsHave.map((s) => <li key={s}>{s}</li>)}</ul>
              <h4>Kỹ năng cần học</h4>
              <ul>{d.skillsToLearn.map((s) => <li key={s}>{s}</li>)}</ul>
              <h4>Công cụ cần học</h4>
              <ul>{d.toolsToLearn.map((t) => <li key={t.name}>{t.name}: {t.note}</li>)}</ul>
              <h4>Cần kiểm tra với nhà tuyển dụng</h4>
              <ul>{d.verifyWithEmployer.map((s) => <li key={s}>{s}</li>)}</ul>
            </article>
          ))}

          <h2>Tải CV</h2>
          <label htmlFor="name">Họ và tên trên CV</label>{" "}
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />{" "}
          <button type="button" onClick={downloadCv}>Tải CV dạng Word</button>
        </section>
      )}
    </>
  );
}
