# Adapter Contract

Adapters connect framework-native runtime behavior to UAICP reliability controls.

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

No delivery should occur before required gates complete.

## Minimum Outcome Codes

- `EVIDENCE_MISSING`
- `VERIFICATION_FAILED`
- `POLICY_BLOCKED`
- `APPROVAL_REQUIRED`
- `IDENTITY_INVALID`
- `TOOL_TIMEOUT`

## Required High-Risk Write Rule

For high-risk write actions, when approval metadata is absent:

- return `needs_review`
- include reason `APPROVAL_REQUIRED`
- block side effects

## Reference Implementation

- `https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts`
