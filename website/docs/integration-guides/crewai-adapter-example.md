# CrewAI Adapter Example

This example adds UAICP controls to CrewAI task lifecycle completion.

## Integration Skeleton

```ts
async function finalizeCrewTask(taskCtx: CrewTaskContext) {
  const crewResult = await runCrew(taskCtx);

  const envelope = mapEnvelope(taskCtx);
  const evidence = normalizeCrewEvidence(crewResult.steps);
  const verification = runVerifier(envelope, evidence);

  if (!verification.required_checks_passed) {
    return failSafe('VERIFICATION_FAILED', verification.reason_codes);
  }

  const gate = runPolicyGate({
    envelope,
    writeRisk: taskCtx.writeRisk,
    approvalToken: taskCtx.approvalToken,
  });

  if (gate.decision === 'needs_review') {
    return reviewRequired(gate.reasons);
  }

  if (gate.decision === 'deny') {
    return failSafe('POLICY_BLOCKED', gate.reasons);
  }

  return deliver(crewResult.output);
}
```

## Required CrewAI Mapping

- crew step artifacts -> evidence objects
- task completion -> verify gate entry
- side-effect tasks -> policy gate enforcement

## Reference Fixture

- [workflow-comparison.ts](https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts)
