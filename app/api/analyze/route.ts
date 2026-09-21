import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { client, MODEL } from "@/lib/claude";
import { ANALYZE_SYSTEM } from "@/lib/prompts";
import { Analysis } from "@/lib/schema";

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Anthropic.MessageParam[] };
  const transcript = messages
    .map((m) => `${m.role === "user" ? "Người dùng" : "Trợ lý"}: ${m.content}`)
    .join("\n");

  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: ANALYZE_SYSTEM,
    messages: [{ role: "user", content: transcript }],
    output_config: { format: zodOutputFormat(Analysis) },
  });

  if (!res.parsed_output) {
    return Response.json({ error: "Không tạo được hồ sơ, thử lại nhé." }, { status: 502 });
  }
  return Response.json(res.parsed_output);
}
