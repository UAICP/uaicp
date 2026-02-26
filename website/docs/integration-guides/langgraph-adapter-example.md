# LangGraph Adapter Example

This example shows a concrete LangGraph-style control-point layout for UAICP gating.

## Graph State Contract

```ts
type GraphState = {
  requestId: string;
  traceId: string;
  intent: string;
  toolResults: Array<{ tool: string; output: unknown }>;
  approvalToken?: string;
};
```

## UAICP Control Nodes

```ts
function mapEnvelope(state: GraphState): UaicpEnvelope {
  return {
    uaicp_version: '0.1',
    request_id: state.requestId,
    trace_id: state.traceId,
    message_type: state.intent,
    timestamp: new Date().toISOString(),
    identity: getRuntimeIdentity(),
  };
}

function collectEvidence(state: GraphState): EvidenceObject[] {
  return state.toolResults.map((r, i) => ({
    evidence_id: `${state.requestId}-${i}`,
    evidence_type: 'tool_output',
    content_hash: hashResult(r.output),
    source: r.tool,
  }));
}

function verifyAndGate(state: GraphState): 'deliver' | 'fail_safe' | 'needs_review' {
  const envelope = mapEnvelope(state);
  const evidence = collectEvidence(state);
  const verification = runVerifier(envelope, evidence);

  if (!verification.required_checks_passed) return 'fail_safe';

  const policy = runPolicyGate({
    envelope,
    writeRisk: 'write_high_risk',
    approvalToken: state.approvalToken,
  });

  return policy.decision === 'allow' ? 'deliver' : policy.decision;
}
```

## Node Wiring Pattern

```text
planner -> tools -> uaicp_verify_and_policy_gate -> terminal
```

Only route to terminal delivery when gate output is `deliver`.

## Failure Routing

- verifier failed -> `fail_safe` (`VERIFICATION_FAILED`)
- required evidence missing -> `fail_safe` (`EVIDENCE_MISSING`)
- high-risk write without approval -> `needs_review` (`APPROVAL_REQUIRED`)

## Reference Fixture

Compare outcomes against:

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
