import { z } from "zod";

const registrationAvailabilitySchema = z.enum(["documented", "not_found", "unclear", "not_assessed"]);
const generatedRegistrationAvailabilitySchema = z.enum(["documented", "not_found", "unclear"]);

export const guideContentSchema = z.object({
  appName: z.string().min(1).max(120),
  appDomain: z.string().min(1).max(255),
  summary: z.string().min(1).max(1000),
  registrationAvailability: registrationAvailabilitySchema,
  registrationEvidence: z.string().min(1).max(1200),
  difficulty: z.enum(["low", "moderate", "high", "unknown"]),
  handsOnEstimate: z.string().min(1).max(300),
  elapsedEstimate: z.string().min(1).max(500),
  approval: z.object({
    requirement: z.enum(["none", "conditional", "optional", "unknown"]),
    estimate: z.string().min(1).max(500),
    dependsOn: z.string().min(1).max(500),
  }),
  prerequisites: z.array(z.string().min(1)).max(12),
  steps: z.array(z.object({
    title: z.string().min(1).max(160),
    detail: z.string().min(1).max(1200),
    responsible: z.enum(["agent", "developer"]),
    doneWhen: z.string().min(1).max(500),
  })).min(3).max(14),
  blockers: z.array(z.object({
    title: z.string().min(1).max(160),
    symptom: z.string().min(1).max(600),
    nextStep: z.string().min(1).max(800),
  })).max(10),
  agentCanDo: z.array(z.string().min(1)).max(10),
  developerMustDo: z.array(z.string().min(1)).max(10),
  alternativeNotes: z.array(z.string().min(1)).max(8),
  uncertainties: z.array(z.string().min(1)).max(10),
  evidenceNote: z.string().min(1).max(800),
});

export const generatedGuideContentSchema = guideContentSchema.extend({
  registrationAvailability: generatedRegistrationAvailabilitySchema,
});

export const guideSourceSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().url(),
  kind: z.enum(["official", "grounded", "other"]),
  checkedAt: z.string().min(1),
});

export const oauthGuideSchema = guideContentSchema.extend({
  version: z.literal(1),
  slug: z.string().min(1).max(180),
  origin: z.enum(["curated", "generated"]),
  checkedAt: z.string().min(1),
  sources: z.array(guideSourceSchema).min(1).max(20),
});

export type GuideContent = z.infer<typeof guideContentSchema>;
export type GuideSource = z.infer<typeof guideSourceSchema>;
export type OAuthGuide = z.infer<typeof oauthGuideSchema>;
