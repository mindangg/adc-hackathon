import { SLIDE_SYSTEM } from "@/lib/prompts";

// Extension gửi ảnh chụp tab (data URL JPEG) → trả mô tả slide cho screen reader. Dùng OpenAI.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(req: Request) {
  const { image, previous } = (await req.json()) as { image?: string; previous?: string };
  if (!image?.match(/^data:image\/(jpeg|png);base64,/)) {
    return Response.json({ error: "Ảnh không hợp lệ." }, { status: 400 });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SLIDE_SYSTEM },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image } },
            {
              type: "text",
              text: previous ? `Mô tả slide trước đó:\n${previous}\n\nMô tả slide hiện tại.` : "Mô tả slide hiện tại.",
            },
          ],
        },
      ],
    }),
  });
  const data = (await res.json()) as { choices?: { message: { content: string } }[]; error?: { message: string } };
  const text = data.choices?.[0]?.message.content?.trim();
  if (!res.ok || !text) {
    console.error("[api/slide]", data.error?.message);
    return Response.json({ error: "Không mô tả được slide, thử lại nhé." }, { status: 502 });
  }
  return Response.json({ text });
}
