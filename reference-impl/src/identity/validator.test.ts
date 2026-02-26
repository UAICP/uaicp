import { IdentityValidator } from './validator';

describe('IdentityValidator', () => {
  const validIdentity = {
    agent_id: 'agent:test/001',
    owner_id: 'org:test-corp',
    control_class: 'autonomous',
    attestation: {
      issuer: 'uaicp-verifier',
      evidence: 'signed-jwt-token',
      issued_at: new Date().toISOString(),
      trust_tier: 'standard'
    }
  };

  test('should validate a correct identity object', () => {
    const result = IdentityValidator.validate(validIdentity);
    expect(result.valid).toBe(true);
    expect(result.identity).toEqual(validIdentity);
  });

  test('should fail when attestation is missing and required', () => {
    const noAttestation = { ...validIdentity, attestation: undefined };
    const result = IdentityValidator.validate(noAttestation, true);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Attestation is required but missing");
  });

  test('should pass when attestation is missing but not required', () => {
    const noAttestation = { ...validIdentity, attestation: undefined };
    const result = IdentityValidator.validate(noAttestation, false);
    expect(result.valid).toBe(true);
  });

  test('should fail with invalid control class', () => {
    const invalidClass = { ...validIdentity, control_class: 'rogue' };
    const result = IdentityValidator.validate(invalidClass);
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain("Invalid enum value");
  });

  test('should fail with missing required fields', () => {
    const missingFields = { agent_id: '123' }; // missing owner_id, control_class
    const result = IdentityValidator.validate(missingFields);
    expect(result.valid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });
});
