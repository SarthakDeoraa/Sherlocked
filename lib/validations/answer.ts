import { z } from "zod";

export const answerSchema = z.object({
  answer: z.string()
    .min(1, "Answer is required.")
    .regex(/^[a-z0-9]+$/, "Answer must be lowercase, no spaces, and only alphanumeric."),
});