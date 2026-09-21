import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import type { Analysis } from "@/lib/schema";

// Heading và list thật của Word để screen reader đọc đúng thứ tự; không bảng, không text box
export async function POST(req: Request) {
  const { profile, name } = (await req.json()) as { profile: Analysis["profile"]; name: string };

  const h = (text: string, heading: (typeof HeadingLevel)[keyof typeof HeadingLevel]) =>
    new Paragraph({ text, heading });
  const bullets = (items: string[]) => items.map((text) => new Paragraph({ text, bullet: { level: 0 } }));

  const doc = new Document({
    title: `CV ${name}`,
    sections: [
      {
        children: [
          h(name || "CV", HeadingLevel.HEADING_1),
          new Paragraph(profile.summary),
          h("Kinh nghiệm", HeadingLevel.HEADING_2),
          ...profile.experience.flatMap((e) => [
            h(`${e.role} – ${e.organisation} (${e.years})`, HeadingLevel.HEADING_3),
            ...bullets(e.highlights),
          ]),
          h("Thành tích", HeadingLevel.HEADING_2),
          ...bullets(profile.achievements),
          h("Kỹ năng", HeadingLevel.HEADING_2),
          ...bullets(profile.skills),
        ],
      },
    ],
  });

  return new Response(new Uint8Array(await Packer.toBuffer(doc)), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="CV.docx"',
    },
  });
}
