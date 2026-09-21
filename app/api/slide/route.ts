import { IMAGE_DESCRIBE_SYSTEM, SLIDE_ASK_SYSTEM, SLIDE_DESCRIBE_SYSTEM } from "@/lib/prompts";

// Extension gửi ảnh vùng đang chia sẻ (data URL JPEG).
// - Không có question → mô tả 2 lớp { changed, summary, detail } (so với slide trước nếu có).
// - Có question → { answer }.
// - mode "image" (ảnh/GIF trong chat) → { answer }.
// OPENAI_BASE_URL trỏ được sang server tự host tương thích OpenAI (vLLM, Ollama...) để ảnh không rời công ty.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

type Body = { image?: string; previous?: { summary: string; detail: string }; question?: string; mode?: "image" };

export async function POST(req: Request) {
  const { image, previous, question, mode } = (await req.json()) as Body;
  const plain = Boolean(question) || mode === "image"; // trả lời văn bản, không JSON
  if (!image?.match(/^data:image\/(jpeg|png);base64,/)) {
    return Response.json({ error: "Ảnh không hợp lệ." }, { status: 400 });
  }

  const text = question
    ? `Câu hỏi: ${question}`
    : mode === "image"
      ? "Mô tả ảnh này."
      : previous
      ? `Mô tả slide trước đó: ${previous.summary} ${previous.detail}\n\nMô tả slide hiện tại.`
      : "Mô tả slide hiện tại.";

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      ...(plain ? {} : { response_format: { type: "json_object" } }),
      messages: [
        { role: "system", content: question ? SLIDE_ASK_SYSTEM : mode === "image" ? IMAGE_DESCRIBE_SYSTEM : SLIDE_DESCRIBE_SYSTEM },
        { role: "user", content: [{ type: "image_url", image_url: { url: image } }, { type: "text", text }] },
      ],
    }),
  });
  const data = (await res.json()) as { choices?: { message: { content: string } }[]; error?: { message: string } };
  const out = data.choices?.[0]?.message.content?.trim();
  if (!res.ok || !out) {
    console.error("[api/slide]", data.error?.message);
    return Response.json({ error: "Không đọc được slide, thử lại nhé." }, { status: 502 });
  }
  if (plain) return Response.json({ answer: out });
  try {
    return Response.json(JSON.parse(out));
  } catch {
    return Response.json({ changed: true, summary: out, detail: "" });
  }
}
