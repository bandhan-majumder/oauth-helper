import { z } from "zod";

export const assistantAnswerSchema = z.object({
  kind: z.enum(["oauth_answer", "out_of_scope"]),
  answer: z.string().min(1).max(5000).describe("A clear, direct answer with the key point first."),
  steps: z.array(z.string().min(1).max(800)).max(8).describe("Ordered actions to take, or an empty array when not needed."),
  caveats: z.array(z.string().min(1).max(800)).max(6).describe("Relevant conditions, uncertainty, and blockers, or an empty array."),
  sourceIds: z.array(z.string().min(1).max(40)).max(8).describe("IDs from the supplied guide sources only; never invent IDs."),
}).strict();

export type AssistantAnswer = z.infer<typeof assistantAnswerSchema>;
