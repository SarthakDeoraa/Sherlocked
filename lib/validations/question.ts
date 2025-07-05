import { z } from "zod";

export const hintSchema = z.object({
  content: z.string().min(1, "Hint content is required."),
  isEnabled: z.boolean().default(true),
});

export const questionSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  imageUrl: z.string().url("Invalid image URL.").optional().or(z.literal("").transform(() => undefined)),
  level: z.number().int("Level must be an integer."),
  points: z.number().int("Points must be an integer.").default(100),
  correctAnswer: z.string().min(1, "Correct answer is required."),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type HintInput = z.infer<typeof hintSchema>;

