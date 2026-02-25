# CrewAI Adapter Example

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

  if (gate.decision !== 'allow') {
    return failSafe('POLICY_BLOCKED', gate.reasons);
  }

  return deliver(crewResult.output);
}
```

Reference fixture:

- `https://github.com/UAICP/uaicp-reference-impl/blob/main/src/examples/finance/workflow-comparison.ts`
