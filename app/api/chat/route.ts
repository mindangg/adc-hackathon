import type Anthropic from "@anthropic-ai/sdk";
import { client, MODEL } from "@/lib/claude";
import { CHAT_SYSTEM } from "@/lib/prompts";

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Anthropic.MessageParam[] };

  // Không stream: UI chỉ báo cho screen reader khi câu trả lời đã hoàn tất
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: "low" },
    system: CHAT_SYSTEM,
    messages,
  });

  if (res.stop_reason === "refusal") {
    return Response.json({ reply: "Xin lỗi, mình chưa trả lời được câu này. Bạn thử diễn đạt khác nhé." });
  }
  const reply = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
  return Response.json({ reply });
}
