import { z } from "zod";

export const Analysis = z.object({
  profile: z.object({
    summary: z.string(),
    experience: z.array(
      z.object({ role: z.string(), organisation: z.string(), years: z.string(), highlights: z.array(z.string()) }),
    ),
    skills: z.array(z.string()),
    achievements: z.array(z.string()),
    goals: z.string(),
  }),
  // Câu hỏi AI cần hỏi lại khi thông tin thiếu, thay vì tự đoán
  missingInfo: z.array(z.string()),
  directions: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      skillsHave: z.array(z.string()),
      skillsToLearn: z.array(z.string()),
      toolsToLearn: z.array(z.object({ name: z.string(), note: z.string() })),
      verifyWithEmployer: z.array(z.string()),
    }),
  ),
});

export type Analysis = z.infer<typeof Analysis>;
