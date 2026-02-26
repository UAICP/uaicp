# Adapter Contract

Adapters are the boundary between framework-native runtime state and UAICP reliability contracts.

## Required Adapter Interface

```ts
type GateDecision = 'allow' | 'deny' | 'needs_review';

interface UaicpAdapter {
  mapEnvelope(input: unknown): UaicpEnvelope;
  collectEvidence(runtimeState: unknown): EvidenceObject[];
  runVerifier(envelope: UaicpEnvelope, evidence: EvidenceObject[]): VerificationReport;
  runPolicyGate(params: {
    envelope: UaicpEnvelope;
    verification: VerificationReport;
    writeRisk: 'read_only' | 'write_low_risk' | 'write_high_risk';
    approvalToken?: string;
  }): { decision: GateDecision; reasons: string[] };
  emitAuditEvent(event: UaicpAuditEvent): void;
}
```

## Required Gate Order

```text
mapEnvelope -> collectEvidence -> runVerifier -> runPolicyGate -> deliver/fail_safe
```

Do not deliver before all required gates complete.

## Minimum Outcome Codes

- `EVIDENCE_MISSING`
- `VERIFICATION_FAILED`
- `POLICY_BLOCKED`
- `APPROVAL_REQUIRED`
- `IDENTITY_INVALID`
- `TOOL_TIMEOUT`

## Required High-Risk Write Rule

For high-risk write actions, if approval metadata is missing:

- return `needs_review`
- include `APPROVAL_REQUIRED`
- block side-effect execution

## Validation Checklist

- envelope fields map deterministically from runtime context
- required evidence objects are present before delivery
- verification failures route to `fail_safe`
- policy gate denies unsafe write actions
- outcomes include machine-readable reason codes

## Concrete Example

Reference implementation finance scenario:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
