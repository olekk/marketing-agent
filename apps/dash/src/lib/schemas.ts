import { z } from "zod";

// --- 1. Audit Schema ---

const SwotBase = z.object({
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  threats: z.array(z.string()).default([]),
});

export const AuditSchema = z.object({
  summary: z.string().default("Analiza w toku..."),
  swot: SwotBase.optional().default({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  }),
});

// --- 2. Strategy Schema ---

export const PersonaSchema = z.object({
  name: z.string().optional().default("Nieznana Persona"),
  goals: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
});

export const StrategySchema = z.object({
  uvp: z.string().nullable().optional().default("Brak zdefiniowanego UVP"),
  brandArchetype: z.string().nullable().optional().default("Nieokreślony"),
  personas: z.array(PersonaSchema).default([]),
});

// --- 3. Roadmap Schema ---

export const RoadmapSchema = z.object({
  keywords: z.array(z.string()).default([]),
  contentPillars: z.array(z.string()).default([]),
  kpi: z
    .object({
      primary: z.string().optional().default("Brak celu"),
    })
    .optional()
    .default({
      primary: "Brak celu",
    }),
});

// --- Export TypeScript Types ---
export type AuditData = z.infer<typeof AuditSchema>;
export type StrategyData = z.infer<typeof StrategySchema>;
export type RoadmapData = z.infer<typeof RoadmapSchema>;
export type PersonaData = z.infer<typeof PersonaSchema>;
