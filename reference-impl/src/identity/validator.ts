import { AgentIdentitySchema, AttestationSchema } from './schemas';
import { AgentIdentity } from '../types/core';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  identity?: AgentIdentity;
}

export class IdentityValidator {
  /**
   * Validates the structure and constraints of an Agent Identity object.
   * @param input - The raw identity object to validate.
   * @param requireAttestation - Whether to strictly require the attestation block.
   */
  static validate(input: unknown, requireAttestation: boolean = true): ValidationResult {
    const result = AgentIdentitySchema.safeParse(input);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }

    const identity = result.data;

    if (requireAttestation) {
      if (!identity.attestation) {
        return {
          valid: false,
          errors: ["Attestation is required but missing"]
        };
      }
      
      // Future: Verify cryptographic evidence here
    }

    return {
      valid: true,
      identity: identity as AgentIdentity
    };
  }

  /**
   * meaningful simulation of verification for reference implementation purposes.
   */
  static async verifyAttestation(attestation: unknown): Promise<boolean> {
     const result = AttestationSchema.safeParse(attestation);
     if (!result.success) return false;
     
     // In a real implementation, this would verify the 'evidence' signature
     // against the 'issuer' public key.
     return true;
  }
}
