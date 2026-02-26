import { z } from 'zod';

export const ControlClassSchema = z.enum([
  'autonomous',
  'human-supervised',
  'human-directed'
]);

export const AttestationSchema = z.object({
  issuer: z.string().min(1, "Issuer is required"),
  evidence: z.string().min(1, "Evidence is required"),
  issued_at: z.string().datetime({ message: "Invalid ISO 8601 date" }),
  trust_tier: z.string().min(1, "Trust tier is required")
});

export const AgentIdentitySchema = z.object({
  agent_id: z.string().min(1, "Agent ID is required"),
  owner_id: z.string().min(1, "Owner ID is required"),
  control_class: ControlClassSchema,
  attestation: AttestationSchema.optional()
});

export type AgentIdentityInput = z.infer<typeof AgentIdentitySchema>;
